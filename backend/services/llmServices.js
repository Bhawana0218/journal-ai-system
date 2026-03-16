const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function analyzeEmotion(text) {
    try{

        const prompt = `
        You are an AI mental health journal analyzer.

Analyze the journal entry and return ONLY valid JSON.

Rules:
- Emotion must be one word.
- sentimentScore must be between -1 and 1.
- keywords should contain 3-5 important words.
- Do NOT include explanations.
- Return ONLY JSON.

Format:
{
  "emotion": "",
  "sentimentScore": 0,
  "keywords": [],
  "summary": "",
  "insight": ""
}

Journal Entry:
"${text}"
 `;

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3
        });

        const output = response.choices[0].message.content;

        // return JSON.parse(output);

        // safer JSON extraction
        const jsonMatch = output.match(/\{[\s\S]*\}/);

         if (!jsonMatch) {
            throw new Error("Invalid JSON from AI");
          }

          const parsed = JSON.parse(jsonMatch[0]);

    return {
      emotion: parsed.emotion || "neutral",
      sentimentScore: parsed.sentimentScore || 0,
      keywords: parsed.keywords || [],
      summary: parsed.summary || "",
      insight: parsed.insight || ""
    };
    }
    catch(error){
         console.error("AI Analysis Error:", error.message);

        // fallback result (important for production)
    return {
      emotion: "neutral",
      sentimentScore: 0,
      keywords: [],
      summary: "Analysis unavailable",
      insight: ""
    };
    }
}

module.exports = analyzeEmotion;