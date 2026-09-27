import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (action, description, userId, role, relatedId) => {
  try {
    await ActivityLog.create({
      action,
      description,
      user: userId,
      role,
      relatedId
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
