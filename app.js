const fs = require('fs');
const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const youtubeRoutes = require("./routes/youtube");
const courseRoutes = require("./routes/course");
const videoRoutes = require("./routes/video");
const userRoutes = require("./routes/user");

const username = encodeURIComponent("maestrodb");
const password = encodeURIComponent("Maestro@123");
const uri = `mongodb+srv://${username}:${password}@maestro.dqc9ifa.mongodb.net/?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname,"images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/youtube", youtubeRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/user", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(uri)
  .then(() => {
    app.listen(8000, function() {
      console.log("Server is running on port " + 8000);
    });
  })
  .catch(err => {
    console.log(err);
  });
