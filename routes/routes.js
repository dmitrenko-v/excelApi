const express = require("express")
const Sheet  = require("../models/models.js")
const middleware = require("../middleware/middleware.js")
const router = express.Router()


router.get("/:sheet_id", async function(req, res) {
    try {
        const result = await Sheet.find({name: req.params.sheet_id.toLowerCase()}).select("cells")
        const resp = {}
        result[0].cells.forEach((cell) => resp[cell.cellName] = {value: cell.cellValue, result: cell.cellResult})
        res.status(200).json(resp)
    } catch(err) { 
        res.status(404).json({result:"ERROR"})
    }
})

router.post("/:sheet_id/:cell_id", 
middleware.validateSheetId, 
middleware.validateCellId, 
middleware.validateReqParams, 
middleware.insertIntoDB, 
function(req, res){ res.status(201).json(req.body) })


router.get("/:sheet_id/:cell_id", async function(req, res) {
    try {
        const result = await Sheet.find({name: req.params.sheet_id.toLowerCase()}).select({cells: {$elemMatch: {cellName: req.params.cell_id.toLowerCase()}}})
        const cell = result[0].cells[0]
        res.status(200).json({value: cell.cellValue, result: cell.cellResult})
    } catch(err) {
        res.status(404).json({result:"ERROR"})
    }
})

module.exports = router