# Excel-like API

It is implementation of excel-like api. You can create spreadsheets and cells with it. 

Cell value can contain formulas starting with "=" or just string, integer or float value(negative numeric values supported).

Formulas can use references to other cells. Formulas can contain +, -, /, * and () operators

Endpoints: 
+ POST "/api/v1/:sheet_id/:cell_id" accept params {“value”: "<some value>"} implements UPSERT strategy (update or insert) for both sheet_id and cell_id. 
    1. Response with 201 and {"value": <value in request>, "result": <result of value>} if value is OK
    2. Response with 422 and {"value"; <value in request>, "result": "ERROR"} is value is not OK
        - POST /api/v1/sheet1/var1 with {“value:”: “0”}
          Response: {“value:”: “0”, “result”: “0”}
        - POST /api/v1/sheet1/var1 with {“value:”: “1”}
          Response: {“value:”: “1”, “result”: “1”}
        - POST /api/v1/sheet1/var2 with {“value”: “2”} 
          Response: {“value:”: “2”, “result”: “2”}
        - POST /api/v1/sheet1/var3 with {“value”: “=var1+var2”}
          Response: {“value”: “=var1+var2”, “result”: “3”}
        - POST /api/v1/sheet1/var4 with {“value”: “=var3+var4”}
          Response: {“value”: “=var3+var4”, “result”: “ERROR”}
+ GET "/api/v1/:sheet_id/:cell_id"
    1. Response with 200 if cell is present 
    2. 404 otherwise
        - GET /api/v1/sheet1/var1
        Response: {“value”: “1”, result: “1”}
        - GET /api/v1/sheet1/var1
        Response: {“value”: “2”, result: “2”}
        - GET /api/v1/sheet1/var3
        Response: {“value”: “=var1+var2”, result: “3”}
+ GET "/api/v1/:sheet_id"
    1. Response with 200 if sheet is present 
    2. 404 otherwise
        - GET "/api/v1/sheet1" 
        Response:
        {
        “var1”: {“value”: “1”, “result”: “1”},
        “var2”: {“value”: “2”, “result”: “2”},
        “var3”: {“value”: “=var1+var2”, “result”: “3”}
        }



There are validation for sheet_id according to [excel spreadsheet naming rules](https://support.microsoft.com/en-us/office/rename-a-worksheet-3f1f7148-ee83-404d-8ef0-9ff99fbad1f9) and for cell_id according to [excel cell id naming rules](https://support.microsoft.com/en-au/office/names-in-formulas-fc2935f9-115d-4bef-a370-3aa8bb4c91f1)

Tech stack: 
+ Node.js
+ Express.js 
+ MongoDB(Mongoose)
+ Jest
+ Docker

To run app, firstly install dependencies with console opened in project directory: 

`npm install`

Then, to run tests, type: 

`npm test`

To start server, type: 

`npm start`

To run tests and app in docker container just use `docker compose up` in api directory
