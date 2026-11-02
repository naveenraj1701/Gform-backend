const express = require("express")
const multerModel = require("../model/Multer")

const MulterRouter = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const uploads = 'upload'


if (!fs.existsSync(uploads)) {
    fs.mkdirSync(uploads)
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
})

const filter = (req, file, cb) => {
    const allowedType = ['.png', '.jpg', '.jpeg', '.pdf']

    const extType = path.extname(file.originalname).toLowerCase()

    if (allowedType.includes(extType)) {
        cb(null, true)
    }
    else {
        cb(new Error("Only .png, .jpg, .pdf or .jpeg are allowed"), false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: filter,
    limits: 5 * 1024
})


MulterRouter.post("/upload-images", upload.single("image"), async (req, res) => {
    try {
        const { title, description  } = req.body

        const uploadFile = req.file

        if (!title || !description || !uploadFile)
            return res.send({ success: false, message: "All fields are required" })


        let lastUser = await multerModel.findOne().sort({ id: -1 })

        let userId = lastUser ? lastUser.id + 1 : 1

        const imageField = {
            filename: uploadFile.filename,
            filepath: uploadFile.path.replace(/\\/g, "/")
        }

        const newUpload = new multerModel({
            title: title,
            description: description,
            image: imageField
        })

        const saveUpload = await newUpload.save()

        if (!saveUpload)
            return res.send({ success: false, message: "Images is not uploaded" })

        return res.send({ success: true, message: "Image uploaded successfully",  image: saveUpload.image })
    }
    catch (err) {
        console.log("Error in uploading the image", err);
        return res.send({ success: false, message: "Trouble in uploading the image" })

    }
})

module.exports = MulterRouter




