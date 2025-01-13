/**
 * Directory Monitoring and Process Management Service
 *
 * This script continuously monitors a specified directory for JSON files.
 * For each file found:
 * - It reads the file's content.
 * - Checks if a PM2 process corresponding to the file's base name is running.
 * - Starts the process if it doesn't exist and the total PM2 process count is below a configured limit.
 *
 * Key Features:
 * - Automates process management using PM2.
 * - Supports dynamic monitoring and file-based process association.
 * - Ensures resource limits are respected through configuration.
 *
 * Dependencies:
 * - File System (fs) for reading files.
 * - Directory Tree (directory-tree) for scanning the directory structure.
 * - Path for handling file paths.
 * - Custom utility libraries for PM2 management, file handling, and delays.
 * - Global configuration for managing runtime settings.
 */

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
                fileUtil.getAbsoluteFilePath(`/service/consumer.file.scraper.service.js`),
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
        console.error(`❌ some error occured , stabilizing .... : ${file.name}`)
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