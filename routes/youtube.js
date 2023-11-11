const express = require("express");

const YoutubeController = require("../controllers/youtube");
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get("/link", YoutubeController.getLink);
router.get("/search", isAuth, YoutubeController.getSearch);

module.exports = router;
