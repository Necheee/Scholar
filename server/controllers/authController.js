import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../config/db.js';
import generateToken from '../utils/generateToken.js';

// Helper to format student profile so frontend receives identical bankDetails object
export const formatStudentProfile = (p) => {
  if (!p) return null;
  return {
    ...p,
    _id: p.id,
    user: p.user ? { ...p.user, _id: p.user.id } : p.userId,
    bankDetails: {
      bankName: p.bankName || '',
      accountNumber: p.accountNumber || '',
      accountName: p.accountName || '',
    },
    academicRecords: (p.academicRecords || []).map((r) => ({ ...r, _id: r.id })),
  };
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      generateToken(res, user.id);

      res.json({
        _id: user.id,
        id: user.id,
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
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (role === 'Student') {
      if (!profileData.institution || !profileData.department) {
        res.status(400);
        throw new Error('Institution and department are required for students');
      }
    } else if (role === 'Sponsor') {
      if (!profileData.organizationName) {
        res.status(400);
        throw new Error('Organization name is required for sponsors');
      }
    }

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      if (role === 'Student') {
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            institution: profileData.institution,
            department: profileData.department,
          },
        });
      } else if (role === 'Sponsor') {
        await tx.sponsorProfile.create({
          data: {
            userId: newUser.id,
            organizationName: profileData.organizationName,
            description: profileData.description || null,
            website: profileData.website || null,
          },
        });
      }

      return newUser;
    });

    generateToken(res, user.id);

    res.status(201).json({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404);
      throw new Error('There is no user with that email');
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpire,
      },
    });

    console.log(`[EMAIL SIMULATOR] Password reset link for ${user.email}: http://localhost:3000/reset-password?token=${resetToken}`);

    res.status(200).json({
      message: 'Email sent',
      _dev_token: resetToken,
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
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });

    res.status(200).json({ message: 'Password reset successful. Please log in.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Please provide current and new passwords');
    }

    const userId = req.user.id || req.user._id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      res.status(401);
      throw new Error('Invalid current password');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400);
      throw new Error('Please provide password to confirm account deletion');
    }

    const userId = req.user.id || req.user._id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(401);
      throw new Error('Invalid password. Account deletion aborted.');
    }

    // Role-specific cascading updates
    if (user.role === 'Sponsor') {
      await prisma.sponsorship.updateMany({
        where: { sponsorId: user.id },
        data: { status: 'Closed' },
      });
    } else if (user.role === 'Student') {
      await prisma.application.updateMany({
        where: {
          studentId: user.id,
          status: {
            in: [
              'Under screening',
              'Under Admin review',
              'Waiting for additional information',
              'Under Sponsor review',
            ],
          },
        },
        data: { status: 'Withdrawn' },
      });
    }

    // Delete user (cascade automatically deletes profile, records, etc.)
    await prisma.user.delete({ where: { id: user.id } });

    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's profile including bank details
// @route   GET /api/auth/student-profile
// @access  Private (Student)
export const getStudentProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    let profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        academicRecords: true,
      },
    });

    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: {
          userId,
          institution: 'University of Nigeria, Nsukka',
          department: 'Computer Science',
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          academicRecords: true,
        },
      });
    }

    res.json(formatStudentProfile(profile));
  } catch (error) {
    next(error);
  }
};

// @desc    Update current student's profile (institution, department, bankDetails)
// @route   PUT /api/auth/student-profile
// @access  Private (Student)
export const updateStudentProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { institution, department, seekingSponsorship, bankDetails } = req.body;

    const dataToUpdate = {};
    if (institution !== undefined) dataToUpdate.institution = institution;
    if (department !== undefined) dataToUpdate.department = department;
    if (seekingSponsorship !== undefined) dataToUpdate.seekingSponsorship = Boolean(seekingSponsorship);
    if (bankDetails) {
      if (bankDetails.bankName !== undefined) dataToUpdate.bankName = bankDetails.bankName;
      if (bankDetails.accountNumber !== undefined) dataToUpdate.accountNumber = bankDetails.accountNumber;
      if (bankDetails.accountName !== undefined) dataToUpdate.accountName = bankDetails.accountName;
    }

    const updated = await prisma.studentProfile.upsert({
      where: { userId },
      create: {
        userId,
        institution: institution || 'University of Nigeria, Nsukka',
        department: department || 'Computer Science',
        ...dataToUpdate,
      },
      update: dataToUpdate,
      include: {
        user: { select: { id: true, name: true, email: true } },
        academicRecords: true,
      },
    });

    res.json(formatStudentProfile(updated));
  } catch (error) {
    next(error);
  }
};
