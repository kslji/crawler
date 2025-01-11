const express = require("express")
const app = express()
const crawlerRoutes = require("../crawler.api/routes/web.crawler.routes.crawler.api")
const PORT = 5001

    ; (async () => {
        try {
            app.use(express.json())
            app.use(express.urlencoded({ extended: true }))

            app.use("/crawl", crawlerRoutes)
            app.get("/status", (req, res) => {
                return res.json({
                    data: {
                        health: "✅",
                    },
                    error: null,
                    status: "success",
                })
            })

            app.listen(PORT, function () {
                console.log(`API is running on port ${PORT}`)
            })
        } catch (error) {
            console.error(error)
        }
    })()
