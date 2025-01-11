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
