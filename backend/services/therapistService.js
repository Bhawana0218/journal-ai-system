const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * AI Therapist — safe, reflective, grounded in the user's real journal data.
 *
 * @param {string}  userMessage   - what the user just said (empty string = session opener)
 * @param {Array}   history       - [{role:"user"|"assistant", content:string}] conversation so far
 * @param {Array}   entries       - user's journal entries from DB
 * @param {Object}  insightsSummary - { topEmotion, avgSentiment, patterns, recentKeywords, moodStreak }
 * @returns {{ reply: string, phase: string }}
 */
async function runTherapistSession(userMessage, history, entries, insightsSummary) {
  try {

    const recentEntries = entries.slice(-10).map(e => {
      const dateStr = e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "unknown date";
      return `[${dateStr}] emotion=${e.emotion || "unknown"}, sentiment=${(e.sentimentScore || 0).toFixed(2)}, keywords=${(e.keywords || []).join(", ")}, summary="${e.summary || (e.text || "").slice(0, 80)}"`;
    }).join("\n");

    const { topEmotion, avgSentiment, patterns, recentKeywords, moodStreak } = insightsSummary;

    const systemPrompt = `
You are a compassionate, professional AI wellness companion named "Sage".

⚠️ IMPORTANT DISCLAIMER: You are NOT a licensed therapist or medical professional. Always remind the user of this when relevant. Never diagnose, prescribe, or replace professional help.

Your role:
- Ask ONE thoughtful, open-ended reflective question at a time
- Guide breathing exercises when the user seems stressed or anxious
- Suggest mindfulness practices tailored to their current emotional state
- Encourage healthy habits based on their journal patterns
- Be warm, non-judgmental, and grounded in their actual data

The user's real journal data:
- Top emotion: ${topEmotion}
- Average sentiment score: ${avgSentiment} (range -1 to 1, higher = more positive)
- Positive mood streak: ${moodStreak} days
- Recent keywords from their journal: ${(recentKeywords || []).join(", ")}
- Detected patterns: ${JSON.stringify(patterns?.patterns?.slice(0, 3) || [])}
- Possible triggers: ${JSON.stringify(patterns?.triggers?.slice(0, 2) || [])}
- Positive habits detected: ${JSON.stringify(patterns?.positiveHabits?.slice(0, 2) || [])}

Recent journal entries:
${recentEntries || "No entries yet."}

Session rules:
- Keep each response to 3-5 sentences max
- Ask only ONE question per response
- If the user seems distressed, gently suggest professional help
- If asked for a breathing exercise, give a specific, step-by-step one (e.g. 4-7-8 technique)
- If asked for mindfulness, give a concrete 2-minute exercise
- Reference their actual journal data naturally (e.g. "I noticed you've been feeling ${topEmotion} lately...")
- Never use generic advice — always tie it to their real patterns
- End each response with either a question OR an exercise, never both
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
    ];

    if (userMessage && userMessage !== "__OPEN__") {
      messages.push({ role: "user", content: userMessage });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.6,
      max_tokens: 300,
    });

    const reply = response.choices[0].message.content.trim();

    const lower = reply.toLowerCase();
    let phase = "reflect";
    if (lower.includes("breath") || lower.includes("inhale") || lower.includes("exhale")) phase = "breathe";
    else if (lower.includes("mindful") || lower.includes("notice") || lower.includes("observe")) phase = "mindful";
    else if (lower.includes("habit") || lower.includes("routine") || lower.includes("practice")) phase = "habit";
    else if (lower.includes("professional") || lower.includes("therapist") || lower.includes("counselor")) phase = "refer";

    return { reply, phase };
  } catch (error) {
    console.error("Therapist service error:", error.message);
    return {
      reply: "I'm having a moment of difficulty connecting. Take a slow breath — I'll be right with you.",
      phase: "breathe"
    };
  }
}

module.exports = runTherapistSession;
