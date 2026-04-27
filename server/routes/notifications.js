const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { unreadOnly, limit = 50 } = req.query;
    
    const query = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('metadata.relatedId', 'name email');
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Notification.getUnreadCount(userId);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:notificationId/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    await notification.markAsRead();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, type, title, message, ...metadata } = req.body;
    
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ error: 'userId, type, title, and message are required' });
    }
    
    const notification = await Notification.createNotification(userId, type, title, message, { metadata });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const { userIds, type, title, message, ...options } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || !type || !title || !message) {
      return res.status(400).json({ error: 'userIds (array), type, title, and message are required' });
    }
    
    const notifications = await Notification.insertMany(
      userIds.map(userId => ({
        userId,
        type,
        title,
        message,
        ...options
      }))
    );
    
    res.status(201).json({ created: notifications.length, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:notificationId', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:userId/clear-read', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Notification.deleteMany({ userId, isRead: true });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;