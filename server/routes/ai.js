const express = require('express');
const router = express.Router();

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'self harm', 'want to die', 
  'no reason to live', 'better off dead', 'hurt myself', 'suicidal',
  'hanging', 'overdose', 'poison', 'jump', 'cutting', 'slitting'
];

const HELPLINE_INFO = `\n\n### 🆘 Urgent Support Needed?\nIf you're feeling overwhelmed, please reach out to these professional helplines immediately:\n\n*   **iCall:** 9152987821 (Mon-Sat, 8am-10pm)\n*   **Vandrevala Foundation:** 1860-2662-345 (24/7)\n*   **NIMHANS:** 1800-599-0019 (24/7)\n\n*You are not alone. Please talk to someone.*`;

router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory, userContext } = req.body;
    
    const isCrisis = CRISIS_KEYWORDS.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    const systemPrompt = `You are MindBot, a compassionate, empathetic, and culturally-aware mental health support assistant specifically designed for Indian college students.

## Your Mission:
To provide a safe, non-judgmental space for students to express their feelings, offer emotional validation, and suggest healthy coping mechanisms.

## Psychological Framework:
1. **Active Listening**: Start by reflecting back what you heard. (e.g., "It sounds like you're feeling really pressured about your upcoming placements...")
2. **Validation**: Acknowledge that their feelings are valid. (e.g., "It's completely understandable to feel overwhelmed by family expectations.")
3. **Socratic Questioning**: Instead of just giving advice, ask gentle questions to help them explore their feelings. (e.g., "What usually helps you feel a bit more grounded when things get this loud?")
4. **Cultural Nuance**: Understand Indian contexts like academic pressure (JEE/GATE/CAT/Placements), family expectations, relationship taboos, and hostel life.

## Platform Integration (Suggest these when relevant):
- **Mood Tracker**: "Would you like to log this feeling in your Mood Tracker to see if there's a pattern?"
- **Quizzes**: "If you've been feeling this way for a while, you might find our Anxiety (GAD-7) or Sleep (ISI) quizzes helpful to understand your symptoms better."
- **Journal**: "Writing this down in your private Journal might help clear your head. Would you like to try that?"
- **Appointments**: "If things feel too heavy, remember you can book a confidential session with our campus counsellors."

## Constraints:
- **NEVER** diagnose.
- **NEVER** prescribe medication.
- **NEVER** claim to be a replacement for a human doctor/counsellor.
- If a user mentions self-harm or suicide, prioritize the Crisis Helplines immediately.
- Support English, Hindi, and Hinglish (code-switching).

## Formatting:
- Use Markdown for readability (bullet points, bold text).
- Keep responses concise but warm (2-4 paragraphs max).
- End with a supportive, open-ended question.`;

    let academicContext = '';
    if (userContext && userContext.role === 'student') {
      academicContext = `\n\n## User Academic Context:\n- Program: ${userContext.program || 'Not specified'}\n- Department: ${userContext.department || 'Not specified'}\n- Year of Study: ${userContext.yearOfStudy || 'Not specified'}\nTailor your advice to their specific academic pressures (e.g., final year projects, placement stress, departmental workload) when relevant.`;
    }

    const fullSystemPrompt = systemPrompt + academicContext;

    // Construct Gemini prompt
    let chatHistoryPrompt = '';
    if (conversationHistory && conversationHistory.length > 0) {
      chatHistoryPrompt = "\n\nConversation History:\n" + conversationHistory.slice(-10).map(h => 
        `${h.role === 'user' ? 'User' : 'MindBot'}: ${h.content}`
      ).join('\n');
    }

    let userMessageText = message;
    if (isCrisis) {
      userMessageText = `[CRISIS ALERT DETECTED] The user has mentioned: "${message}". Please respond with extreme care, immediate empathy, and strongly emphasize the helpline numbers. Do not ignore this alert.`;
    }

    const finalPrompt = `${fullSystemPrompt}${chatHistoryPrompt}\n\nUser: ${userMessageText}\nMindBot:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json({ 
        error: 'AI service unavailable',
        message: 'AI Error. Please check backend configuration.'
      });
    }

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
    }
    
    let botMessage = data.candidates[0].content.parts[0].text;
    
    if (isCrisis && !botMessage.includes('📞') && !botMessage.includes('Helpline')) {
      botMessage += HELPLINE_INFO;
    }
    
    res.json({
      message: botMessage,
      isCrisis,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('AI Chat Exception:', err);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: "Server error connecting to AI." 
    });
  }
});

module.exports = router;