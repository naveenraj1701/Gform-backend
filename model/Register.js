const mongoose = require("mongoose")


const RegisterSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    pwd: { type: String, required: true },
    cpwd: { type: String, required: true },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    }
})

const RegisterModel = mongoose.model("RegisterDetails", RegisterSchema)

module.exports = RegisterModel