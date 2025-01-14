/**
 * Web Scraper lib Module
 *
 * This module provides functions to scrape links and product URLs from web pages using Puppeteer.
 * It includes methods for extracting all links from a page, extracting product-specific links,
 * and fetching paginated product URLs from a category page.
 * 
 * Functions:
 * - extractLinks: Extracts all valid links from a given webpage URL.
 * - extractPageProductLinks: Extracts product-related links (e.g., "/products/", "/items/", "/p/") from a Puppeteer page instance.
 * - productUrls: Scrapes paginated product URLs from a category page, ensuring duplicate links are filtered out.
 * 
 * Dependencies:
 * - `puppeteer`: Used for browser automation and webpage scraping.
 * - `helperUtil`: Provides helper functions such as sleeping and filtering unique links.
 * 
 */
const fs = require("fs")
const path = require("path")
const puppeteer = require("puppeteer")
const helperUtil = require("../util/helper.util")
const globalConfig = require("../global.config.json")
const fileUtil = require("../util/file.util")

/**
 * Extracts all valid links from the given webpage URL.
 * @param {string} url - The URL of the webpage to scrape.
 * @returns {Promise<string[]>} A list of valid links found on the page.
 */

async function extractLinks(url) {
    try {
        const browser = await puppeteer.launch(
            {
                headless: "true",
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-accelerated-2d-canvas",
                    "--no-first-run",
                    "--no-zygote",
                    "--disable-gpu",
                ],
            }
        )
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: "networkidle2", timeout: 1200000 })

        const links = await page.evaluate(() => {
            const anchorTags = document.querySelectorAll("a")
            return Array.from(anchorTags)
                .map((anchor) => anchor.href)
                .filter((href) => href)
        })

        await browser.close()
        return links
    } catch (e) {
        throw new Error("DUE TO SECURITY PURPOSES SITE UNABLE TO AUTHENTICATE 🚨!!")
    }

}


/**
 * Extracts product-specific links from a Puppeteer page instance.
 * Filters links containing specific keywords like "/products/", "/items/", or "/p/".
 * @param {object} page - Puppeteer page instance.
 * @returns {Promise<string[]>} A list of unique product-related links.
 */

async function extractPageProductLinksV1(page) {
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

/**
 * Extracts product-specific links from a Puppeteer page instance based on URL structure.
 * Avoids certain category and page links to refine the product URLs.
 * @param {object} page - Puppeteer page instance.
 * @param {string} url - URL of the category or page being scraped.
 * @returns {Promise<string[]>} A list of refined product-related links.
 */

async function extractPageProductLinksV2(page, url) {
    const parts = url.split('/');
    const categoryPart = parts[parts.length - 1];
    const productLinks = await page.evaluate((categoryPart, parts) => {
        const links = Array.from(document.querySelectorAll("a"))
            .filter(
                (anchor) =>
                    anchor.href !== `https://${parts[2]}/${categoryPart}` &&
                    anchor.href.split("/").length !== (url).split("/").length &&
                    anchor.href.includes(categoryPart)
            )
            .map((anchor) => anchor.href)
        return [...new Set(links)]
    }, categoryPart, parts)
    return productLinks
}

/**
 * Fetches and authorizes product URLs from a Puppeteer page.
 * Saves extracted links to cache for future reference.
 * @param {object} page - Puppeteer page instance.
 * @param {string} url - URL of the page being scraped.
 * @param {string} fileName - File name for caching product URLs.
 * @returns {Promise<string[]>} A list of authorized product links.
 */
async function authorizeProductUrlFetcher(page, url, fileName) {
    let productLinks = await extractPageProductLinksV1(page);

    if (!await fileUtil.doesFileExistInFolder(
        path.join(__dirname, "../cache.data"),
        fileName + ".json",
    )) {
        if (productLinks.length === 0) {
            fs.writeFileSync(path.join(__dirname, `../cache.data/${fileName}.json`), JSON.stringify({ value: false }), 'utf8');
        } else {
            fs.writeFileSync(path.join(__dirname, `../cache.data/${fileName}.json`), JSON.stringify({ value: true }), 'utf8');
        }
    }

    if (!await fileUtil.getCachedData(fileName)) {
        console.log(`Enabled Fallback function for website : ${fileName} ✅`);
        productLinks = await extractPageProductLinksV2(page, url);
    }
    return productLinks;
}

/**
 * Scrapes paginated product URLs from a category page.
 * Ensures duplicate links are filtered out across pages.
 * @param {string} url - URL of the category to scrape.
 * @param {string} fileName - File name for caching the links.
 * @returns {Promise<object>} An object containing the category name and unique product links.
 */
async function productUrls(url, fileName) {
    try {
        let startPage = 1
        let isDuplicate = false
        let allLinks = [], pagePromises = [], currentBatchLinks = []

        const browser = await puppeteer.launch(
            {
                headless: "true",
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-accelerated-2d-canvas",
                    "--no-first-run",
                    "--no-zygote",
                    "--disable-gpu",
                ],
            }
        )

        while (!isDuplicate) {
            pagePromises = []
            currentBatchLinks = []

            for (let iterPage = 0; iterPage < globalConfig.pageBatches; iterPage++) {
                const currentPage = startPage + iterPage
                pagePromises.push(
                    (async (page) => {
                        const newPage = await browser.newPage()
                        await newPage.goto(`${url}?page=${page}`, { timeout: 120000 })
                        await newPage.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        await helperUtil.sleep(globalConfig.sleep)

                        const productLinks = await authorizeProductUrlFetcher(newPage, url, fileName)
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
                startPage += globalConfig.pageBatches
                console.log(`Fetched links from pages ${startPage - globalConfig.pageBatches} to ${startPage - 1}`)
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