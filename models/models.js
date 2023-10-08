const mongoose = require("mongoose")


const sheetSchema = mongoose.Schema({
    name: String, 
    cells: [{ cellName: String, cellValue: String, cellResult: String}]
})

const Sheet = mongoose.model("Sheet", sheetSchema)

module.exports = Sheet 