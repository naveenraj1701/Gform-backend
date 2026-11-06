const express = require("express")
const UserModel = require("../model/User")
const puppeteer = require("puppeteer")
const path = require("path")
const ejs = require("ejs")
const TestModel = require("../model/Test")
const TestQuestionModel = require("../model/TestQuestions")

const UserRoute = express.Router()

UserRoute.post("/create-form", async (req, res) => {
    try {
        const { title, description, questions } = req.body


        const newForm = new UserModel({
            title,
            description,
            questions
        })

        const savedForm = await newForm.save()

        res.send({
            success: true,
            message: "Form created successfully",
            formId: savedForm._id,
            questions: savedForm.questions
        })
    }
    catch (err) {
        console.log("Error in creating the form", err)

        res.send({
            success: false,
            message: "Error in creating the form"
        })
    }
})


UserRoute.put("/updates-form/:formId", async (req, res) => {
    try {
        const { formId } = req.params
        const { title, description, questions } = req.body
        if (!formId)
            return res.send({ success: false, message: "Form is not found" })

        const updateForm = await UserModel.findByIdAndUpdate(formId,
            {
                title,
                description,
                questions
            },
            { returnDocument: "after" }
        )
      
        if (!updateForm)
            return res.send({ success: false, message: "Form is not found" })

        return res.send({
            success: true, message: "Form updated successfully",
            questions: updateForm.questions
        })

    }
    catch (err) {
        console.log("Error in updating the form");
        return res.send({ success: false, message: "Trouble in update form" })

    }
})

UserRoute.post("/copy-question/:formId/:questionId", async (req, res) => {
    try {
        const { formId, questionId } = req.params

        if (!formId)
            return res.send({ success: false, message: "Id is missing" })

        if (!questionId)
            return res.send({ success: false, message: "Question is missing" })

        const form = await UserModel.findById(formId)

        if (!form)
            return res.send({ success: false, message: "Form not found" })

        const questionIndex = form.questions.findIndex(
            (q) => q._id.toString() === questionId
        )

        if (questionIndex === -1)
            return res.send({ success: false, message: "Question not found" })

        const copiedQuestion = {
            name: form.questions[questionIndex].name,
            type: form.questions[questionIndex].type,
            options: [...form.questions[questionIndex].options],
            answers: [...form.questions[questionIndex].answers],
            required: form.questions[questionIndex].required
        }

        form.questions.splice(questionIndex + 1, 0, copiedQuestion)

        const savedForm = await form.save()

        res.send({
            success: true,
            message: "Question copied successfully",
            questions: savedForm.questions
        })
    }
    catch (err) {
        console.log("Error in copying the question", err)

        res.send({
            success: false,
            message: "Trouble in copying the question"
        })
    }
})


UserRoute.delete("/delete-question/:formId/:questionId", async (req, res) => {
    try {
        const { formId, questionId } = req.params

        if (!formId)
            return res.send({ success: false, message: "Id is not found" })

        const result = await UserModel.updateOne({ _id: formId },
            {
                $pull: {
                    questions: { _id: questionId }
                }
            }
        )
        if (!result)
            return res.send({ success: false, message: "Question is not deleted" })


        return res.send({ success: true, message: "Question is deleted successfully" })

    }
    catch (err) {
        console.log("Error in deleting the question", err);

    }
})


//Download the form in pdf//

UserRoute.get("/download-form/:formId", async (req, res) => {
    let browser

    try {
        const { formId } = req.params

        const form = await TestModel.findById(formId)

        if (!form) {
            return res.send({
                success: false,
                message: "Form is not found"
            })
        }

        const questionData = await TestQuestionModel.findOne({
            TestId: form._id
        })

        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        })

        const page = await browser.newPage()

        const html = await ejs.renderFile(
            path.join(__dirname, "../views/home.ejs"),
            {
                title: form.title,
                description: form.description || "",
                questions: questionData ? questionData.questions : []
            }
        )

        await page.setContent(html, {
            waitUntil: "networkidle0"
        })

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true
        })

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="form.pdf"'
        )

        return res.send(pdf)

    } catch (err) {
        console.log("Error in downloading the form:", err)

        return res.send({
            success: false,
            message: "Trouble in downloading the form"
        })

    } finally {
        if (browser) {
            await browser.close()
        }
    }
})

module.exports = UserRoute