const express = require("express");
const path = require("path");
const app = express();
const crawlerRoutes = require("../crawler.api/routes/routes.crawler.api");
const PORT = 5001;

(async () => {
    try {
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Serve static files (CSS, JS)
        app.use(express.static(path.join(__dirname, 'public')));

        // Routes for crawler
        app.use("/crawler", crawlerRoutes);

        // Serve the index file for the root route
        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "views", "index.crawler.api.html"));
        });
        // Health check route
        app.get("/status", (req, res) => {
            return res.json({
                data: {
                    health: "✅",
                },
                error: null,
                status: "success",
            });
        });

        // Add error handling middleware
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send("Something went wrong!");
        });

        app.listen(PORT, function () {
            console.log(`API is running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
})();
