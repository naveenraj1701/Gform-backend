const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const { randomInt } = require("crypto")
const EmailOtpModel = require("../model/EmailOtp")
const RegisterModel = require("../model/Register")

const SendOtpRouter = async (req, res) => {
    try {
        const { name, email } = req.body || {}

        if (!name || !email) {
            return res.send({
                success: false,
                message: "Name and email are required"
            })
        }

        const normalizedEmail = email.trim().toLowerCase()

        const existingEmail = await RegisterModel.findOne({ email: normalizedEmail })
        
        if (existingEmail)
            return res.send({success: false, message: "Email already registered"})

        await EmailOtpModel.deleteMany({
            expiresAt: { $lt: new Date() },
            verified: false
        })

        await EmailOtpModel.deleteOne({
            email: normalizedEmail
        })

        const otp = randomInt(100000, 1000000)
        const hashedOtp = await bcrypt.hash(String(otp), 10)

        const newOtp = new EmailOtpModel({
            email: normalizedEmail,
            otp: hashedOtp,
            expiresAt: new Date(Date.now() + 2 * 60 * 1000),
            attempts: 0,
            verified: false,
            verifiedAt: null
        })

        await newOtp.save()

        const trans = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS
            }
        })

        try {
            await trans.sendMail({
                from: process.env.SMTP_EMAIL,
                to: normalizedEmail,
                subject: "OTP Verification",
                html: `
                    <h2>Hi ${name}</h2>
                    <p>Your OTP is <strong>${otp}</strong></p>
                    <p>This OTP expires in 2 minutes.</p>
                `
            })
        } catch (err) {
            await EmailOtpModel.deleteOne({
                email: normalizedEmail,
                verified: false
            })
            throw err
        }

        return res.send({
            success: true,
            message: "OTP sent successfully"
        })
    } catch (err) {
        console.log("Error in sending OTP", err)

        return res.send({
            success: false,
            message: "Trouble in sending OTP"
        })
    }
}

const verifyOtpRouter = async (req, res) => {
    try {
        const { email, otp } = req.body || {}

        if (!email || !otp) {
            return res.send({
                success: false,
                message: "Enter email and OTP correctly"
            })
        }

        const normalizedEmail = email.trim().toLowerCase()

        const fetchEmail = await EmailOtpModel.findOne({
            email: normalizedEmail
        })

        if (!fetchEmail) {
            return res.send({
                success: false,
                message: "OTP not found. Please request a new OTP."
            })
        }

        if (fetchEmail.verified) {
            return res.send({
                success: true,
                message: "Email is already verified"
            })
        }

        if (Date.now() > fetchEmail.expiresAt.getTime()) {
            await EmailOtpModel.deleteOne({
                email: normalizedEmail,
                verified: false
            })

            return res.send({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            })
        }

        if (fetchEmail.attempts >= 5) {
            await EmailOtpModel.deleteOne({
                email: normalizedEmail,
                verified: false
            })

            return res.send({
                success: false,
                message: "Maximum attempts reached. Please request a new OTP."
            })
        }

        const isMatch = await bcrypt.compare(
            String(otp),
            fetchEmail.otp
        )

        if (!isMatch) {
            const updatedOtp = await EmailOtpModel.findOneAndUpdate(
                {
                    email: normalizedEmail,
                    verified: false,
                    attempts: { $lt: 5 },
                    expiresAt: { $gt: new Date() }
                },
                {
                    $inc: { attempts: 1 }
                },
                {
                    new: true
                }
            )

            if (!updatedOtp) {
                return res.send({
                    success: false,
                    message: "OTP is no longer valid. Please request a new OTP."
                })
            }

            if (updatedOtp.attempts >= 5) {
                await EmailOtpModel.deleteOne({
                    email: normalizedEmail,
                    verified: false
                })

                return res.send({
                    success: false,
                    message: "Maximum attempts reached. Please request a new OTP."
                })
            }

            return res.send({
                success: false,
                message: `Invalid OTP. ${5 - updatedOtp.attempts} attempts remaining.`
            })
        }

        const verifiedOtp = await EmailOtpModel.findOneAndUpdate(
            {
                email: normalizedEmail,
                otp: fetchEmail.otp,
                verified: false,
                expiresAt: { $gt: new Date() },
                attempts: { $lt: 5 }
            },
            {
                $set: {
                    verified: true,
                    verifiedAt: new Date(),
                    otp: "VERIFIED"
                }
            },
            {
                new: true
            }
        )

        if (!verifiedOtp) {
            return res.send({
                success: false,
                message: "OTP is no longer valid. Please request a new OTP."
            })
        }

        return res.send({
            success: true,
            message: "Email verified successfully"
        })
    } catch (err) {
        console.log("Error in verifying OTP", err)

        return res.send({
            success: false,
            message: "Trouble in verifying OTP"
        })
    }
}

module.exports = {
    SendOtpRouter,
    verifyOtpRouter
}