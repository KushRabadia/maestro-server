const Course = require('../models/course')

exports.createCourse = (req, res, next) => {
  const course = new Course({
    title: req.body.title,
    playlistId: req.body.playlistId,
    publishedAt: req.body.publishedAt,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
  })
  course
    .save()
    .then((createdCourse) => {
      res.status(201).json({
        message: 'Course added successfully',
        course: {
          ...createdCourse.toJSON(),
          id: createdCourse._id,
        },
      })
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Creating a course failed!',
        error: error.message,
      })
    })
}

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
    if (!courses) {
      const error = new Error('Courses not found.')
      error.statusCode = 404
      throw error
    }
    res.status(200).json({
      message: 'Course fetched successfully.',
      courses: courses,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
