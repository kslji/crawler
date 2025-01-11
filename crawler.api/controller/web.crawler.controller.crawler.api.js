const fs = require("fs")
const path = require("path")
const util = require("util")

async function addWebUrls(req, res) {
    try {
        let { urls } = req.body

        if (!Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                data: null,
                error: "Invalid input: 'urls' field must be a non-empty array.",
                status: "error",
            })
        }

        const consumerDir = path.join(__dirname, "../../consumer")
        if (!fs.existsSync(consumerDir)) {
            fs.mkdirSync(consumerDir, { recursive: true })
        }

        urls.forEach((url) => {
            const filePath = path.join(
                consumerDir,
                `${url.split("https://")[1].split("/")[0]}.json`,
            )
            fs.writeFileSync(filePath, "", "utf8")
        })

        return res.json({
            data: `Web URLs: ${urls} have been inserted ✅.`,
            status: "success",
            error: null,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            data: null,
            error: util.inspect(error),
            status: "internal server error",
        })
    }
}

module.exports = {
    addWebUrls,
}
