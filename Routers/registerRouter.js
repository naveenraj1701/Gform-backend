const express = require("express")
const RegisterModel = require("../model/Register")
const isAuth = require("../middleware/isAuth")
const bcrypt = require("bcrypt")
const RegisterRouter = express.Router()
const nodemailer = require("nodemailer")
const { SendOtpRouter, verifyOtpRouter } = require("../controller/otpController")


RegisterRouter.post("/create-register", async (req, res) => {
    try {
        const { name, email, phone, pwd, cpwd } = req.body

        if (!name || !email || !phone || !pwd || !cpwd)
            return res.send({ success: false, message: "Provide all details" })

        const hashedPassword = await bcrypt.hash(pwd, 10)

        const newRegister = new RegisterModel({
            name,
            email,
            phone,
            pwd: hashedPassword,
            cpwd
        })

        const saveRegister = await newRegister.save()

        if (!saveRegister)
            return res.send({ success: false, message: "Trouble in user registration" })

        return res.send({ success: true, message: "User registered Successfully" })

    }
    catch (err) {
        console.log("Error in registering user", err);

    }
})



RegisterRouter.post("/login", async (req, res) => {
    try {
        const { email, pwd } = req.body

        if (!email || !pwd) {
            return res.send({
                success: false,
                message: "Provide All Details"
            })
        }

        const fetchUser = await RegisterModel.findOne({ email })

        if (!fetchUser) {
            return res.send({
                success: false,
                message: "User not found, Kindly register"
            })
        }

        const passwordMatch = await bcrypt.compare(pwd, fetchUser.pwd)

        if (!passwordMatch) {
            return res.send({
                success: false,
                message: "Password is invalid"
            })
        }

        req.session.profile = {
            _id: String(fetchUser._id),
            name: fetchUser.name,
            email: fetchUser.email,
            phone: fetchUser.phone,
            role: fetchUser.role
        }

       
        req.session.save((err) => {
         

            if (err) {
                return res.send({
                    success: false,
                    message: "Session could not be saved"
                })
            }

            console.log("Session saved successfully")

            return res.send({
                success: true,
                message: "Login Successful",
                user: {
                    _id: fetchUser._id,
                    name: fetchUser.name,
                    email: fetchUser.email,
                    role: fetchUser.role
                }
            })
        })

    } catch (err) {
        console.log("Error in login to user:", err)

        return res.send({
            success: false,
            message: "Login failed"
        })
    }
})


RegisterRouter.get("/profile", async (req, res) => {
    try {
        if (!req.session || !req.session.profile) {
            return res.send({
                success: false,
                message: "Please login first"
            })
        }
        console.log(req.session.profile);

        return res.send({
            success: true,
            user: req.session.profile
        })
    }
    catch (err) {
        console.log("Error fetching profile", err)

        return res.send({
            success: false,
            message: "Unable to fetch profile"
        })
    }
})

RegisterRouter.post("/send-otp", SendOtpRouter)

RegisterRouter.post("/verify-otp", verifyOtpRouter)

module.exports = RegisterRouter