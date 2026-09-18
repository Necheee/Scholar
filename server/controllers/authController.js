import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import SponsorProfile from '../models/SponsorProfile.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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
    const { name, email, password, role, ...profileData } = req.body;

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

