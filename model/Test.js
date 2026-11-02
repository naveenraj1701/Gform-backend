const mongoose = require("mongoose")

const TestSchema = mongoose.Schema({
    title: { type: String, required: true },
    Date: { type: Date, default: Date.now },
    description: { type: String, default: "" },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegisterDetails",
        required: true
    }
})

const TestModel = mongoose.model("Test Details", TestSchema)

module.exports = TestModel