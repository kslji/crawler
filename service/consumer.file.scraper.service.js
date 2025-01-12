/**
 * This script monitors a directory (`consumer`) for JSON files named after a specific process.
 * Once a matching file is detected, it reads the file, processes URLs listed within it, 
 * and fetches product links using Puppeteer. The results are saved to a `crawled.websites` 
 * directory. If the file has already been processed before, it continues from where it left off.
 * 
 * Key Features:
 * - Watches the `consumer` folder for specific JSON files.
 * - Uses Puppeteer to scrape product links from the URLs.
 * - Ensures previously processed data is not lost and resumes processing.
 * - Deletes the processed file and stops the associated process using PM2 once done.
 * - Includes error handling to gracefully stop the PM2 process in case of failures.
 * 
 * Dependencies:
 * - `path` for handling file paths.
 * - `fs` (with promises) for file operations.
 * - `directory-tree` to fetch folder structure.
 * - Custom utilities (`helperUtil`, `fileUtil`, `pupeteerLib`, `pm2Lib`) for sleep, file existence checks, Puppeteer interactions, and PM2 operations.
 * 
 * Configuration:
 * - `globalConfig` contains sleep durations for various steps to control the workflow.
 * 
 */
const path = require("path")
const fs = require("fs").promises
const dirTree = require("directory-tree")
const helperUtil = require("../util/helper.util")
const fileUtil = require("../util/file.util")
const pupeteerLib = require("../lib/pupeteer.lib")

const globalConfig = require("../global.config.json")
const pm2Lib = require("../lib/pm2.lib")

const processName = process.env.name
const CONSUMER_DIR = path.join(__dirname, "../consumer");

; (async () => {
    try {
        while (true) {
            const { children } = dirTree(CONSUMER_DIR)
            const file = children.find(
                (child) => child.name === processName + ".json",
            )
            if (!file) {
                console.log(`🔍 consumer folder is empty 🔍 !!`)
                await helperUtil.sleep(globalConfig.setupCrawlersNoConsumerFoundSleep)
                continue
            }
            let uploadAllProductLinks = []
            const data = await fs.readFile(file.path, "utf8")
            const parseData = JSON.parse(data)

            let iterUrls = 1
            if (
                await fileUtil.doesFileExistInFolder(
                    path.join(__dirname, "../crawled.websites"),
                    processName + ".json",
                )
            ) {
                console.log(`file : ${processName} already exit ✅!!`)
                const crawledWebsite = await fs.readFile(
                    path.join(__dirname, `../crawled.websites/${processName + ".json"}`),
                    "utf8",
                )
                const parseWebsite = JSON.parse(crawledWebsite)
                uploadAllProductLinks = parseWebsite
                iterUrls = parseWebsite.length
            }

            for (; iterUrls < 3; iterUrls++) {
                const fetchProductLinks = await pupeteerLib.productUrls(
                    parseData[iterUrls],
                )
                uploadAllProductLinks = uploadAllProductLinks.concat(fetchProductLinks)
                await fs.writeFile(
                    path.join(__dirname, `../crawled.websites/${processName}.json`),
                    JSON.stringify(uploadAllProductLinks, null, 2),
                    "utf8",
                )
            }

            await Promise.all([
                fs.unlink(path.join(__dirname, `../consumer/${processName}.json`)),
                pm2Lib.pm2Delete(processName),
            ])

            console.log(`Processed and saved data for ${processName}`)
            await helperUtil.sleep(globalConfig.setupCrawlersServiceSleep)
        }
    } catch (e) {
        console.error("Error:", e)
        await pm2Lib.pm2Stop(processName)
    }
})()