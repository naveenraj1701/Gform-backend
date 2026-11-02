const mongoose = require("mongoose")

const EmailOtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date,
        default: null
    }
})

const EmailOtpModel = mongoose.model("EmailOtpDetails", EmailOtpSchema)

module.exports = EmailOtpModel