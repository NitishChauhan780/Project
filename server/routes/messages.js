const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Appointment = require("../models/Appointment");
const { protect } = require("../middleware/auth");

// Get messages for a specific conversation (appointment)
router.get("/conversation/:appointmentId", protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    // Authorization check
    if (req.user.id !== appointment.studentId.toString() && 
        req.user.id !== appointment.counsellorId.toString() && 
        req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Not your conversation." });
    }

    if (!["confirmed", "completed"].includes(appointment.status)) {
      return res.status(403).json({ error: "Access denied. Appointment not confirmed." });
    }

    const messages = await Message.getConversation(appointmentId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get unread messages for user
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { role } = req.query;
    const unreadMessages = await Message.getUnreadByRole(userId, role);
    res.json(unreadMessages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all conversations for a user
router.get("/conversations/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized" });
    }

    const appointments = await Appointment.find({
      $or: [{ studentId: userId }, { counsellorId: userId }],
      status: { $in: ["confirmed", "completed"] },
    })
      .populate("studentId", "name email")
      .populate("counsellorId", "name email");

    const conversations = await Promise.all(
      appointments.map(async (apt) => {
        const lastMessage = await Message.findOne({ appointmentId: apt._id })
          .sort({ createdAt: -1 })
          .populate("senderId", "name");

        const unreadCount = await Message.countDocuments({
          appointmentId: apt._id,
          senderId: { $ne: userId },
          isRead: false,
        });

        return {
          appointmentId: apt._id,
          student: apt.studentId,
          counsellor: apt.counsellorId,
          lastMessage,
          unreadCount,
          completedAt: apt.updatedAt,
        };
      }),
    );

    conversations.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );
    });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Send new message
router.post("/", protect, async (req, res) => {
  try {
    const { appointmentId, content } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    if (!appointmentId || !content) {
      return res.status(400).json({ error: "appointmentId and content are required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    // Authorization check
    if (senderId !== appointment.studentId.toString() && 
        senderId !== appointment.counsellorId.toString()) {
      return res.status(403).json({ error: "Not authorized to send messages in this chat" });
    }

    if (!["confirmed", "completed"].includes(appointment.status)) {
      return res.status(403).json({ error: "Access denied. Chat is only available for accepted appointments." });
    }

    const message = await Message.create({
      appointmentId,
      senderId,
      senderRole,
      content,
    });
    await message.populate("senderId", "name role");

    const Notification = require("../models/Notification");
    let recipientId = senderRole === "counsellor" ? appointment.studentId : appointment.counsellorId;

    await Notification.createNotification(
      recipientId,
      "message",
      "New message from your session",
      content.substring(0, 100),
      {
        metadata: {
          relatedId: appointmentId,
          link: `/messages/${appointmentId}`,
        },
      },
    );

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark single message read
router.put("/:messageId/read", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });
    
    // Only recipient can mark as read
    if (req.user.id === message.senderId.toString()) {
      return res.status(403).json({ error: "Cannot mark your own message as read" });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();
    
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Mark whole conversation read
router.put("/conversation/:appointmentId/read/:userId", protect, async (req, res) => {
  try {
    const { appointmentId, userId } = req.params;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await Message.markConversationRead(appointmentId, userId);
    res.json({ message: "Conversation marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
