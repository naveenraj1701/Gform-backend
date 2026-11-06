const express = require("express")
const TestModel = require("../model/Test")
const TestQuestionModel = require("../model/TestQuestions")
const isAuth = require("../middleware/isAuth")
const { getFormRouter } = require("../controller/sharedController")
const { submitFormResponse, getFormResponses } = require("../controller/responseController")

const TestRouter = express.Router()
const TestQuestionsRouter = express.Router()

TestRouter.post("/create-test", isAuth, async (req, res) => {
    try {
        const { title, description } = req.body

        const newTest = new TestModel({
            title,
            description,
            userId: req.userId
        })

        const saveTest = await newTest.save()

        return res.send({
            success: true,
            message: "Form created successfully",
            formId: saveTest._id,
            form: saveTest
        })
    } catch (err) {
        console.log("Error in creating the form", err)

        return res.send({
            success: false,
            message: err.message
        })
    }
})

TestRouter.post("/create-questions", isAuth, async (req, res) => {
    try {
        const { TestId, typeOfQuestions, questions } = req.body

        const form = await TestModel.findOne({
            _id: TestId,
            userId: req.userId
        })

        if (!form) {
            return res.send({
                success: false,
                message: "Form not found"
            })
        }

        const savedQuestions = await TestQuestionModel.findOneAndUpdate(
            { TestId: form._id },
            {
                TestId: form._id,
                typeOfQuestions,
                questions
            },
            {
               returnDocument: 'after', 
                upsert: true,
                runValidators: true,
                
            }
        )

        return res.send({
            success: true,
            message: "Questions saved successfully",
            data: savedQuestions
        })
    } catch (err) {
        console.log("Error saving questions", err)

        return res.send({
            success: false,
            message: err.message
        })
    }
})



TestRouter.get("/get-test-testQuestions", async (req, res) => {
    try {
        const FetchTestQuestion = await TestQuestionModel.find().populate("TestId")

        return res.send({
            success: true,
            message: "Questions fetched successfully",
            FetchTestQuestion
        })
    } catch (err) {
        console.log("Error in fetching test details and questions", err)

        return res.send({
            success: false,
            message: err.message
        })
    }
})

TestRouter.get("/my-forms", isAuth, async (req, res) => {
    try {
        const forms = await TestModel.find({
            userId: req.userId
        }).sort({ _id: -1 })

        return res.send({
            success: true,
            forms
        })
    } catch (err) {
        console.log("Error in showing my forms", err)

        return res.send({
            success: false,
            message: err.message
        })
    }
})

TestRouter.get("/get-forms/:formId", isAuth, async (req, res) => {
    try {
        const { formId } = req.params

        const form = await TestModel.findOne({
            _id: formId,
            userId: req.userId
        })

        if (!form) {
            return res.send({
                success: false,
                message: "Form is not found"
            })
        }

        const questions = await TestQuestionModel.findOne({
            TestId: form._id
        })

        return res.send({
            success: true,
            message: "Form fetched successfully",
            form,
            questions
        })
    } catch (err) {
        console.log("Error fetching form", err)

        return res.send({
            success: false,
            message: err.message
        })
    }
})




TestRouter.put("/update-form/:formId", isAuth, async (req, res) => {
    try {
        const { formId } = req.params
        console.log("hnyuhoioi")
        const { title, description } = req.body
        console.log("iunhfre8fyref", title, description)
        const form = await TestModel.findOneAndUpdate(
            {
                _id: formId,
                userId: req.userId
            },
            {
                title,
                description
            },
            {
                new: true,
                runValidators: true
            }
        )
        console.log("Title, description::", title, description)
        if (!form) {
            return res.send({
                success: false,
                message: "Form is not found"
            })
        }

        return res.send({
            success: true,
            message: "Form updated successfully",
            form
        })
    } catch (err) {
        console.log("Error updating form", err)

        return res.send({
            success: false,
            message: err.message
        })
    }
})

TestRouter.put("/update-questions/:formId", isAuth, async (req, res) => {
    try {
        const { formId } = req.params
        const { typeOfQuestions, questions } = req.body

        const form = await TestModel.findOne({
            _id: formId,
            userId: req.userId
        })

        if (!form) {
            return res.send({
                success: false,
                message: "Form not found"
            })
        }

       

        const updatedQuestions = await TestQuestionModel.findOneAndUpdate(
            { TestId: form._id },
            {
                TestId: form._id,
                typeOfQuestions,
                questions
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        )

        return res.send({
            success: true,
            message: "Questions updated successfully",
            questions: updatedQuestions
        })
    } catch (err) {
        console.log("Error in updating questions", err)

        return res.send({
            success: false,
            message: err.message
        })
    }
})

TestRouter.delete("/delete-form/:formId", async (req, res) => {
    try {
        const { formId } = req.params;

        if (!formId) {
            return res.send({
                success: false,
                message: "Id is not found"
            });
        }

        const form = await TestModel.findById(formId);

        if (!form) {
            return res.send({
                success: false,
                message: "Form not found"
            });
        }

        await TestQuestionModel.deleteMany({ TestId: formId });

        await TestModel.deleteOne({ _id: formId });

        return res.send({
            success: true,
            message: "Form and its questions deleted successfully"
        });

    } catch (err) {
        console.log("Error in deleting the form", err);

        return res.send({
            success: false,
            message: "Trouble in deleting the form"
        });
    }
});


//sharing the form as a link

TestRouter.get("/get-public-form/:formId", getFormRouter)

TestRouter.post("/submit-form-response", submitFormResponse)

TestRouter.get("/get-form-responses/:formId", getFormResponses)

module.exports = {
    TestRouter,
    TestQuestionsRouter
}