const express = require("express");
const ProfileRouter = express.Router();
const ProfileModel = require("../model/Profile");
const RegisterModel = require("../model/Register");
const isAuth = require("../middleware/isAuth");
const multer = require("multer");
const cloudinary = require("../config/cloudinary")
const { Readable } = require("stream");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});


ProfileRouter.get("/fetch-profile", isAuth, async (req, res) => {
    try {
        let profile = await ProfileModel.findOne({
            userId: req.userId
        })

        if (!profile) {
            const registeredUser = await RegisterModel.findById(req.userId)

            if (!registeredUser) {
                return res.send({
                    success: false,
                    message: "Registered user not found"
                })
            }

            profile = await ProfileModel.create({
                userId: req.userId,
                name: registeredUser.name || "",
                email: registeredUser.email || "",
                phone: registeredUser.phone || "",
                imageUrl: ""
            })
        }

        return res.send({
            success: true,
            user: profile
        })

    } catch (err) {
        console.log("Error fetching profile:", err)

        return res.send({
            success: false,
            message: "Failed to fetch profile"
        })
    }
})


ProfileRouter.put(
    "/upload-profile-image",
    isAuth,
    upload.single("image"),
    async (req, res) => {
        try {
            const { name, email, phone } = req.body;

            const updateData = {
                name,
                email,
                phone,
                userId: req.userId
            };

            if (req.file) {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "profile-images" },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );

                    Readable.from(req.file.buffer).pipe(stream);
                });

                updateData.imageUrl = result.secure_url;
            }

            const profile = await ProfileModel.findOneAndUpdate(
                { userId: req.userId },
                { $set: updateData },
                {
                    new: true,
                    upsert: true,
                    returnDocument: "after",
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );

            res.send({
                success: true,
                message: "Profile updated successfully",
                user: profile
            });
        } catch (err) {
            console.log("Error updating profile:", err);

            res.send({
                success: false,
                message: "Failed to update profile"
            });
        }
    }
);

module.exports = ProfileRouter;