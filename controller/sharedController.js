const TestModel = require("../model/Test")
const TestQuestionModel = require("../model/TestQuestions")



const getFormRouter = async (req, res) => {
    try {
        const { formId } = req.params



        const form = await TestModel.findById(formId)

        if (!form)
            return res.send({ success: false, message: "Form not found" })

        const questions = await TestQuestionModel.findOne({
            TestId: formId
        })

        if (!questions)
            return res.send({ success: false, message: "Form questions not found" })

        return res.send({ success: true, form, questions })
    }
    catch (err) {
        res.send({ success: false, message: "Trouble in sharing the form" })
        console.log("Error in sharing the form", err)
    }
}

module.exports = { getFormRouter }