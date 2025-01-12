/**
 * File Name: controller.crawler.api.js
 * 
 * Description:
 * This API controller provides functionality for handling website URLs by performing the following operations:
 * 1. Adding website URLs into the "consumer" directory and creating corresponding JSON files.
 * 2. Retrieving content from crawled website URLs stored in the "crawled.websites" directory.
 * 
 * The controller includes two main functions:
 * 1. `addWebUrls`: Adds a list of website URLs, validates the input, creates necessary directories, 
 *    and generates an empty JSON file for each URL.
 * 2. `getWebUrls`: Retrieves and returns the content of a specific crawled website in JSON format.
 * 
 * Dependencies:
 * - fs: File system module to handle directory and file operations.
 * - util: Utility module for error handling and formatting.
 * - path: Module to resolve and construct file paths.
 * - fileUtil: A custom utility module for file-related operations.
 * 
 * Usage:
 * Integrate this controller into an Express-based backend to handle POST requests for adding and retrieving URLs.
 * 
 * Example Input:
 * 1. For `addWebUrls`:
 * {
 *   "urls": [
 *     "https://example.com",
 *     "https://another-site.com"
 *   ]
 * }
 * 
 * 2. For `getWebUrls`:
 * {
 *   "weburl": "example.com"
 * }
 * 
 * Response:
 * - On success: JSON indicating the status of the URL operation (addition or retrieval).
 * - On error: JSON with an appropriate error message and status code.
 */

const fs = require("fs")
const util = require("util")
const path = require("path")
const fileUtil = require("../../util/file.util")

async function addWebUrls(req, res) {
    try {
        let { urls } = req.body

        if (!Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                data: null,
                error: "Invalid input: 'urls' field must be a non-empty array.",
                status: "error",
            })
        }

        const consumerDir = path.join(__dirname, "../../consumer")
        if (!fs.existsSync(consumerDir)) {
            fs.mkdirSync(consumerDir, { recursive: true })
        }

        urls.forEach((url) => {
            const filePath = path.join(
                consumerDir,
                `${url.split("https://")[1].split("/")[0]}.json`,
            )
            fs.writeFileSync(filePath, "", "utf8")
        })

        return res.json({
            data: `Web URLs: ${urls} , started consuming all product urls ✅.⏳ Wait some time to process all products....`,
            status: "success",
            error: null,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            data: null,
            error: util.inspect(error),
            status: "internal server error",
        })
    }
}

async function getWebUrls(req, res) {
    try {
        let { weburl } = req.body

        if (!weburl && weburl.length === 0) {
            return res.status(400).json({
                data: null,
                error: "Invalid input: 'weburl' field must be a non-empty string.",
                status: "error",
            })
        }
        weburl = weburl.split("https://")[1]

        const crawledDir = path.join(__dirname, `../../crawled.websites`)

        if (!await fileUtil.doesFileExistInFolder(crawledDir, weburl + ".json")) {
            const getAllFiles = await fileUtil.getAllFileInDirectory(crawledDir);
            return res.status(404).json({
                data: null,
                error: `Not Found : file with name ${weburl} , filesExist: ${getAllFiles}`,
                status: "error",
            })
        }

        const fileContent = fs.readFileSync(path.join(__dirname, `../../crawled.websites/${weburl}.json`), "utf8");
        const parsedContent = JSON.parse(fileContent);

        return res.json({
            data: parsedContent,
            status: "success",
            error: null,
        });

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            data: null,
            error: util.inspect(error),
            status: "internal server error",
        })
    }
}
module.exports = {
    addWebUrls: addWebUrls,
    getWebUrls: getWebUrls
}
