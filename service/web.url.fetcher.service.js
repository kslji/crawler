/**
 * File Name: web.url.fetcher.service.js
 * 
 * Description:
 * This service processes files in the "consumer" directory, where each file's name represents a website URL 
 * (e.g., `addidas.com.json`). The service performs the following tasks:
 * 1. Monitors the "consumer" directory for new files.
 * 2. For each file:
 *    - Extracts all category links from the website using Puppeteer.
 *    - Filters the links to include only HTTPS URLs within the site's domain.
 *    - If the file is empty, populates it with the filtered links.
 *    - If the file already contains data, skips it.
 * 3. Continuously loops to monitor for new files and updates.
 * 
 * Dependencies:
 * - `fs`: File system module to read and write files.
 * - `dirTree`: Utility to traverse directories.
 * - `path`: Module to handle file paths.
 * - `helperUtil`: Utility module for custom helper functions.
 * - `puppeteerLib`: Puppeteer library for web scraping.
 * - `globalConfig`: Configuration file for customizable settings.
 * 
 * Usage:
 * Run this script as a standalone service to monitor the "consumer" directory 
 * and process website category URLs into corresponding JSON files.
 */

const fs = require("fs")
const dirTree = require("directory-tree")
const path = require("path")
const helperUtil = require("../util/helper.util")
const fileUtil = require("../util/file.util.js")
const puppeteerLib = require("../lib/pupeteer.lib")
const globalConfig = require("../global.config.json");

; (async () => {
    try {
        let lastConsumer = null

        while (true) {
            const { children } = dirTree(path.join(__dirname, "../consumer"))

            if (children.length <= 0) {
                console.log("No New file arrived 🧐 !!")
                await helperUtil.sleep(globalConfig.sleep)
            }

            if (
                children.length > 0 &&
                children[children.length - 1].name !== lastConsumer
            ) {
                console.log("New file arrived 🧐 !!")
                lastConsumer = children[children.length - 1].name
            }

            for (let website of children) {
                const siteUrls = await puppeteerLib.extractLinks(
                    `https://${website.name.split(".json")[0]}`,
                )
                let filteredLinks = helperUtil.listContainsHttpsLinks(
                    siteUrls,
                    `https://${website.name.split(".json")[0]}/`,
                )
                filteredLinks = filteredLinks.filter(
                    (item) =>
                        item !== `https://${website.name.split(".json")[0]}/`
                )

                fs.readFile(
                    path.join(__dirname, "../consumer", website.name),
                    "utf8",
                    async (err, data) => {
                        if (err) {
                            console.error(
                                `An error occurred while reading the file: ${website.name}`,
                                err,
                            )
                            return
                        }
                        if (data === "") {
                            console.log(`Adding data in file ${website.name} 💻 !!`)
                            fs.appendFileSync(
                                path.join(__dirname, "../consumer", website.name),
                                JSON.stringify(filteredLinks, null, 2),
                            )
                            await fileUtil.removeDuplicatesUrls(filteredLinks, website.name.split(".json")[0])
                        } else {
                            console.log(
                                `${website.name} product link list already exist , ignoring 😮‍💨 !!`,
                            )
                        }
                    },
                )
            }
            await helperUtil.sleep(globalConfig.fetchAllUrlsServiceSleep)
        }
    } catch (e) {
        console.error("An error occurred:", e)
    }
})()