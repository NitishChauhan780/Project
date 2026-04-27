const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const User = require("../models/User");
const Notification = require("../models/Notification");

router.get("/", async (req, res) => {
  try {
    const { department, year } = req.query;
    const query = { isActive: true };
    
    if (department || year) {
      query.$or = [
        { targetDepartment: '', targetYear: '' }, // Global
        { targetDepartment: department, targetYear: year }, // Exact match
        { targetDepartment: department, targetYear: '' }, // Department-wide
        { targetDepartment: '', targetYear: year } // Year-wide
      ];
    }

    const announcements = await Announcement.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, content, priority, createdBy, targetDepartment, targetYear } = req.body;
    const announcement = new Announcement({
      title,
      content,
      priority,
      createdBy,
      targetDepartment: targetDepartment || '',
      targetYear: targetYear || ''
    });
    await announcement.save();

    // Notify targeted users
    const userQuery = { isActive: true, role: { $ne: "admin" } };
    if (targetDepartment) userQuery.department = targetDepartment;
    if (targetYear) userQuery.yearOfStudy = targetYear;

    const recipients = await User.find(userQuery).select("_id");
    if (recipients.length > 0) {
      await Notification.insertMany(
        recipients.map((u) => ({
          userId: u._id,
          type: "announcement",
          title,
          message: content,
          priority: priority === "high" ? "high" : "medium",
          metadata: { link: "/dashboard" },
        })),
      );
    }

    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Announcement hidden" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
