const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const expect = require("chai").expect;

const server = "http://localhost:5001";

describe("crawler api test cases", () => {
    describe("POST /crawl/urls", () => {
        it("it should process the provided URLs and return the expected response", (done) => {
            chai
                .request(server)
                .post("/crawl/urls")
                .send({
                    urls: [
                        "https://headsupfortails.com/",
                        "https://www.adidas.co.in/",
                        "https://baccabucci.com/"
                    ],
                })
                .end((err, res) => {
                    if (err) done(err);
                    expect(res.body.data).to.equal("Web URLs: https://headsupfortails.com/,https://www.adidas.co.in/,https://baccabucci.com/ have been inserted ✅.");
                    expect(res.body.status).to.equal("success");
                    expect(res.body.error).to.equal(null);
                    done();
                });
        });
    });
});
