const express = require('express');
const router = express.Router();
const QuizResult = require('../models/QuizResult');

const severityMap = {
  'PHQ-9': { 0: 'minimal', 1: 'minimal', 2: 'minimal', 3: 'minimal', 4: 'minimal',
              5: 'minimal', 6: 'minimal', 7: 'minimal', 8: 'minimal', 9: 'minimal',
              10: 'mild', 11: 'mild', 12: 'mild', 13: 'mild', 14: 'mild',
              15: 'moderate', 16: 'moderate', 17: 'moderate', 18: 'moderate', 19: 'moderate',
              20: 'severe', 21: 'severe', 22: 'severe', 23: 'severe', 24: 'severe' },
  'GAD-7': { 0: 'minimal', 1: 'minimal', 2: 'minimal', 3: 'minimal', 4: 'minimal',
              5: 'minimal', 6: 'minimal', 7: 'minimal', 8: 'minimal', 9: 'mild',
              10: 'mild', 11: 'mild', 12: 'mild', 13: 'mild', 14: 'mild',
              15: 'moderate', 16: 'moderate', 17: 'moderate', 18: 'moderate', 19: 'severe',
              20: 'severe', 21: 'severe' },
  'PSS-10': { 0: 'minimal', 1: 'minimal', 2: 'minimal', 3: 'minimal',
              13: 'low', 14: 'low', 15: 'low', 16: 'low', 17: 'low', 18: 'low', 19: 'low', 20: 'low',
              21: 'moderate', 22: 'moderate', 23: 'moderate', 24: 'moderate', 25: 'moderate',
              26: 'high', 27: 'high', 28: 'high', 29: 'high', 30: 'high',
              31: 'very_high', 32: 'very_high', 33: 'very_high', 34: 'very_high', 35: 'very_high',
              36: 'very_high', 37: 'very_high', 38: 'very_high', 39: 'very_high', 40: 'very_high' },
  'ISI': { 0: 'none', 1: 'none', 2: 'none', 3: 'none', 4: 'none', 5: 'none', 6: 'none', 7: 'subthreshold',
           8: 'subthreshold', 9: 'subthreshold', 10: 'subthreshold', 11: 'subthreshold', 12: 'subthreshold',
           13: 'moderate', 14: 'moderate', 15: 'moderate', 16: 'moderate', 17: 'moderate', 18: 'moderate',
           19: 'severe', 20: 'severe', 21: 'severe', 22: 'severe', 23: 'severe', 24: 'severe' },
  'GHQ-12': { 0: 'good', 1: 'good', 2: 'good', 3: 'good', 4: 'good', 5: 'good',
              6: 'fair', 7: 'fair', 8: 'fair', 9: 'fair', 10: 'fair', 11: 'fair',
              12: 'poor', 13: 'poor', 14: 'poor', 15: 'poor', 16: 'poor', 17: 'poor',
              18: 'concern', 19: 'concern', 20: 'concern', 21: 'concern', 22: 'concern', 23: 'concern',
              24: 'critical', 25: 'critical', 26: 'critical', 27: 'critical', 28: 'critical', 29: 'critical',
              30: 'critical', 31: 'critical', 32: 'critical', 33: 'critical', 34: 'critical', 35: 'critical',
              36: 'critical' }
};

const recommendations = {
  'PHQ-9': {
    'minimal': 'Your responses suggest minimal depression symptoms. Continue maintaining healthy habits.',
    'mild': 'You may be experiencing mild depression symptoms. Consider talking to someone or engaging in self-care activities.',
    'moderate': 'Your responses suggest moderate depression. We recommend speaking with a counsellor.',
    'severe': 'Your responses indicate severe depression symptoms. Please consider reaching out to a mental health professional.',
    'extremely_severe': 'Your responses indicate severe symptoms. Please contact a mental health professional immediately.'
  },
  'GAD-7': {
    'minimal': 'Your anxiety levels appear normal. Keep up your healthy coping strategies.',
    'mild': 'You may be experiencing mild anxiety. Try relaxation techniques and breathing exercises.',
    'moderate': 'Your responses suggest moderate anxiety. Consider speaking with a counsellor.',
    'severe': 'Your anxiety levels are high. We strongly recommend professional support.'
  },
  'PSS-10': {
    'minimal': 'You have low stress levels. Keep maintaining your balance.',
    'low': 'Your stress levels are manageable. Continue with your current coping strategies.',
    'moderate': 'You may be experiencing moderate stress. Consider self-care activities.',
    'high': 'Your stress levels are elevated. Take time for relaxation and consider talking to someone.',
    'very_high': 'You are experiencing very high stress. Please consider professional support.'
  },
  'ISI': {
    'none': 'Your sleep appears to be healthy.',
    'subthreshold': 'You may have some sleep difficulties. Consider sleep hygiene practices.',
    'moderate': 'Your responses suggest moderate insomnia. Consider speaking with a professional.',
    'severe': 'Your sleep difficulties appear significant. Professional support is recommended.'
  },
  'GHQ-12': {
    'good': 'Your general mental health appears good.',
    'fair': 'Your mental health is within a fair range. Continue self-care.',
    'poor': 'You may be experiencing some difficulties. Consider speaking with someone.',
    'concern': 'Your responses suggest some concerns. Professional support may help.',
    'critical': 'Your responses indicate significant difficulties. Please seek professional help.'
  }
};

router.get('/:userId', async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(20);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { userId, quizType, answers } = req.body;
    const score = answers.reduce((sum, val) => sum + val, 0);
    
    const severityMapQuiz = severityMap[quizType] || severityMap['PHQ-9'];
    let severity = 'minimal';
    
    if (quizType === 'PHQ-9') {
      if (score <= 4) severity = 'minimal';
      else if (score <= 9) severity = 'mild';
      else if (score <= 14) severity = 'moderate';
      else if (score <= 19) severity = 'severe';
      else severity = 'extremely_severe';
    } else if (quizType === 'GAD-7') {
      if (score <= 4) severity = 'minimal';
      else if (score <= 9) severity = 'mild';
      else if (score <= 14) severity = 'moderate';
      else severity = 'severe';
    } else if (quizType === 'PSS-10') {
      if (score <= 13) severity = 'minimal';
      else if (score <= 20) severity = 'low';
      else if (score <= 26) severity = 'moderate';
      else if (score <= 30) severity = 'high';
      else severity = 'very_high';
    } else if (quizType === 'ISI') {
      if (score <= 7) severity = 'none';
      else if (score <= 14) severity = 'subthreshold';
      else if (score <= 21) severity = 'moderate';
      else severity = 'severe';
    } else if (quizType === 'GHQ-12') {
      if (score <= 12) severity = 'good';
      else if (score <= 24) severity = 'fair';
      else severity = 'poor';
    }
    
    const result = new QuizResult({
      userId, quizType, score, severity, answers
    });
    
    await result.save();
    
    res.json({
      ...result.toObject(),
      recommendation: recommendations[quizType]?.[severity] || 'Please consult a professional for advice.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;