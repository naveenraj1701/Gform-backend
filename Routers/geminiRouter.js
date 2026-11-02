const express = require("express")
const multer = require("multer")
const fs = require("fs")
const { GoogleGenAI } = require("@google/genai")
const { PDFParse } = require("pdf-parse")

const GeminiRouter = express.Router()

const upload = multer({
    dest: "gemini-upload/"
})

const ai = new GoogleGenAI({
    apiKey: process.env.Google_Gen_AI
})

const formSchema = {
    type: "object",
    properties: {
        title: {
            type: "string"
        },
        description: {
            type: "string"
        },
        questions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {
                        type: "string"
                    },
                    type: {
                        type: "string",
                        enum: [
                            "text",
                            "radio",
                            "checkbox",
                            "image"
                        ]
                    },
                    answers: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    },
                    required: {
                        type: "boolean"
                    }
                },
                required: [
                    "name",
                    "type",
                    "answers",
                    "required"
                ]
            }
        }
    },
    required: [
        "title",
        "description",
        "questions"
    ]
}


GeminiRouter.post("/generate-form", upload.single("document"), async (req, res) => {
    try {
        if (!req.file) {
            return res.send({
                success: false,
                message: "Please upload a PDF"
            })
        }


        const fileBuffer = fs.readFileSync(req.file.path)

        const parser = new PDFParse({
            data: fileBuffer
        })

        const pdfData = await parser.getText()

        const extractText = pdfData.pages
            .map(page => page.text)
            .join("\n")


        await parser.destroy()

        fs.unlinkSync(req.file.path)


const prompt = `
Extract the form information from this document.

Return:
1. The form title
2. The form description
3. Every question in the document
4. The question type
5. The answer choices/options for each question
6. Whether the question is required

Rules:

- Use "text" for questions where the user needs to enter a text answer.
- Use "radio" for questions where the user can select only ONE answer.
- Use "checkbox" for questions where the user can select MULTIPLE answers.
- Use "image" only when the question asks the user to upload an image.
- Put the actual answer choices from the document inside "answers".
- Keep "answers" as an empty array for text and image questions when there are no answer choices.
- Do NOT return an "options" field.
- Do NOT create questions that are not present in the document.
- Do NOT create answer choices that are not present in the document.
- Preserve the exact order of the questions.
- Preserve the order of the answer choices.
- If the document does not clearly indicate that a question is required, set "required" to false.
- Return only the information that can be identified from the document.

Examples:

If the document contains:

What is your name?
____________________

Return:
{
  "name": "What is your name?",
  "type": "text",
  "answers": [],
  "required": false
}

If the document contains:

What is your gender?
○ Male
○ Female
○ Other

Return:
{
  "name": "What is your gender?",
  "type": "radio",
  "answers": ["Male", "Female", "Other"],
  "required": false
}

If the document contains:

Select your skills:
☐ HTML
☐ CSS
☐ JavaScript
☐ React

Return:
{
  "name": "Select your skills:",
  "type": "checkbox",
  "answers": ["HTML", "CSS", "JavaScript", "React"],
  "required": false
}

If the document contains:

Upload your profile photo.

Return:
{
  "name": "Upload your profile photo.",
  "type": "image",
  "answers": [],
  "required": false
}

PDF TEXT:
${extractText}
`
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: formSchema
            }

        })

        const result = JSON.parse(response.text)

        return res.send({ success: true, data: result })
    }
    catch (err) {
        console.log("Error in connecting to gemini", err);
        return res.send({
            success: false,
            message: "Unable to generate form"
        })
    }
})

module.exports = GeminiRouter