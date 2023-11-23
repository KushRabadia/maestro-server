const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
  },
  name: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  phone: {
    type: String
  },
  dob: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  country: {
    type: String
  },
  token: {
    type: String
  },
  verified: {
    type: String
  },
  registerType: {
    type: String
  },
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
