const puppeteer = require("puppeteer")
const helperUtil = require("../util/helper.util")

async function extractLinks(url) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle2" })

    const links = await page.evaluate(() => {
        const anchorTags = document.querySelectorAll("a")
        return Array.from(anchorTags)
            .map((anchor) => anchor.href)
            .filter((href) => href)
    })

    await browser.close()
    return links
}

async function extractPageProductLinks(page) {
    const productLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("a"))
            .filter(
                (anchor) =>
                    anchor.href.includes("/products/") ||
                    anchor.href.includes("/items/") ||
                    anchor.href.includes("/p/"),
            )
            .map((anchor) => anchor.href)

        return [...new Set(links)]
    })
    return productLinks
}

async function productUrls(url) {
    try {

        let startPage = 1
        let isDuplicate = false
        let allLinks = [], pagePromises = [], currentBatchLinks = []

        const browser = await puppeteer.launch({
            headless: true,
        })

        while (!isDuplicate) {
            pagePromises = []
            currentBatchLinks = []

            for (let iterPage = 0; iterPage < 5; iterPage++) {
                const currentPage = startPage + iterPage
                pagePromises.push(
                    (async (page) => {
                        const newPage = await browser.newPage()
                        await newPage.goto(`${url}?page=${page}`, { timeout: 120000 })
                        await newPage.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        await helperUtil.sleep(3000)

                        const productLinks = await extractPageProductLinks(newPage)
                        const { newLinks, updatedLinks } = helperUtil.filterUniqueLinks(productLinks, allLinks)
                        allLinks = updatedLinks
                        currentBatchLinks.push(newLinks)

                        await newPage.close()
                    })(currentPage)
                )
            }

            await Promise.all(pagePromises)
            const allNewLinks = currentBatchLinks.flat()

            if (allNewLinks.length === 0) {
                isDuplicate = true
            } else {
                startPage += 5
                console.log(`Fetched links from pages ${startPage - 5} to ${startPage - 1}`)
            }
        }

        await browser.close()

        return {
            category: url.split("/").pop(),
            links: allLinks,
        }
    } catch (e) {
        throw e
    }
}

module.exports = {
    productUrls: productUrls,
    extractLinks: extractLinks,
}
