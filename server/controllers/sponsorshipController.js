import prisma from '../config/db.js';
import { logActivity } from '../services/activityService.js';

// Helper to format sponsorship object with array requiredDocuments and dual _id
export const formatSponsorship = (s) => {
  if (!s) return null;
  let docs = s.requiredDocuments;
  if (typeof docs === 'string') {
    try {
      docs = JSON.parse(docs);
    } catch {
      docs = [];
    }
  }
  return {
    ...s,
    _id: s.id,
    sponsor: s.sponsor ? { ...s.sponsor, _id: s.sponsor.id } : s.sponsorId,
    requiredDocuments: Array.isArray(docs) ? docs : [],
  };
};

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
      grantAmount,
    } = req.body;

    const sponsorId = req.user.id || req.user._id;

    const sponsorship = await prisma.sponsorship.create({
      data: {
        sponsorId,
        title,
        description,
        eligibilityRequirements,
        academicRequirements,
        requiredDocuments: JSON.stringify(requiredDocuments || []),
        applicationDeadline: new Date(applicationDeadline),
        duration,
        grantAmount: grantAmount ? Number(grantAmount) : 250000,
      },
      include: {
        sponsor: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(
      'Sponsorship Created',
      `Sponsorship "${title}" was created.`,
      sponsorId,
      'Sponsor',
      sponsorship.id
    );

    res.status(201).json(formatSponsorship(sponsorship));
  } catch (error) {
    next(error);
  }
};

// @desc    Get sponsorships (scoped by role: Sponsor sees own, Student sees active, Admin sees all)
// @route   GET /api/sponsorships
// @access  Private (Students/Sponsors/Admin)
export const getSponsorships = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    let whereClause = { status: 'Active' };

    if (req.user && req.user.role === 'Sponsor') {
      whereClause = { sponsorId: userId };
    } else if (req.user && req.user.role === 'Admin') {
      whereClause = {};
    }

    let sponsorships = await prisma.sponsorship.findMany({
      where: whereClause,
      include: {
        sponsor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If a student is fetching the list, hide the sponsorships they have already applied to
    if (req.user && req.user.role === 'Student') {
      const studentApps = await prisma.application.findMany({
        where: {
          studentId: userId,
          status: { not: 'Withdrawn' },
        },
        select: { sponsorshipId: true },
      });
      const appliedSponsorshipIds = new Set(studentApps.map((app) => app.sponsorshipId));
      sponsorships = sponsorships.filter((s) => !appliedSponsorshipIds.has(s.id));
    }

    res.json(sponsorships.map(formatSponsorship));
  } catch (error) {
    next(error);
  }
};

// @desc    Get sponsorship by ID
// @route   GET /api/sponsorships/:id
// @access  Public or Private
export const getSponsorshipById = async (req, res, next) => {
  try {
    const sponsorship = await prisma.sponsorship.findUnique({
      where: { id: req.params.id },
      include: {
        sponsor: { select: { id: true, name: true, email: true } },
      },
    });

    if (sponsorship) {
      res.json(formatSponsorship(sponsorship));
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
    const userId = req.user.id || req.user._id;
    const sponsorship = await prisma.sponsorship.findUnique({
      where: { id: req.params.id },
    });

    if (!sponsorship) {
      res.status(404);
      throw new Error('Sponsorship not found');
    }

    // Ensure the user is the owner
    if (sponsorship.sponsorId !== userId) {
      res.status(403);
      throw new Error('Not authorized to update this sponsorship');
    }

    // Check if locked
    if (sponsorship.isLocked) {
      res.status(400);
      throw new Error('Cannot edit a sponsorship after applications have been received');
    }

    const updateData = { ...req.body };
    if (updateData.requiredDocuments) {
      updateData.requiredDocuments = JSON.stringify(updateData.requiredDocuments);
    }
    if (updateData.applicationDeadline) {
      updateData.applicationDeadline = new Date(updateData.applicationDeadline);
    }
    if (updateData.grantAmount !== undefined) {
      updateData.grantAmount = Number(updateData.grantAmount);
    }
    delete updateData.id;
    delete updateData._id;
    delete updateData.sponsor;
    delete updateData.sponsorId;

    const updatedSponsorship = await prisma.sponsorship.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        sponsor: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(formatSponsorship(updatedSponsorship));
  } catch (error) {
    next(error);
  }
};
