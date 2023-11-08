const express = require("express");

const CourseController = require("../controllers/course");

const router = express.Router();

router.post("", CourseController.createCourse);

router.get("/courses", CourseController.getCourses);

module.exports = router;
