const fs = require("fs")
const dirTree = require("directory-tree")
const path = require("path")
const helperUtil = require("../util/helper.util")
const puppeteerLib = require("../lib/pupeteer.lib")
const globalConfig = require("../global.config.json");

; (async () => {
    try {
        let lastConsumer = null

        while (true) {
            const { children } = dirTree(path.join(__dirname, "../consumer"))

            if (children.length <= 0) {
                console.log("No New file arrived 🧐 !!")
                await helperUtil.sleep(2000)
            }

            if (
                children.length > 0 &&
                children[children.length - 1].name !== lastConsumer
            ) {
                console.log("New file arrived 🧐 !!")
                lastConsumer = children[children.length - 1].name
            }

            for (let grandchild of children) {
                const siteUrls = await puppeteerLib.extractLinks(
                    `https://${grandchild.name.split(".json")[0]}`,
                )
                const filteredLinks = helperUtil.listContainsHttpsLinks(
                    siteUrls,
                    `https://${grandchild.name.split(".json")[0]}/`,
                )
                fs.readFile(
                    path.join(__dirname, "../consumer", grandchild.name),
                    "utf8",
                    (err, data) => {
                        if (err) {
                            console.error(
                                `An error occurred while reading the file: ${grandchild.name}`,
                                err,
                            )
                            return
                        }
                        if (data === "") {
                            console.log(`Adding data in file ${grandchild.name} 💻 !!`)
                            fs.appendFileSync(
                                path.join(__dirname, "../consumer", grandchild.name),
                                JSON.stringify(filteredLinks, null, 2),
                            )
                        } else {
                            console.log(
                                `File has already content in it ${grandchild.name} , ignoring 😮‍💨 !!`,
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
