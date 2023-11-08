const Video = require("../models/video");

exports.createVideo = (req, res, next) => {
  const video = new Video({
    title: req.body.title,
    courseId: req.body.courseId,
    videoId: req.body.videoId
  });
  video
    .save()
    .then(createdVideo => {
      res.status(201).json({
        message: "Video added successfully",
        video: {
          ...createdVideo.toJSON(),
          id: createdVideo._id
        }
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Creating a video failed!",
        error: error.message
      });
    });
};

exports.getVideos = async (req, res, next) => {
  const courseId = req.body.courseId;
  const videos = await Video.find({courseId: courseId});
  try {
    if (!videos) {
      const error = new Error('Could not find videos.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: 'Videos fetched successfully', videos: videos});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
