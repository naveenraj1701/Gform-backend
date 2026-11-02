
const RegisterModel = require("../model/Register")

const isAuth = async (req, res, next) => {
    try {
        if (!req.session || !req.session.profile) {
            return res.send({
                success: false,
                message: "Kindly login and try again"
            })
        }

        const fetchUser = await RegisterModel.findOne({
            email: req.session.profile.email
        })

        if (!fetchUser) {
            return res.send({
                success: false,
                message: "User not found, kindly register"
            })
        }

        req.userId = fetchUser._id

        next()

    } catch (err) {
        console.log("Error in authentication:", err)

        return res.send({
            success: false,
            message: "Authentication failed"
        })
    }
}

module.exports = isAuth
