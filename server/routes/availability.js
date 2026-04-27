const express = require('express');
const router = express.Router();
const CounsellorAvailability = require('../models/CounsellorAvailability');

router.get('/:counsellorId', async (req, res) => {
  try {
    const { counsellorId } = req.params;
    const availability = await CounsellorAvailability.getOrCreate(counsellorId);
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:counsellorId', async (req, res) => {
  try {
    const { counsellorId } = req.params;
    const { daysOfWeek, timeSlots, timezone, sessionDuration, breakBetweenSessions, isActive } = req.body;
    
    const availability = await CounsellorAvailability.getOrCreate(counsellorId);
    
    if (daysOfWeek !== undefined) availability.daysOfWeek = daysOfWeek;
    if (timeSlots !== undefined) availability.timeSlots = timeSlots;
    if (timezone !== undefined) availability.timezone = timezone;
    if (sessionDuration !== undefined) availability.sessionDuration = sessionDuration;
    if (breakBetweenSessions !== undefined) availability.breakBetweenSessions = breakBetweenSessions;
    if (isActive !== undefined) availability.isActive = isActive;
    
    await availability.save();
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:counsellorId/available-slots/:date', async (req, res) => {
  try {
    const { counsellorId, date } = req.params;
    const availability = await CounsellorAvailability.getOrCreate(counsellorId);
    
    const dayOfWeek = new Date(date).getDay();
    if (!availability.daysOfWeek.includes(dayOfWeek)) {
      return res.json({ availableSlots: [], reason: 'Not available on this day' });
    }
    
    const Appointment = require('../models/Appointment');
    const bookedSlots = await Appointment.find({
      counsellorId,
      date,
      status: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot');
    
    const bookedTimeSlots = bookedSlots.map(a => a.timeSlot);
    const availableSlots = availability.timeSlots
      .filter(slot => !bookedTimeSlots.includes(slot.start))
      .map(slot => ({
        start: slot.start,
        end: slot.end
      }));
    
    res.json({ availableSlots, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;