const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, body, language, category, tags, videoUrl, imageUrl, readTime } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    if (category === 'video' && !videoUrl) {
      return res.status(400).json({ error: 'Video URL is required for video resources' });
    }
    const resource = new Resource({ title, content, body, language, category, tags, videoUrl, imageUrl, readTime });
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, content, body, language, category, tags, videoUrl, imageUrl, readTime } = req.body;
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { title, content, body, language, category, tags, videoUrl, imageUrl, readTime },
      { new: true }
    );
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;