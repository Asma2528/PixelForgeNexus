// Required packages
const bcrypt = require('bcryptjs'); // for password hashing
const jwt = require('jsonwebtoken'); // for creating JWT tokens
const User = require('../models/User'); // User model for MongoDB
const Otp = require('../models/Otp'); // OTP model for MongoDB
const { sendOtpEmail } = require('../utils/mailer'); // Utility function to send OTP emails
const crypto = require('crypto'); // for generating random values like OTPs and reset tokens
const { sendPasswordResetEmail } = require('../utils/mailer'); // Utility function to send password reset emails
const OtpLog = require('../models/OtpLog'); // OTP log model to record OTP actions

// Function to generate JWT token for the user
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },  // payload containing user ID and role
    process.env.JWT_SECRET,  // secret key to sign the token
    { expiresIn: '1h' }  // expiration time for the token
  );
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;  // Extract user details from the request body

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const user = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login the user and send OTP for MFA (Multi-Factor Authentication)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; // Extract credentials from the request body

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Compare the password entered by the user with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if an OTP was sent recently
    const lastOtp = await Otp.findOne({ userId: user._id, type: 'mfa' }).sort({ createdAt: -1 });

    // If an OTP was sent recently, prevent requesting another OTP until 60 seconds pass
    if (lastOtp) {
      const secondsSinceLastOtp = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
      if (secondsSinceLastOtp < 60) {
        await OtpLog.create({
          userId: user._id,
          type: 'mfa',
          ip: req.ip,
          status: 'blocked'
        });

        return res.status(429).json({
          message: `Please wait ${Math.ceil(60 - secondsSinceLastOtp)} seconds before requesting a new OTP.`
        });
      }
    }

    // Generate a new OTP code
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Remove any old OTPs and store the new one
    await Otp.deleteMany({ userId: user._id, type: 'mfa' });
    await Otp.create({
      userId: user._id,
      code: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),  // OTP expires in 5 minutes
      type: 'mfa'
    });

    // Send the OTP to the user's email
    await sendOtpEmail(user.email, otpCode);

    // Log the OTP sending action
    await OtpLog.create({
      userId: user._id,
      type: 'mfa',
      ip: req.ip,
      status: 'sent'
    });

    res.status(200).json({
      message: 'OTP sent to your email. Verify to complete login.',
      tempUserId: user._id  // Temporary user ID to associate with the OTP
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify the OTP entered by the user during MFA
exports.verifyOtp = async (req, res) => {
  const { tempUserId, otp } = req.body;  // Extract temporary user ID and OTP

  // Find the OTP entry in the database
  const otpEntry = await Otp.findOne({ userId: tempUserId, code: otp.toString() });

  if (!otpEntry) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Check if the OTP has expired
  if (otpEntry.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Find the user who requested the OTP
  const user = await User.findById(tempUserId);

  // Generate a JWT token for the user and send it back
  const token = generateToken(user);

  // Clean up by deleting the used OTP
  await Otp.deleteMany({ userId: user._id });

  res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
};

// Fetch all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();  // Get all users from the database
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// Update user details (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const { userId } = req.params;  // User ID to update

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate the new role if provided
    if (role && role !== "admin" && role !== "lead" && role !== "developer") {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();  // Save the updated user details to the database

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

// Request password reset (via email)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;  // Email to send the reset link to

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No user found with that email' });
    }

    // Check if a reset OTP was requested recently
    const lastResetOtp = await Otp.findOne({ userId: user._id, type: 'resetPassword' }).sort({ createdAt: -1 });

    if (lastResetOtp) {
      const secondsSinceLastReset = (Date.now() - lastResetOtp.createdAt.getTime()) / 1000;
      if (secondsSinceLastReset < 60) {
        // Log the blocked attempt and prevent a new reset request too soon
        await OtpLog.create({
          userId: user._id,
          type: 'resetPassword',
          ip: req.ip,
          status: 'blocked'
        });

        return res.status(429).json({
          message: `Please wait ${Math.ceil(60 - secondsSinceLastReset)} seconds before requesting a new reset link.`
        });
      }
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store the reset OTP in the database
    await Otp.create({
      userId: user._id,
      code: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),  // OTP expires in 1 hour
      type: 'resetPassword'
    });

    // Generate reset link and send it to the user's email
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    // Log the OTP sending action
    await OtpLog.create({
      userId: user._id,
      type: 'resetPassword',
      ip: req.ip,
      status: 'sent'
    });

    res.status(200).json({ message: 'Password reset link sent to your email' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset the user's password using the reset token
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;  // Extract the reset token and new password

    // Find the OTP entry for the reset token
    const otpEntry = await Otp.findOne({ code: resetToken, type: 'resetPassword' });
    if (!otpEntry) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if the token has expired
    if (otpEntry.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Reset token expired' });
    }

    // Find the user associated with the OTP
    const user = await User.findById(otpEntry.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Hash the new password and save it to the user's account
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete the OTP entry as the password has been reset
    await Otp.deleteOne({ _id: otpEntry._id });

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
