const mongoose = require("mongoose")

const multerSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
        filename: { type: String, required: true },
        filepath: {type: String, required: true}
    }
})

const multerModel = mongoose.model("Image Details", multerSchema)

module.exports = multerModel