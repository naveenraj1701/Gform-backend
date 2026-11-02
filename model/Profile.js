const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    imageUrl: {
        type: String,
        default: ""
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegisterDetails",
        required: true,
        unique: true
    }
});

module.exports = mongoose.model("ProfileDetails", ProfileSchema);