const router = require("express").Router()
const crawlerController = require("../controller/web.crawler.controller.crawler.api")

router.post("/urls", crawlerController.addWebUrls)

module.exports = router
