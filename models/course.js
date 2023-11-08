const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
  title: { type: String, required: true },
  playlistId: { type: String, required: true },
  publishedAt: { type: Date, required: true },
  description: { type: String, ref: "User" },
  imageUrl: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
