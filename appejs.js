const express = require("express")
const UserRoute = require("./Routers/userRouter")
require('dotenv').config()
const path = require("path")



//Instance create

const app = express()
const port = process.env.PORT


app.use(express.json())
app.use(express.urlencoded({ extended: true }))






app.use(UserRoute)

app.listen(port, () => {
    console.log("Server is running on", port);
    
})

