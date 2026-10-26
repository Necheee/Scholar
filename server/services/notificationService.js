import prisma from '../config/db.js';

export const createNotification = async (userId, title, message, relatedApplicationId = null, relatedDocumentRequestId = null) => {
  try {
    const finalUserId = userId?.toString?.() || userId;
    const finalAppId = relatedApplicationId?.toString?.() || relatedApplicationId;
    const finalDocReqId = relatedDocumentRequestId?.toString?.() || relatedDocumentRequestId;

    const notification = await prisma.notification.create({
      data: {
        userId: finalUserId,
        title,
        message,
        relatedApplicationId: finalAppId || null,
        relatedDocRequestId: finalDocReqId || null,
      },
    });
    return notification;
  } catch (error) {
    console.error(`Error creating notification for user ${userId}: ${error.message}`);
  }
};
