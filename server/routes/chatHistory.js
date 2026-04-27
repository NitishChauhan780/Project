const express = require('express');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');

router.get('/:userId', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const history = await ChatHistory.getHistory(req.params.userId, parseInt(limit));
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:userId', async (req, res) => {
  try {
    const { role, content } = req.body;
    if (!role || !content) {
      return res.status(400).json({ error: 'role and content are required' });
    }
    const history = await ChatHistory.addMessage(req.params.userId, role, content);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:userId', async (req, res) => {
  try {
    await ChatHistory.clearHistory(req.params.userId);
    res.json({ message: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;