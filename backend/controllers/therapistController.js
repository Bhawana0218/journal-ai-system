const Journal = require("../models/Journel");
const detectPatterns = require("../services/patternDetector");
const runTherapistSession = require("../services/therapistService");

exports.therapistChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message, history = [] } = req.body;

    // Fetch user's real journal data
    const entries = await Journal.find({ userId }).sort({ createdAt: -1 });

    // Build insights summary from real data (no hardcoding)
    const emotionCount = {};
    entries.forEach(e => {
      const em = (e.emotion || "neutral").toLowerCase();
      emotionCount[em] = (emotionCount[em] || 0) + 1;
    });

    const topEmotion = Object.keys(emotionCount).length
      ? Object.keys(emotionCount).reduce((a, b) => emotionCount[a] > emotionCount[b] ? a : b)
      : "neutral";

    const avgSentiment = entries.length
      ? parseFloat((entries.reduce((s, e) => s + (e.sentimentScore || 0), 0) / entries.length).toFixed(2))
      : 0;

    const positiveSet = new Set(["happy", "excited", "calm", "grateful", "content", "joyful", "hopeful"]);
    let moodStreak = 0;
    for (const e of entries) {
      if (positiveSet.has((e.emotion || "").toLowerCase())) moodStreak++;
      else break;
    }

    const recentKeywords = entries
      .slice(0, 5)
      .flatMap(e => e.keywords || [])
      .filter(Boolean)
      .slice(0, 8);

    let patterns = { patterns: [], triggers: [], positiveHabits: [], recommendation: "" };
    if (entries.length >= 2) {
      try {
        const ai = await detectPatterns(entries);
        if (ai) patterns = ai;
      } catch { /* use empty fallback */ }
    }

    const insightsSummary = { topEmotion, avgSentiment, patterns, recentKeywords, moodStreak };

    const { reply, phase } = await runTherapistSession(
      message || "",
      history,
      entries,
      insightsSummary
    );

    res.json({ reply, phase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
