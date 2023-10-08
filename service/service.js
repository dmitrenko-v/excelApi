function evalAlgo(value) {

    const precedence = {
        "+": 1, 
        "-": 1, 
        "*": 2, 
        "/": 2
    }

    const valueStack = []
    const operatorsStack = []
    const tokens = value.match(/(?:\d+\.\d+|\d+|\.\d+|[+\-*/()])/g)
    let negativeFlag = false // this flag helps to maintain negative variables 

    function applyOperator() {
        const operator = operatorsStack.pop();
        const rightOperand = valueStack.pop();
        const leftOperand = valueStack.pop();
    
        switch (operator) {
          case '+':
            valueStack.push(leftOperand + rightOperand)
            break;
          case '-':
            valueStack.push(leftOperand - rightOperand)
            break;
          case '*':
            valueStack.push(leftOperand * rightOperand)
            break;
          case '/':
            if (rightOperand === 0) {
              throw new Error();
            }
            valueStack.push(leftOperand / rightOperand)
            break;
        }

    }
    for (const [index, token] of tokens.entries()) {
        if (!isNaN(token)) {
          if (negativeFlag) {
            valueStack.push(-parseFloat(token))
            negativeFlag = false
          } 
          else {
            valueStack.push(parseFloat(token))
          }
        } else if (token === '(') {
          operatorsStack.push(token)
        } else if (token === ')') {
          // If it's a closing parenthesis, apply operatorsStackil an open parenthesis is encountered
          while (operatorsStack.length > 0 && operatorsStack.at(-1) !== '(') {
            applyOperator()
          }
          if (operatorsStack.at(-1) === '(') {
            operatorsStack.pop(); // Remove the open parenthesis
          }
          // setting flag that value that comes next should be inserted as negative in value stack
        } else if (token == "-" && ((operatorsStack.at(-1) == "(" && tokens[index+2] == ")") || (operatorsStack.at(-1) == "(" && operatorsStack.at(-2) in precedence) )){
            negativeFlag = true
        } else if (token in precedence) {
          // If it's an operator
          while ( 
            operatorsStack.length > 0 &&
            precedence[token] <= precedence[operatorsStack.at(-1)]
          ) {
            applyOperator()
          }
          operatorsStack.push(token);
        } else {
          throw new Error("Error in formula")
        }
      }
      while (operatorsStack.length > 0) {
        applyOperator()
      }
    const result = valueStack[0]
    if (!result || isNaN(result)){
        throw new Error("Error in formula")
    }
    return result
}

async function evalExpr(sheet, value){
    // extracting cell names from formula
    const variablePattern = /[a-zA-Z_\\][a-zA-Z0-9_.]{0,254}/g;
    const variables = value.match(variablePattern)
    let results = []
    let matches = []
    // querying cell results from DB and replacing cell names with cell results  
    if (variables && variables.length != 0){
        matches = sheet.cells.filter((cell) => variables.includes(cell.cellName))
        // const matches = await sheet.where({cells: {$elemMatch: {cellName: {$in: variables}}}})
        results = matches.map((cell) => {
          // we enclose negative results in brackets to avoid cases like "2+-3" while updating dependencies
          if (cell.cellResult.startsWith("-")) {
            return "(" + cell.cellResult + ")"
          } 
          else {
            return cell.cellResult
          }
        })
        variables.forEach((variable, index) => {value = value.replaceAll(variable, results[index])})
    }
    // condition for inserting string values
    if (results && results.length == 1 && isNaN(results[0]) && variables && variables.length == 1 && value == `${results[0]}`) {
      result = results[0]
    }
    else{
      result = evalAlgo(value).toString()
    }
    return result
}   


async function updateDependencies(sheet, cell_id) {
  const dependentCells = sheet.cells.filter((cell) => cell.cellValue.includes(cell_id))
  if (!dependentCells || dependentCells.length == 0) {
    return  
  } 
  const dependentCellsNames = []
  for (cell of dependentCells) {
      dependentCellsNames.push(cell.cellName)
      let newResult = await evalExpr(sheet, cell.cellValue.slice(1))
      sheet.cells.find(sheetCell => sheetCell.cellValue == cell.cellValue).cellResult = newResult 
  }
  
  for (cell of dependentCellsNames) {
      await updateDependencies(sheet, cell)
  } 
  
}
module.exports = { evalExpr, updateDependencies } 