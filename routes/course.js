const express = require("express");

const CourseController = require("../controllers/course");

const router = express.Router();

router.post("", CourseController.createCourse);

router.get("/courses", CourseController.getCourses);

router.get("/:courseId", CourseController.getCourse);

module.exports = router;
