/**
 * Utility functions for handling and filtering URLs and links in various scenarios.
 *
 * This file contains the following functions:
 * 
 * 1. listContainsHttpsLinks: Filters a list of URLs based on a domain and ignores specific words from the global configuration.
 * 2. filterUniqueLinks: Filters out duplicate product links by comparing them with an existing list of links.
 * 3. sleep: A utility function to pause execution for a specified duration, used to add delays in async operations.
 *
 * Configuration:
 * - The global configuration file ("global.config.json") is used to fetch words to ignore while filtering URLs.
 * 
 * Exports:
 * - listContainsHttpsLinks: Function to filter links based on a domain.
 * - filterUniqueLinks: Function to identify new unique links.
 * - sleep: Function to pause execution for a given duration.
 */

const globalConfig = require("../global.config.json")

function listContainsHttpsLinks(list, domain) {
    return list.filter(
        (item) =>
            item.includes(domain) &&
            item !== domain &&
            globalConfig.wordsToIgnore.every((word) => !item.includes(word)),
    )
}

function filterUniqueLinks(productLinks, allLinks) {
    const newLinks = productLinks.filter((link) => !allLinks.includes(link))
    allLinks = [...allLinks, ...newLinks]
    return { newLinks, updatedLinks: allLinks }
}

async function sleep(duration) {
    try {
        if (duration === null) {
            throw new Error("Please specify the sleep duration!")
        }
        await new Promise((resolve) => setTimeout(resolve, duration))
    } catch (error) {
        throw error
    }
}

module.exports = {
    listContainsHttpsLinks: listContainsHttpsLinks,
    filterUniqueLinks: filterUniqueLinks,
    sleep: sleep,
}
