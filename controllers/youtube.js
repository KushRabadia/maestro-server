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
        const playlistItems = await youtube.playlistItems.list({
            part: ["snippet", "contentDetails"],
            playlistId: playlistId,
            maxResults: 50
        });

        // To get the next page
        // const nextPageToken = playlistItems.data.nextPageToken;

        const videoLinks = playlistItems.data.items.map((item) => {
            return {
                title: item.snippet.title,
                videoId: item.contentDetails.videoId
            }
        });
        // console.log(playlistItems.data.items);
        res.json(videoLinks);

    } catch (err) {
        next(err);
    }
};

