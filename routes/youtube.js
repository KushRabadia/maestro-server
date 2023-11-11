const express = require('express')

const YoutubeController = require('../controllers/youtube')

const router = express.Router()

router.get('/link', YoutubeController.getLink)
router.get('/search', YoutubeController.getSearch)

module.exports = router
