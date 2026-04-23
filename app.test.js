// app.test.js — тести для Jenkins pipeline
const request = require("supertest");
const app = require("./app");

describe("GET /", () => {
  test("повертає статус 200 і message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Hello from Node.js app!");
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /health", () => {
  test("повертає healthy статус", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("healthy");
  });
});
