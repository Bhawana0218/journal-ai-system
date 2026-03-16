const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function detectPatterns(entries) {

  const data = entries.map(e => ({
    emotion: e.emotion,
    sentiment: e.sentimentScore,
    ambience: e.ambience,
    keywords: e.keywords,
    date: e.createdAt
  }));

  const prompt = `
You are an AI mental health pattern detector.

Analyze the emotional patterns in the following journal data.

Return insights about:
1. recurring emotions
2. possible emotional triggers
3. positive habits
4. suggestions for improvement

Return in this JSON format:

{
 "patterns": [],
 "triggers": [],
 "positiveHabits": [],
 "recommendation": ""
}

Journal Data:
${JSON.stringify(data)}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  const output = response.choices[0].message.content;

  const jsonMatch = output.match(/\{[\s\S]*\}/);

  if (!jsonMatch) throw new Error("Invalid pattern JSON");

  return JSON.parse(jsonMatch[0]);
}

module.exports = detectPatterns;