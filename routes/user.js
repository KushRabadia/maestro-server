const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');
const multer = require('multer');
const upload = multer();

const router = express.Router();

router.post(
  '/create',
  [
    upload.none(),
    body('name')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Please enter user name.'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 6 })
      .withMessage('Password should be at least 6 characters long.'),
  ],
  userController.createUser);

router.post('/login', upload.none(), userController.loginUser);

router.post('/login/social', userController.loginUserSocial);

router.get('/verify/:token', isAuth, userController.verify);

module.exports = router;