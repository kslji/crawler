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

/**
 * Removes duplicate URLs from the provided list and saves the unique URLs to a JSON file.
 * 
 * @param {string[]} urls - An array of URLs that may contain duplicates.
 * @param {string} filename - The name of the file (without extension) where the unique URLs will be saved.
 * @returns {Promise<void>} A promise that resolves after the file is written.
 * 
 * Functionality:
 * - Filters the provided URLs to remove duplicates using a Set.
 * - Converts the unique URLs into JSON format with proper indentation for readability.
 * - Writes the JSON data to a file located in the "../consumer" directory.
 * - Logs a success message with the filename if the file is written successfully.
 * - Logs an error message if there is an issue during file writing.
 */

async function removeDuplicatesUrls(urls, filename) {
    try {
        const uniqueUrls = [...new Set(urls)];
        const jsonData = JSON.stringify(uniqueUrls, null, 2);
        const filePath = path.join(__dirname, `../consumer/${filename}.json`);
        fs.writeFile(filePath, jsonData, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log(`Unique URLs saved to ${filename}.json`);
            }
        });
    } catch (error) {
        console.error('Error processing URLs:', error);
    }
}

/**
 * Retrieves cached data from a specified JSON file.
 * 
 * @param {string} filename - The name of the cache file (without extension) to read.
 * @returns {Promise<any>} A promise that resolves to the value of the "value" key in the parsed JSON data, or `undefined` if an error occurs.
 * 
 * Functionality:
 * - Reads a JSON file located in the "../cache.data" directory.
 * - Parses the file content to a JavaScript object.
 * - Extracts and returns the value associated with the "value" key in the parsed data.
 * - Logs an error message if the file cannot be read or parsed.
 * 
 * Example Usage:
 * ```javascript
 * const cachedValue = await getCachedData("exampleFile");
 * if (cachedValue) {
 *     console.log("Cached value:", cachedValue);
 * } else {
 *     console.log("No cached value or file not found.");
 * }
 * ```
 */

async function getCachedData(filename) {
    try {
        let data = await fs.readFile(path.join(__dirname, `../cache.data/${filename}.json`), "utf8");
        data = JSON.parse(data);
        return data["value"]
    } catch (err) {
        console.error('Error reading or parsing the file:', err);
    }
}

module.exports = {
    getAbsoluteFilePath: getAbsoluteFilePath,
    doesFileExistInFolder: doesFileExistInFolder,
    getAllFileInDirectory: getAllFileInDirectory,
    removeDuplicatesUrls: removeDuplicatesUrls,
    getCachedData: getCachedData
}
