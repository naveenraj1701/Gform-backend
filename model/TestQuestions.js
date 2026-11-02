const mongoose = require("mongoose");

const TestQuestionsSchema = new mongoose.Schema({
    TestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test Details",
        required: true
    },
    typeOfQuestions: {
        type: String,
        required: true
    },
    questions: [
        {
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            answers: {
                type: [String],
                default: []
            },
            required: {
                type: Boolean,
                default: false
            },
            image: {
                filename: {
                    type: String,
                    default: ""
                },
                filepath: {
                    type: String,
                    default: ""
                }
            }
        }
    ]
});

const TestQuestionModel = mongoose.model(
    "Test Questions",
    TestQuestionsSchema
);

module.exports = TestQuestionModel;