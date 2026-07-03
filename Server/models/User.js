const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    //   match: [
    //     /^[a-zA-Z0-9._%+-]+@iiita\.ac\.kr|iiita\.ac\.in$/,
    //     'Please use a valid IIIT Allahabad email address',
    //   ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      enum: ['Student', 'Admin'],
      default: 'Student',
    },
    isVerified: {
      type: Boolean,
      default: false, // Will become true after OTP verification
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);