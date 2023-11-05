const apiKey = "AIzaSyCe1PYck7G8XvV-ujzwhgTqXzf6mjHCbgs";
const { google } = require("googleapis");
const youtube = google.youtube({
  version: "v3",
  auth: apiKey,
});

exports.getLink = (req, res, next) => {
    res.status(201).json({
        message: "Link added successfully",
    });
};

exports.getSearch = async (req, res, next) => {
    try {
        const searchQuery = req.query.search_query;
        const searchPlaylist = await youtube.search.list({
            part: "snippet",
            q: searchQuery,
            order: "viewCount",
            type: "playlist"
        });

        const playlistId = searchPlaylist.data.items[0].id.playlistId;
        console.log(playlistId)
        const playlistItems = await youtube.playlistItems.list({
            part: "contentDetails",
            playlistId: playlistId,
            maxResults: 50
        });

        // To get the next page
        // const nextPageToken = playlistItems.data.nextPageToken;

        const videoLinks = playlistItems.data.items.map((item) => `https://www.youtube.com/watch?v=${item.contentDetails.videoId}&list=${playlistId}`);
        // console.log(videoLinks);
        res.send(videoLinks);

    } catch (err) {
        next(err);
    }
};

