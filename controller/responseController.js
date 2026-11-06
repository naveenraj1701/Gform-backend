const FormResponseModel = require("../model/FormResponse")
const TestQuestionModel = require("../model/TestQuestions")



const submitFormResponse = async (req, res) => {
    try {
        const { formId, answers } = req.body

        if (!formId || !answers)
            return res.send({ success: false, message: "Answers are missing" })

        const response = new FormResponseModel({
            formId,
            answers
        })
        await response.save()

        return res.send({ success: true, message: "Your response submitted successfully" })
    } catch (err) {
        console.log("Error submitting response:", err)

        res.send({
            success: false,
            message: "Unable to submit response"
        })
    }
}

const getFormResponses = async (req, res) => {
    try {
        const { formId } = req.params

        const responses = await FormResponseModel.find({ formId }).sort({
    submittedAt: -1
})

        const questions = await TestQuestionModel.findOne({TestId: formId})

        return res.send({ success: true, responses, questions: questions ? questions.questions : [] })
    } catch (err) {
        console.log("Error fetching responses:", err)

        res.send({
            success: false,
            message: "Unable to fetch responses"
        })
    }

}

module.exports = { submitFormResponse, getFormResponses }