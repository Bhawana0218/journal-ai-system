const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * answers
 * @param {string} question 
 * @param {Array} entries 
 * @returns {string} 
 */
async function chatWithJournal(question, entries) {
  try {
    const journalContext = entries
      .slice(-20)
      .map(
        (e, i) =>
          `Entry ${i + 1} [${new Date(e.createdAt).toLocaleDateString()}]: emotion=${e.emotion}, sentiment=${e.sentimentScore}, keywords=${(e.keywords || []).join(", ")}, summary="${e.summary || e.text.slice(0, 100)}"`
      )
      .join("\n");

    const prompt = `
You are a concise AI journal coach. Answer based ONLY on the journal data below.

Rules:
- Maximum 2 sentences. No exceptions.
- Be direct and specific.
- No greetings, no filler words.

Journal Data:
${journalContext}

Question: "${question}"
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Journal chat error:", error.message);
    return "I'm having trouble reflecting on your journal right now. Please try again in a moment.";
  }
}

module.exports = chatWithJournal;
