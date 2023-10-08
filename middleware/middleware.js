const Sheet  = require("../models/models")
const { evalExpr, updateDependencies } = require("../service/service.js")

module.exports = {
    insertIntoDB: async (req, res, next) => {
        const { sheet_id, cell_id } = req.params 
        const { value, result } = req.body 
        try {
            const currentSheet = await Sheet.find({name: sheet_id})
            // creating new sheet and insert a new cell if sheet does not exist in DB
            if (!currentSheet || currentSheet.length == 0) {
                const sheet = new Sheet({
                    name: sheet_id,
                    cells: [{cellName: cell_id, cellValue: value, cellResult: result}]
                })
                await sheet.save()
                next()
            } 
            else {
                const currentCell = (await Sheet.findOne({name: sheet_id}).select({cells: {$elemMatch: {cellName: {$eq: cell_id}}}})).cells[0]
                // creating new cell and insert data if cell does not exist in given sheet, update cell and dependencies else
                if (!currentCell || currentCell.length == 0) {
                    await Sheet.updateOne({name: sheet_id}, {$push: {cells:{cellName: cell_id, cellValue: value, cellResult: result}}})
                } 
                else {
                    currentSheet[0].cells.id(currentCell._id).cellValue = value 
                    currentSheet[0].cells.id(currentCell._id).cellResult = result 
                    await updateDependencies(currentSheet[0], cell_id)
                    await currentSheet[0].save()
                } 
        }
        next()
        } catch(err){
            console.error(err)
            req.body.result = "ERROR"
            res.status(422).json(req.body)
    } },

    validateReqParams: async (req, res, next) => {
        let result, value; 
        try {
            if (!(Object.keys(req.body).length == 1)){
                throw new Error()
            }
            req.body.value = req.body.value.toLowerCase()
            value = req.body.value 
            
            if (value.startsWith("=")) {
                const sheet = await Sheet.find({name: req.params.sheet_id})
                req.body.result = await evalExpr(sheet[0], value.slice(1))
                next()
            }
            
            else if (typeof value == "string"|| typeof value == "number" ){
                result = req.body.value
                req.body.result = result
                next()
            }
            else {
                throw new Error()
            } 

        } catch(err) {
            req.body.result = "ERROR"
            res.status(422).json(req.body)
        }

    },

    validateSheetId: (req, res, next) => {  
        const validFormat = /^(?!History$)(?!.*[\\\/?*:[\]])(?!^'|'$)(?!^ | $).{1,31}$/
        if (validFormat.test(req.params.sheet_id)){
            req.params.sheet_id = req.params.sheet_id.toLowerCase()
            next()
        }
        else {
            req.body.result = "ERROR"
            res.status(422).json(req.body)
        }  
    },  

    validateCellId: (req, res, next) => {
        const validFormat = /^[a-zA-Z_\\][a-zA-Z0-9_.]{0,254}$/g
        if (validFormat.test(req.params.cell_id)){
            req.params.cell_id = req.params.cell_id.toLowerCase()
            next()
        }
        else {
            req.body.result = "ERROR"
            res.status(422).json(req.body)
        }
    } 
}