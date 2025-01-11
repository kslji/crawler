const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const expect = require("chai").expect;

const fileUtil = require("../util/file.util")
const helperUtil = require("../util/helper.util")

describe("global test cases", () => {
    describe("getAbsoluteFilePath", () => {
        it("should return the absolute file path based on the given relative file path", () => {
            const relativeFilePath = "../tasks.js"
            const result = fileUtil.getAbsoluteFilePath(relativeFilePath)
            expect(result).to.be.a("string")
        })
    })
    describe('listContainsHttpsLinks function', () => {
        it('should filter the list to only include links with the specified domain, excluding exact domain match and ignored words', () => {
            const list = [
                "https://example.com/faqs",
                "https://example.com/returns",
                "https://example.com/",
                "https://example.com/page1"
            ];
            const domain = "example.com";

            const result = helperUtil.listContainsHttpsLinks(list, domain);
            expect(result).to.deep.equal([
                "https://example.com/", "https://example.com/page1"
            ]);
        });
    });

    describe('filterUniqueLinks function', () => {
        it('should filter out links that already exist in allLinks and return unique newLinks and updated allLinks', () => {
            const productLinks = [
                "https://example.com/product1",
                "https://example.com/product2",
                "https://example.com/product3"
            ];

            const allLinks = [
                "https://example.com/product1",
                "https://example.com/product4"
            ];

            const result = helperUtil.filterUniqueLinks(productLinks, allLinks);

            // newLinks should only contain "https://example.com/product2" and "https://example.com/product3"
            expect(result.newLinks).to.deep.equal([
                "https://example.com/product2",
                "https://example.com/product3"
            ]);

            // updatedLinks should now include the old links plus the new unique links
            expect(result.updatedLinks).to.deep.equal([
                "https://example.com/product1",
                "https://example.com/product4",
                "https://example.com/product2",
                "https://example.com/product3"
            ]);
        });
    });

});
