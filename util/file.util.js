/**
 * File System Utilities Module
 * 
 * This module provides utility functions to work with the file system. 
 * It includes functions to:
 * 1. Get the absolute file path of a relative file.
 * 2. Check if a specific file exists within a given folder.
 * 3. Retrieve all files in a specified directory.
 * 
 * All functions work asynchronously using Promises to handle file operations.
 * 
 * @module fileSystemUtils
 */

const fs = require("fs").promises
const path = require("path")

/**
 * Returns the absolute file path for a given relative file path.
 * 
 * @param {string} relativeFilePath - The relative path of the file.
 * @returns {string} The absolute file path.
 */
function getAbsoluteFilePath(relativeFilePath) {
    const ROOT_DIRECTORY = path.join(__dirname, "../")
    return path.join(ROOT_DIRECTORY, relativeFilePath)
}

/**
 * Checks if a file exists in the specified folder.
 * 
 * @param {string} folderPath - The path to the folder.
 * @param {string} fileName - The name of the file to check.
 * @returns {Promise<boolean>} True if the file exists, false otherwise.
 * @throws {Error} If an error occurs while reading the folder.
 */
async function doesFileExistInFolder(folderPath, fileName) {
    try {
        const files = await fs.readdir(folderPath)
        return files.includes(fileName)
    } catch (error) {
        throw error
    }
}

/**
 * Retrieves a list of all files in the specified directory.
 * 
 * @param {string} folderPath - The path to the folder.
 * @returns {Promise<string[]>} A list of file names in the directory.
 * @throws {Error} If an error occurs while reading the folder.
 */
async function getAllFileInDirectory(folderPath) {
    try {
        const files = await fs.readdir(folderPath)
        return files
    } catch (error) {
        throw error
    }
}

module.exports = {
    getAbsoluteFilePath: getAbsoluteFilePath,
    doesFileExistInFolder: doesFileExistInFolder,
    getAllFileInDirectory: getAllFileInDirectory
}
