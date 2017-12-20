const request = require("supertest");

var app = require("./app").app;

it("return time Connection", function (done) {

    request(app)
        .get("/")
        .expect("time of connection")
        .end(done);
});