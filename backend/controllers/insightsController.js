const Journal = require('../models/Journel');
const detectPatterns = require("../services/patternDetector");
const { getCache, setCache } = require("../utils/cache");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Safe date formatter — never throws on missing/invalid dates
function safeDate(val) {
  if (!val) return null;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

function safeDateStr(val) {
  const d = safeDate(val);
  return d ? d.toISOString().split("T")[0] : null;
}

async function generateMoodSummary(topEmotion, mostUsedAmbience, totalEntries, avgSentiment, moodTimeline) {
  const recentEmotions = moodTimeline.slice(-7).map(e => e.emotion).join(", ") || "unknown";
  const prompt = `You are a compassionate AI wellness coach. Write a single warm, personalized sentence (max 25 words) summarizing this user's emotional state.
Data: ${totalEntries} entries, top emotion: ${topEmotion}, ambience: ${mostUsedAmbience}, avg sentiment: ${avgSentiment}, recent emotions: ${recentEmotions}.
Return ONLY the sentence. No quotes.`;
  const r = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4, max_tokens: 60,
  });
  return r.choices[0].message.content.trim();
}

async function generateSuggestion(topEmotion, avgSentiment, patterns) {
  const prompt = `You are a compassionate AI wellness coach. Write ONE practical suggestion (max 20 words) for this user.
Top emotion: ${topEmotion}, avg sentiment: ${avgSentiment}, patterns: ${JSON.stringify(patterns?.patterns?.slice(0, 2) || [])}.
Return ONLY the suggestion. No quotes.`;
  const r = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5, max_tokens: 50,
  });
  return r.choices[0].message.content.trim();
}

exports.getInsights = async (req, res) => {
  try {
    const { userId } = req.params;
    const bustCache = req.query.bust === "1";
    const cacheKey  = `insights:${userId}`;

    if (!bustCache) {
      const cached = await getCache(cacheKey);
      if (cached) return res.json(cached);
    }

    const entries = await Journal.find({ userId }).lean();

    if (!entries.length) {
      return res.json({
        totalEntries: 0, topEmotion: "neutral", mostUsedAmbience: "none",
        recentKeywords: [], moodTimeline: [], moodSummary: "No journal entries yet.",
        suggestion: "Write your first entry to unlock personalized insights.",
        moodStreak: 0, avgSentiment: 0, emotionDistribution: [],
        patterns: { patterns: [], triggers: [], positiveHabits: [], recommendation: "" }
      });
    }

    const totalEntries = entries.length;

    // Emotion counts
    const emotionCount = {};
    entries.forEach(e => {
      const em = (e.emotion || "neutral").toLowerCase();
      emotionCount[em] = (emotionCount[em] || 0) + 1;
    });
    const topEmotion = Object.keys(emotionCount).reduce((a, b) =>
      emotionCount[a] > emotionCount[b] ? a : b, "neutral");

    // Ambience counts
    const ambienceCount = {};
    entries.forEach(e => {
      const am = e.ambience || "none";
      ambienceCount[am] = (ambienceCount[am] || 0) + 1;
    });
    const mostUsedAmbience = Object.keys(ambienceCount).reduce((a, b) =>
      ambienceCount[a] > ambienceCount[b] ? a : b, "none");

    // Keywords
    const recentKeywords = entries
      .slice(-5).flatMap(e => e.keywords || []).filter(Boolean).slice(0, 5);

    // Mood timeline — skip entries with no valid date
    const moodTimeline = entries
      .map(e => {
        const dateStr = safeDateStr(e.createdAt);
        if (!dateStr) return null;
        return { date: dateStr, emotion: e.emotion || "neutral", sentimentScore: e.sentimentScore || 0 };
      })
      .filter(Boolean);

    // Avg sentiment
    const avgSentiment = parseFloat(
      (entries.reduce((s, e) => s + (e.sentimentScore || 0), 0) / totalEntries).toFixed(2)
    );

    // Mood streak
    const positiveSet = new Set(["happy","excited","calm","grateful","content","joyful","hopeful"]);
    const sorted = [...entries].sort((a, b) =>
      (safeDate(b.createdAt) || 0) - (safeDate(a.createdAt) || 0)
    );
    let moodStreak = 0;
    for (const e of sorted) {
      if (positiveSet.has((e.emotion || "").toLowerCase())) moodStreak++;
      else break;
    }

    // Emotion distribution
    const emotionDistribution = Object.entries(emotionCount).map(([emotion, count]) => ({
      emotion, count, percentage: Math.round((count / totalEntries) * 100)
    }));

    // AI calls — each individually fault-tolerant
    let patterns = { patterns: [], triggers: [], positiveHabits: [], recommendation: "" };
    try { const ai = await detectPatterns(entries); if (ai) patterns = ai; }
    catch (err) { console.error("Pattern detection failed:", err.message); }

    let moodSummary = `Your ${totalEntries} entries reflect a predominantly ${topEmotion} mood.`;
    try { moodSummary = await generateMoodSummary(topEmotion, mostUsedAmbience, totalEntries, avgSentiment, moodTimeline); }
    catch (err) { console.error("Mood summary failed:", err.message); }

    let suggestion = "Keep journaling daily to understand your emotional patterns better.";
    try { suggestion = await generateSuggestion(topEmotion, avgSentiment, patterns); }
    catch (err) { console.error("Suggestion failed:", err.message); }

    const result = {
      totalEntries, topEmotion, mostUsedAmbience, recentKeywords,
      moodTimeline, moodSummary, suggestion, moodStreak, avgSentiment,
      emotionDistribution, patterns
    };

    await setCache(cacheKey, result, 1800);
    res.json(result);

  } catch (error) {
    console.error("Insights error:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};
