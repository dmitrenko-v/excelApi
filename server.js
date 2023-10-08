const dotenv = require("dotenv").config()
const app = require("./app")
const mongoose = require("mongoose")

const PORT = process.env.PORT || 8080 

mongoose.connect(process.env.DATABASE_URL)

app.listen(PORT)