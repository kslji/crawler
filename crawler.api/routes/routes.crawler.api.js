const router = require("express").Router()
const crawlerController = require("../controller/controller.crawler.api")

router.post("/add", crawlerController.addWebUrls)
router.get("/fetch", crawlerController.getWebUrls)

module.exports = router
