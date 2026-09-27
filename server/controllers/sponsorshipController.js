import Sponsorship from '../models/Sponsorship.js';
import Application from '../models/Application.js';
import { logActivity } from '../services/activityService.js';

// @desc    Create a new sponsorship
// @route   POST /api/sponsorships
// @access  Private/Sponsor
export const createSponsorship = async (req, res, next) => {
  try {
    const {
      title,
      description,
      eligibilityRequirements,
      academicRequirements,
      requiredDocuments,
      applicationDeadline,
      duration,
    } = req.body;

    const sponsorship = await Sponsorship.create({
      sponsor: req.user._id,
      title,
      description,
      eligibilityRequirements,
      academicRequirements,
      requiredDocuments,
      applicationDeadline,
      duration,
    });

    await logActivity(
      'Sponsorship Created',
      `Sponsorship "${title}" was created.`,
      req.user._id,
      'Sponsor',
      sponsorship._id
    );

    res.status(201).json(sponsorship);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active sponsorships
// @route   GET /api/sponsorships
// @access  Public or Private (Students/Sponsors)
export const getSponsorships = async (req, res, next) => {
  try {
    let sponsorships = await Sponsorship.find({ status: 'Active' }).populate('sponsor', 'name');
    
    // If a student is fetching the list, hide the sponsorships they have already applied to
    if (req.user && req.user.role === 'Student') {
      const studentApps = await Application.find({ 
        student: req.user._id, 
        status: { $ne: 'Withdrawn' } 
      });
      const appliedSponsorshipIds = studentApps.map(app => app.sponsorship.toString());
      sponsorships = sponsorships.filter(s => !appliedSponsorshipIds.includes(s._id.toString()));
    }

    res.json(sponsorships);
  } catch (error) {
    next(error);
  }
};

// @desc    Get sponsorship by ID
// @route   GET /api/sponsorships/:id
// @access  Public or Private
export const getSponsorshipById = async (req, res, next) => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id).populate('sponsor', 'name');

    if (sponsorship) {
      res.json(sponsorship);
    } else {
      res.status(404);
      throw new Error('Sponsorship not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a sponsorship (only if not locked)
// @route   PUT /api/sponsorships/:id
// @access  Private/Sponsor
export const updateSponsorship = async (req, res, next) => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id);

    if (!sponsorship) {
      res.status(404);
      throw new Error('Sponsorship not found');
    }

    // Ensure the user is the owner
    if (sponsorship.sponsor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this sponsorship');
    }

    // Check if locked
    if (sponsorship.isLocked) {
      res.status(400);
      throw new Error('Cannot edit a sponsorship after applications have been received');
    }

    const updatedSponsorship = await Sponsorship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedSponsorship);
  } catch (error) {
    next(error);
  }
};

