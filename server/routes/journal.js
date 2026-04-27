const express = require('express');
const router = require('express').Router();
const JournalEntry = require('../models/JournalEntry');
const { protect } = require('../middleware/auth');

// Get journals for a user (Auth required, ownership check)
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow self or admin/counsellor
    if (req.user.id !== userId && req.user.role === 'student') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const entries = await JournalEntry.find({ userId })
      .sort({ date: -1 })
      .limit(20);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new journal entry (Auth required)
router.post('/', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Journal content is required' });
    }

    const sentimentPrompt = `Analyze this journal entry from an Indian college student and respond with ONLY valid JSON (no markdown, no explanation):
{
  "sentiment": "positive" or "neutral" or "negative",
  "sentimentScore": number between 0.0 and 1.0,
  "emotions": ["array of emotions like joy, sadness, anxiety, anger, fear, hope, gratitude, frustration, loneliness"],
  "insight": "a warm, empathetic 2-3 sentence response in simple English that acknowledges their feelings and offers gentle encouragement"
}

Journal entry: "${content}"`;

    const sentimentResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sentimentPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        })
      }
    );

    const sentimentData = await sentimentResponse.json();
    let sentimentResult = { sentiment: 'neutral', sentimentScore: 0.5, emotions: [], insight: 'Thank you for sharing your thoughts.' };

    try {
      if (sentimentData.candidates && sentimentData.candidates[0]?.content?.parts?.[0]?.text) {
        const text = sentimentData.candidates[0].content.parts[0].text;
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        sentimentResult = JSON.parse(cleanText);
      }
    } catch (parseErr) {
      console.log('Sentiment analysis parse failed, using fallback');
    }

    const entry = new JournalEntry({
      userId,
      content,
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.sentimentScore,
      emotions: sentimentResult.emotions || [],
      insight: sentimentResult.insight
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error('Journal Error'); // Do not log full err if it might contain sensitive data
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

module.exports = router;