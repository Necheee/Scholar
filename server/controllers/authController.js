import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import SponsorProfile from '../models/SponsorProfile.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new Student or Sponsor
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, password, role, ...profileData } = req.body;
    const email = req.body.email.toLowerCase();

    // Validate role
    if (!['Student', 'Sponsor'].includes(role)) {
      res.status(400);
      throw new Error('Invalid role selected. Admins must be created manually.');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      // Create associated profile
      if (role === 'Student') {
        if (!profileData.institution || !profileData.department) {
          await User.findByIdAndDelete(user._id); // Rollback
          res.status(400);
          throw new Error('Institution and department are required for students');
        }
        await StudentProfile.create({
          user: user._id,
          institution: profileData.institution,
          department: profileData.department,
        });
      } else if (role === 'Sponsor') {
        if (!profileData.organizationName) {
          await User.findByIdAndDelete(user._id); // Rollback
          res.status(400);
          throw new Error('Organization name is required for sponsors');
        }
        await SponsorProfile.create({
          user: user._id,
          organizationName: profileData.organizationName,
          description: profileData.description,
          website: profileData.website,
        });
      }

      generateToken(res, user._id);
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    let email = req.body.email;
    if (email) email = email.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('There is no user with that email');
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Since we don't have an email server setup (like SendGrid/Nodemailer) for this project,
    // we will simulate email sending by logging it to the console and returning it in dev.
    console.log(`[EMAIL SIMULATOR] Password reset link for ${user.email}: http://localhost:3000/reset-password?token=${resetToken}`);

    res.status(200).json({ 
      message: 'Email sent',
      // In production, DO NOT return the resetToken in the response! 
      // We only return it here because there is no real email service configured.
      _dev_token: resetToken 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/resetpassword/:resetToken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. Please log in.' });
  } catch (error) {
    next(error);
  }
};
