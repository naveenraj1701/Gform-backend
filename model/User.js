const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [{
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        options: [{
            type: String
        }],
        answers: [{
            type: String,
            required: true
        }],
        image: {
            filename: String,
            filepath: String,
        },
        required: {
            type: Boolean,
            default: false
        }
    }]
})

const UserModel = mongoose.model("UserDetails", UserSchema)

module.exports = UserModel