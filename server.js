
const express = require("express")
require("dotenv").config()
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const session = require("express-session")
const connectDBsession = require("connect-mongodb-session")(session)

const UserRoute = require("./Routers/userRouter")
const { TestRouter, TestQuestionsRouter } = require("./Routers/testRouter")
const MulterRouter = require("./Routers/multerRouter")
const RegisterRouter = require("./Routers/registerRouter")
const ProfileRouter = require("./Routers/profileRouter")
const GeminiRouter = require("./Routers/geminiRouter")

const app = express()

const port = process.env.PORT || 4001

app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://gform-frontend.onrender.com"
    ],
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/upload", express.static("upload"))

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected Successfully"))
    .catch(err => console.log("Error in connecting to MongoDB", err))

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

const store = new connectDBsession({
    uri: process.env.MONGODB_URI,
    collection: "Sessions"
})

store.on("error", err => {
    console.log("Session store error:", err)
})

app.use(session({
    store: store,
    name: "connect.sid",
    secret: process.env.secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    }
}))



app.use(UserRoute)
app.use("/", TestRouter)
app.use("/", TestQuestionsRouter)
app.use(GeminiRouter)
app.use(MulterRouter)
app.use(RegisterRouter)
app.use(ProfileRouter)

app.listen(port, () => {
    console.log("Server is running on", port)
})
