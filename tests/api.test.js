const mongoose = require("mongoose")
const request = require("supertest")
const app = require("../app")

require("dotenv").config();

beforeAll(() => {
    mongoose.connect(process.env.DATABASE_URL);
  })

describe("POST /api/v1/sheet1/var1", () => {
    it("Should create a new sheet and cell", async () => {
        const res = await request(app).post("/api/v1/sheet1/var1").send({
            value: "5"
        })
    expect(res.statusCode).toBe(201)
    expect(res.body.value).toBe("5")
    expect(res.body.result).toBe("5")
    })
})

describe("POST /api/v1/sheet1/var2", () => {
    it("Should create a new cell with value given by formula", async () => {
        const res = await request(app).post("/api/v1/sheet1/var2").send({
            value: "=var1+(-2*6)"
        })
    expect(res.statusCode).toBe(201)
    expect(res.body.value).toBe("=var1+(-2*6)")
    expect(res.body.result).toBe("-7")
    })
})

describe("POST /api/v1/sheet1/var3", () => {
    it("Invalid formula request", async () => {
        const res = await request(app).post("/api/v1/sheet1/var3").send({
            value: "=varfd+u3ahy4t893(-2*6)"
        })
    expect(res.statusCode).toBe(422)
    expect(res.body.value).toBe("=varfd+u3ahy4t893(-2*6)")
    expect(res.body.result).toBe("ERROR")
    })
})

describe("POST /api/v1/sheet1/var3", () => {
    it("Creates a cell with string value", async () => {
        const res = await request(app).post("/api/v1/sheet1/var3").send({
            value: "abcdef"
        })
    expect(res.statusCode).toBe(201)
    expect(res.body.value).toBe("abcdef")
    expect(res.body.result).toBe("abcdef")
    })
})

describe("POST /api/v1/sheet1/var4", () => {
    it("Creates a cell where formula contains only reference to cell with string value", async () => {
        const res = await request(app).post("/api/v1/sheet1/var4").send({
            value: "=var3"
        })
    expect(res.statusCode).toBe(201)
    expect(res.body.value).toBe("=var3")
    expect(res.body.result).toBe("abcdef")
    })
})

describe("POST(update) /api/v1/sheet1/var1", () => {
    it("Update var1 cell and cells which depend on var1", async () => {
        const res = await request(app).post("/api/v1/sheet1/var1").send({
            value: "=(5-2*3)"
        })
    expect(res.statusCode).toBe(201)
    expect(res.body.value).toBe("=(5-2*3)")
    expect(res.body.result).toBe("-1")
    })
})

describe("POST /api/v1/shee[t/var1", () => {
    it("Invalid sheet name", async () => {
        const res = await request(app).post("/api/v1/shee[tt/var1").send({
            value: "1"
        })
    expect(res.statusCode).toBe(422)
    expect(res.body.value).toBe("1")
    expect(res.body.result).toBe("ERROR")
    })
})

describe("POST /api/v1/sheet1/va-+=-r1", () => {
    it("Invalid cell name", async () => {
        const res = await request(app).post("/api/v1/sheet1/va-+=-r1").send({
            value: "1"
        })
    expect(res.statusCode).toBe(422)
    expect(res.body.value).toBe("1")
    expect(res.body.result).toBe("ERROR")
    })
})

describe("GET /api/v1/sheet1", () => {
    it("Getting all values from sheet", async () => {
    const res = await request(app).get("/api/v1/sheet1")
    expect(res.statusCode).toBe(200)
    expect(res.body).toStrictEqual({
        "var1": {"value": "=(5-2*3)", "result": "-1"},
        "var2": {"value": "=var1+(-2*6)", "result": "-13"},
        "var3": {"value": "abcdef", "result": "abcdef"},
        "var4": {"value": "=var3", "result": "abcdef"},
     })
    })
})

describe("GET /api/v1/sheet1/var1", () => {
    it("Getting cell", async () => {
    const res = await request(app).get("/api/v1/sheet1/var1")
    expect(res.statusCode).toBe(200)
    expect(res.body).toStrictEqual({
        "value": "=(5-2*3)", "result": "-1"
    })
    })
})

describe("GET /api/v1/sheet1/v1", () => {
    it("Getting non-existing cell", async () => {
    const res = await request(app).get("/api/v1/sheet1/v1")
    expect(res.statusCode).toBe(404)
    })
})


describe("GET /api/v1/sheet2", () => {
    it("Getting non-existing sheet", async () => {
    const res = await request(app).get("/api/v1/sheet2")
    expect(res.statusCode).toBe(404)
    })
})


afterAll(async () => {
    mongoose.connection.close();
  })