const { google } = require('googleapis')
const axios = require('axios')

const apiKey = 'AIzaSyCe1PYck7G8XvV-ujzwhgTqXzf6mjHCbgs'
const apiUrl = 'http://localhost:8000/api/'

const youtube = google.youtube({
  version: 'v3',
  auth: apiKey,
})

exports.getLink = (req, res, next) => {
  res.status(201).json({
    message: 'Link added successfully',
  })
}

exports.getSearch = async (req, res, next) => {
  try {
    const searchQuery = req.query.search_query
    const searchPlaylists = await youtube.search.list({
      part: 'snippet',
      q: searchQuery,
      order: 'viewCount',
      type: 'playlist',
    })

    const searchPlaylist = searchPlaylists.data.items[0]

    const courseData = {
      title: searchPlaylist.snippet.title,
      playlistId: searchPlaylist.id.playlistId,
      publishedAt: searchPlaylist.snippet.publishedAt,
      description: searchPlaylist.snippet.description,
      imageUrl: searchPlaylist.snippet.thumbnails.high.url,
    }

    try {
      const response = await axios.post(`${apiUrl}course`, courseData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const playlistId = courseData.playlistId
      const courseId = response.data.course.id

      let allPlaylistItems = []
      let nextPageToken = null
      let playlistItems

      do {
        playlistItems = await youtube.playlistItems.list({
          part: ['snippet', 'contentDetails'],
          playlistId: playlistId,
          maxResults: 50,
          pageToken: nextPageToken,
        })
        allPlaylistItems = allPlaylistItems.concat(playlistItems.data.items)
        nextPageToken = playlistItems.data.nextPageToken
      } while (nextPageToken)

      let videoLinks = []

      await Promise.all(
        allPlaylistItems.map(async (item) => {
          const videoData = {
            videoId: item.contentDetails.videoId,
            title: item.snippet.title,
            courseId: courseId,
          }

          try {
            await axios.post(`${apiUrl}video`, videoData, {
              headers: {
                'Content-Type': 'application/json',
              },
            })

            videoLinks = videoLinks.concat(videoData)
          } catch (error) {
            console.error(
              `Error posting video data for videoId ${videoData.videoId}:`,
              error
            )
            return
          }
        })
      )

      res.json(videoLinks)
    } catch (error) {
      if (error.response) {
        console.error('Response error:', error.response.data)
        console.error('Status code:', error.response.status)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Request setup error:', error.message)
      }
    }
  } catch (err) {
    next(err)
  }
}
