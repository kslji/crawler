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
            console.log(file)
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
