const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// Get all appointments (Admin only)
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("studentId", "name email department program")
      .populate("counsellorId", "name email")
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get appointments for a specific student (Auth required, ownership check)
router.get("/student/:studentId", protect, async (req, res) => {
  try {
    // Only allow self or admin/counsellor
    if (req.user.id !== req.params.studentId && req.user.role === "student") {
      return res
        .status(403)
        .json({ error: "Not authorized to view these appointments" });
    }

    const appointments = await Appointment.find({
      studentId: req.params.studentId,
    })
      .populate("counsellorId", "name email specialization")
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get appointments for a specific counsellor (Auth required, ownership check)
router.get("/counsellor/:counsellorId", protect, async (req, res) => {
  try {
    // Only allow self or admin
    if (
      req.user.id !== req.params.counsellorId &&
      req.user.role === "counsellor"
    ) {
      // Counsellor can see their own
    } else if (req.user.role === "admin") {
      // Admin can see any
    } else {
      return res.status(403).json({ error: "Not authorized" });
    }

    const appointments = await Appointment.find({
      counsellorId: req.params.counsellorId,
    })
      .populate(
        "studentId",
        "name email department yearOfStudy program section",
      )
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create new appointment (Auth required)
router.post("/", protect, async (req, res) => {
  try {
    const { studentId, counsellorId, date, timeSlot } = req.body;

    // Ensure student is booking for themselves
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res
        .status(403)
        .json({ error: "Not authorized to book for another student" });
    }

    const existingAppointment = await Appointment.findOne({
      counsellorId,
      date,
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      return res.status(409).json({
        error: "This time slot is already booked.",
      });
    }

    const appointment = new Appointment({
      studentId,
      counsellorId,
      date,
      timeSlot,
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: "Booking failed" });
  }
});

// Update appointment (Auth required)
router.put("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });

    // Only participant or admin can update
    if (
      req.user.id !== appointment.studentId.toString() &&
      req.user.id !== appointment.counsellorId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const {
      status,
      notes,
      sessionNotes,
      followUpDate,
      referral,
      sharedWithStudent,
    } = req.body;

    // Pick allowed fields based on role
    const updateData = {};
    if (status) updateData.status = status;

    // Only counsellor can update session notes/clinical info
    if (req.user.role === "counsellor" || req.user.role === "admin") {
      if (notes) updateData.notes = notes;
      if (sessionNotes) updateData.sessionNotes = sessionNotes;
      if (followUpDate) updateData.followUpDate = followUpDate;
      if (referral) updateData.referral = referral;
      if (sharedWithStudent !== undefined)
        updateData.sharedWithStudent = sharedWithStudent;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    res.json(updatedAppointment);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// Get counsellors (Auth required)
router.get("/counsellors", protect, async (req, res) => {
  try {
    const counsellors = await User.find({
      role: { $in: ["counsellor", "counselor"] },
      isActive: true,
    })
      .select(
        "name email specialization bio experience rating totalSessions availabilityStatus badges avatar",
      )
      .sort({ name: 1 });
    res.json(counsellors);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get availability (Auth required)
router.get("/availability/:counsellorId/:date", protect, async (req, res) => {
  try {
    const { counsellorId, date } = req.params;
    const bookedSlots = await Appointment.find({
      counsellorId,
      date,
      status: { $in: ["pending", "confirmed"] },
    }).select("timeSlot");

    const bookedTimeSlots = bookedSlots.map((a) => a.timeSlot);
    res.json({ bookedSlots: bookedTimeSlots });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Rate appointment (Auth required)
router.post("/:id/rate", protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });

    // Only student of the appointment can rate
    if (req.user.id !== appointment.studentId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (appointment.status !== "completed") {
      return res
        .status(400)
        .json({ error: "Only completed appointments can be rated" });
    }

    appointment.rating = Number(rating);
    appointment.review = review;
    await appointment.save();

    // Update counsellor's average rating
    const ratedAppointments = await Appointment.find({
      counsellorId: appointment.counsellorId,
      rating: { $exists: true, $ne: null },
    });

    let avgRating = 5;
    if (ratedAppointments.length > 0) {
      avgRating =
        ratedAppointments.reduce((sum, apt) => sum + apt.rating, 0) /
        ratedAppointments.length;
    }

    await User.findByIdAndUpdate(appointment.counsellorId, {
      rating: Number(avgRating.toFixed(1)),
      totalSessions: await Appointment.countDocuments({
        counsellorId: appointment.counsellorId,
        status: "completed",
      }),
    });

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: "Rating failed" });
  }
});

module.exports = router;
