const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sgMail = require('@sendgrid/mail')

const User = require('../models/user')

sgMail.setApiKey(
  'SG._7e4gfvfSwqWRXogjaWVUg.5W0lzD7L9f_-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'
)

exports.createUser = async (req, res, next) => {
  const errors = validationResult(req)
  const email = req.body.email
  const name = req.body.name
  const password = req.body.password
  console.log(req.body)
  try {
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg)
      error.statusCode = 422
      error.data = errors.array()
      throw error
    }
    let user = await User.findOne({ email: email })
    if (user) {
      const error = new Error(
        'An account with this email address already exists.'
      )
      error.statusCode = 401
      throw error
    }
    const hashedPw = await bcrypt.hash(password, 12)
    user = new User({
      email: email,
      password: hashedPw,
      name: name,
    })
    let token
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        throw err
      }
      token = buffer.toString('hex')
      user.token = token
      const result = await user.save()
      token = jwt.sign(
        {
          email: email,
          userId: result._id.toString(),
        },
        'wallgatekushrabadiawallgatekushrabadia',
        { expiresIn: '1h' }
      )
      delete user.password
      delete user.token
      res.status(201).json({
        message: 'User created!',
        token: token,
        user: user,
      })
    })

    // const msg = {
    //   to: email,
    //   from: "welcome@maestro.ai",
    //   template_id:"d-ad24a76b4829443c9faf2359e6290324",
    //   dynamicTemplateData: {
    //     name: name.split(" ")[0],
    //     token: token
    //   },
    // }
    // sgMail
    // .send(msg)
    // .then((response) => {
    //   console.log(response[0].statusCode)
    //   console.log(response[0].headers)
    // })
    // .catch((error) => {
    //   throw error;
    // })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.loginUser = async (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  console.log(req.body)

  try {
    const user = await User.findOne({ email: email })
    if (!user) {
      const error = new Error('A user with this email could not be found.')
      error.statusCode = 404
      throw error
    }

    // if (user.graphDomain) {
    //   const error = new Error('Account found! However, you might have registered using Google or Facebook. Try logging in from your social account.');
    //   error.statusCode = 401;
    //   throw error;
    // }

    const isEqual = await bcrypt.compare(password, user.password)
    if (!isEqual) {
      const error = new Error('Please check your password again.')
      error.statusCode = 401
      throw error
    }
    const token = jwt.sign(
      {
        email: email,
        userId: user._id.toString(),
      },
      'maestroaijwtsecret',
      { expiresIn: '1h' }
    )
    delete user.password
    res.status(200).json({
      message: 'User logged in!',
      token: token,
      user: user,
    })
  } catch (err) {
    console.log(err)
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.loginUserSocial = async (req, res, next) => {
  const name = req.body.name
  const email = req.body.email
  const imageUrl = req.body.imageUrl
  const graphDomain = req.body.graphDomain
  const verified = 'true'
  try {
    let user = await User.findOne({ email: email })

    if (user) {
      if (!user.graphDomain) {
        user.name = name
        user.password = undefined
        user.verified = verified
        user.imageUrl = imageUrl
        user.graphDomain = graphDomain
      }
    } else {
      user = new User({
        email: email,
        name: name,
        verified: verified,
        imageUrl: imageUrl,
        graphDomain: graphDomain,
      })
    }

    const token = jwt.sign(
      {
        email: email,
        userId: user._id.toString(),
      },
      'wallgatekushrabadiawallgatekushrabadia',
      { expiresIn: '1h' }
    )

    await user.save()

    res.status(200).json({
      message: 'User logged in!',
      token: token,
      user: user,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.verify = async (req, res, next) => {
  const userId = req.userId
  const token = req.params.token
  try {
    const user = await User.findOne({ _id: userId }, { orders: 0, password: 0 })
    if (!user) {
      const error = new Error('User could not be found.')
      error.statusCode = 401
      throw error
    }
    if (token === user.token) {
      user.verified = 'true'
      user.token = undefined
    } else {
      const error = new Error('Invalid token!')
      error.statusCode = 404
      throw error
    }
    await user.save()
    user.token = undefined
    res.status(200).json({ message: 'Verification success!', user: user })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
