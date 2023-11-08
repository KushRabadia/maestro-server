const express = require("express");

const VideoController = require("../controllers/video");

const router = express.Router();

router.post("", VideoController.createVideo);

router.post("/videos", VideoController.getVideos);

module.exports = router;