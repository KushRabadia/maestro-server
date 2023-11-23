const express = require("express");

const OpenAIController = require("../controllers/openai");

const router = express.Router();

router.get("/image", OpenAIController.createImage);

module.exports = router;