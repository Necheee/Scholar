import Notification from '../models/Notification.js';

export const createNotification = async (userId, title, message, relatedApplicationId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      relatedApplication: relatedApplicationId
    });
    return notification;
  } catch (error) {
    console.error(`Error creating notification for user ${userId}: ${error.message}`);
  }
};

