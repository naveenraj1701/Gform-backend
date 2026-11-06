const mongoose = require("mongoose")

const FormResponseSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: "Test Details", required: true },
    answers: { type: mongoose.Schema.Types.Mixed, required: true },
    submittedAt: {type: Date, default: Date.now}
})

const FormResponseModel = mongoose.model("FormResponses", FormResponseSchema)

module.exports = FormResponseModel