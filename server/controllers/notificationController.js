import prisma from '../config/db.js';

// Helper to format notifications with dual _id
export const formatNotification = (n) => {
  if (!n) return null;
  return {
    ...n,
    _id: n.id,
    user: n.userId,
    relatedApplication: n.relatedApplicationId,
    relatedDocumentRequest: n.relatedDocRequestId,
  };
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications.map(formatNotification));
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });

    res.json(formatNotification(updated));
  } catch (error) {
    next(error);
  }
};
