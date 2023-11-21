const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");

const User = require("../models/user");

const MAESTRO_AI_JWT_SECRET = process.env.MAESTRO_AI_JWT_SECRET;
const sgMailApiKey = process.env.SG_MAIL_API_KEY;
sgMail.setApiKey(sgMailApiKey);

exports.createUser = async (req, res, next) => {
  const errors = validationResult(req);
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    let user = await User.findOne({ email: email });
    if (user) {
      const error = new Error(
        "An account with this email address already exists."
      );
      error.statusCode = 401;
      throw error;
    }
    const hashedPw = await bcrypt.hash(password, 12);
    user = new User({
      email: email,
      password: hashedPw,
      name: name,
      registerType: 'local'
    });
    let token;
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        throw err;
      }
      token = buffer.toString("hex");
      // this is been used for email verification
      user.token = token;
      const result = await user.save();

      //this is been used for authentication
      token = jwt.sign(
        {
          email: email,
          userId: result._id.toString(),
        },
        MAESTRO_AI_JWT_SECRET,
        { expiresIn: "1h" }
      );
      user.password=undefined;
      user.token=undefined;
      res
        .status(201)
        .json({ message: "User created!", token: token, user: user });
    });

    const msg = {
      to: email,
      from: "welcome@maestro.ai",
      template_id:"d-ad24a76b4829443c9faf2359e6290324",
      dynamicTemplateData: {
        name: name.split(" ")[0],
        token: user.token
      },
    }
    sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode)
      console.log(response[0].headers)
    })
    .catch((error) => {
      throw error;
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.details = async (req, res, next) => {
  const userId = req.userId;
  try {
    let user = await User.findOne({ _id: userId });
    if (!user) {
      const error = new Error('User could not be found.');
      error.statusCode = 401;
      throw error;
    }
    user.password=undefined;
    user.token=undefined;
    const refreshedToken = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      MAESTRO_AI_JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token: refreshedToken, user: user });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 404;
      throw error;
    }

    // if (user.graphDomain) {
    //   const error = new Error('Account found! However, you might have registered using Google or Facebook. Try logging in from your social account.');
    //   error.statusCode = 401;
    //   throw error;
    // }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Please check your password again.");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: email,
        userId: user._id.toString(),
      },
      MAESTRO_AI_JWT_SECRET,
      { expiresIn: "1h" }
    );
    user.password=undefined;
    res
      .status(200)
      .json({ message: "User logged in!", token: token, user: user });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.loginUserSocial = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const imageUrl = req.body.imageUrl;
  const registerType = "google";
  const verified = "true";
  try {
    let user = await User.findOne({ email: email });

    if (user) {
      user.name = name;
      user.password = undefined;
      user.verified = verified;
      user.imageUrl = imageUrl;
      user.registerType = registerType;
    } else {
      user = new User({
        email: email,
        name: name,
        verified: verified,
        imageUrl: imageUrl,
        registerType: registerType,
      });
    }

    const token = jwt.sign(
      {
        email: email,
        userId: user._id.toString(),
      },
      MAESTRO_AI_JWT_SECRET,
      { expiresIn: "1h" }
    );

    await user.save();

    res
      .status(200)
      .json({ message: "User logged in!", token: token, user: user });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.verify = async (req, res, next) => {
  const userId = req.userId;
  const token = req.params.token;
  try {
    const user = await User.findOne(
      { _id: userId },
    );
    if (!user) {
      const error = new Error("User could not be found.");
      error.statusCode = 401;
      throw error;
    }
    if (token === user.token) {
      user.verified = "true";
      user.token = undefined;
    } else {
      const error = new Error("Invalid token!");
      error.statusCode = 404;
      throw error;
    }
    await user.save();
    user.token = undefined;
    res.status(200).json({ message: "Verification success!", user: user });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  const userId = req.userId;
  try {
    let user = await User.findOne({ _id: userId });
    if (!user) {
      const error = new Error('User could not be found.');
      error.statusCode = 401;
      throw error;
    }
    user.name = req.body.name ? req.body.name : user.name;
    user.email = req.body.email ? req.body.email : user.email;
    user.address = req.body.address ? req.body.address : user.address;
    user.city = req.body.city ? req.body.city : user.city;
    user.country = req.body.country ? req.body.country : user.country;
    user.dob = req.body.dob ? req.body.dob : user.dob;
    user.phone = req.body.phone ? req.body.phone : user.phone;
    user.imageUrl = req.body.imageUrl ? req.body.imageUrl : user.imageUrl;
    user.courses = req.body.courses ? req.body.courses : user.courses;
    user.courses = req.body.courseId ? [...user.courses, req.body.courseId] : user.courses;

    await user.save();
    res.status(200).json({user: user});

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
