const fs = require("fs").promises
const path = require("path")

function getAbsoluteFilePath(relativeFilePath) {
    const ROOT_DIRECTORY = path.join(__dirname, "../")
    return path.join(ROOT_DIRECTORY, relativeFilePath)
}

async function doesFileExistInFolder(folderPath, fileName) {
    try {
        const files = await fs.readdir(folderPath)
        return files.includes(fileName)
    } catch (error) {
        console.error(
            `Error checking file existence in folder: ${folderPath}`,
            error,
        )
        throw error
    }
}
module.exports = {
    getAbsoluteFilePath: getAbsoluteFilePath,
    doesFileExistInFolder: doesFileExistInFolder,
}
