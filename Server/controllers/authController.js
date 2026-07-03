const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new student
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 1. Check valid IIIT Allahabad email
    // if (!email.endsWith('@iiita.ac.in')) {
    //   return res.status(400).json({ message: 'Only @iiita.ac.in emails are allowed' });
    // }

    // 2. Check if user already exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists and is verified' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create or update unverified user
    // Check if this email matches the SUPER ADMIN in .env
   const assignedRole = (email === process.env.ADMIN_EMAIL) ? 'Admin' : 'Student';
    if (!user) {
      user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        role: assignedRole
      });
    } else {
      user.password = hashedPassword;
      user.fullName = fullName;
      user.role = assignedRole;
      await user.save();
    }

    // 5. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
     
    // 👨‍💻 DEVELOPER HACK: Print OTP to terminal for fast testing
    console.log(`\n🔥 DEV OTP for ${email} is: ${otp}\n`);
    // 6. Save OTP to DB
    await OTP.findOneAndDelete({ email }); // Delete old OTP if exists
    await OTP.create({ email, otp });

    // 7. Send Email
    const message = `Welcome to FixIt! Your OTP for registration is: ${otp}. It is valid for 5 minutes.`;
    await sendEmail({ email, subject: 'FixIt - Verify Your Account', message });

    res.status(200).json({ message: 'OTP sent to your email. Please verify.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    user.isVerified = true;
    await user.save();

    await OTP.findOneAndDelete({ email }); // Clean up OTP

    res.status(200).json({
      message: 'Account verified successfully',
      token: generateToken(user._id),
      role: user.role,
      email: user.email,
      isAdmin: user.email === process.env.ADMIN_EMAIL && user.role === 'Admin',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Logged in successfully',
      token: generateToken(user._id),
      role: user.role,
      email: user.email,
      isAdmin: user.email === process.env.ADMIN_EMAIL && user.role === 'Admin',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    // Why: Frontend needs fresh user data without relying on stale localStorage
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update logged-in user's profile (fullName and/or password)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Why: Allow name-only updates without requiring password fields
    if (fullName && fullName.trim()) {
      user.fullName = fullName.trim();
    }

    // How: Password change requires current password verification, then bcrypt hashing (same as register)
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

