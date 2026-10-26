import prisma from '../config/db.js';

export const logActivity = async (action, description, userId, role, relatedId) => {
  try {
    const finalUserId = userId?.toString?.() || userId;
    const finalRelatedId = relatedId?.toString?.() || relatedId;

    await prisma.activityLog.create({
      data: {
        action,
        description,
        userId: finalUserId || null,
        role: role || null,
        relatedId: finalRelatedId || null,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
