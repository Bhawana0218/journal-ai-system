const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * @param {Array} recentEntries 
 * @returns {string} 
 */
async function generateDailyPrompt(recentEntries) {
  try {
    const moodContext =
      recentEntries.length > 0
        ? recentEntries
            .slice(-5)
            .map(e => `emotion: ${e.emotion}, keywords: ${(e.keywords || []).join(", ")}`)
            .join("\n")
        : "No previous entries.";

    const prompt = `
You are a compassionate AI journaling coach.

Based on the user's recent emotional history below, generate ONE thoughtful, open-ended journaling prompt that:
- Encourages self-reflection
- Is warm and non-judgmental
- Is specific to their recent mood patterns
- Is 1-2 sentences max

Recent mood history:
${moodContext}

Return ONLY the prompt text, no quotes, no explanation.
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Prompt generation error:", error.message);
    return "What is one thing that brought you peace today, and how can you invite more of it into your life?";
  }
}

module.exports = generateDailyPrompt;
