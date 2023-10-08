const express = require("express")

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const routes = require("./routes/routes.js")
app.use("/api/v1", routes)

module.exports = app 