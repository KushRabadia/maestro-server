const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
