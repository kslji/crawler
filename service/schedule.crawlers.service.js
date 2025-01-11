const fs = require("fs").promises
const dirTree = require("directory-tree")
const path = require("path")
const helperUtil = require("../util/helper.util")
const fileUtil = require("../util/file.util")
const pm2Lib = require("../lib/pm2.lib")

const globalConfig = require("../global.config.json")

const CONSUMER_DIR = path.join(__dirname, "../consumer")

async function processFile(file) {
    try {
        const filePath = path.join(CONSUMER_DIR, file.name)
        const data = await fs.readFile(filePath, "utf8")

        if (!data) {
            console.log(`📁 No data found in file: ${file.name}`)
            return
        }

        const processName = file.name.split(".json")[0]
        const procesList = await pm2Lib.pm2List()
        if (
            !(await pm2Lib.doesProcessExist(processName)) &&
            procesList.length < globalConfig.totalPm2Processes
        ) {
            await pm2Lib.pm2Start(
                fileUtil.getAbsoluteFilePath(`/service/setup.crawlers.service.js`),
                processName,
            )
            console.log(`✅ Started process for file: ${file.name}`)
        } else {
            console.log({
                description: `⚙️ Process "${processName}" is already running.`,
                processCount: procesList.length,
            })
            await helperUtil.sleep(globalConfig.scheduleCrawlerServiceSleep)
        }
    } catch (err) {
        console.error(`❌ Error processing file: ${file.name}`, err)
    }
}

async function processConsumerFiles() {
    try {
        while (true) {
            const tree = dirTree(CONSUMER_DIR)

            if (!tree || !tree.children || tree.children.length === 0) {
                console.log(`📂 No files found in the directory: ${CONSUMER_DIR}`)
            } else {
                const { children } = tree
                for (const file of children) {
                    await processFile(file)
                }
            }

            await helperUtil.sleep(globalConfig.scheduleCrawlerServiceSleep)
        }
    } catch (err) {
        console.error("❌ An unexpected error occurred in the main loop:", err)
    }
}

; (async () => {
    try {
        console.log(`📂 Starting to monitor directory: ${CONSUMER_DIR}`)
        await processConsumerFiles()
    } catch (err) {
        console.error("❌ Fatal error in the application:", err)
    }
})()
