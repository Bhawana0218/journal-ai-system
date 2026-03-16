const Journal = require('../models/Journel');
const detectPatterns = require("../services/patternDetector");

exports.getInsights = async (req, res) => {
  try {
    const { userId } = req.params;

    const entries = await Journal.find({ userId });

    if (!entries.length) {
  return res.json({
    totalEntries: 0,
    topEmotion: "neutral",
    mostUsedAmbience: "none",
    recentKeywords: [],
    moodTimeline: [],
    moodSummary: "No journal entries yet.",
    patterns: {
      patterns: [],
      triggers: [],
      positiveHabits: [],
      recommendation: ""
    }
  });
}

    const totalEntries = entries.length;

    let patterns = {
  patterns: [],
  triggers: [],
  positiveHabits: [],
  recommendation: ""
};

try {
  const aiPatterns = await detectPatterns(entries);
  if (aiPatterns) patterns = aiPatterns;
} catch (error) {
  console.error("Pattern detection failed:", error.message);
}

    // Top Emotion
    const emotionCount = {};
    entries.forEach(e => {
      const emotion = e.emotion || "neutral";
      emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
    });

    const topEmotion =
      Object.keys(emotionCount).length > 0
        ? Object.keys(emotionCount).reduce((a, b) =>
            emotionCount[a] > emotionCount[b] ? a : b
          )
        : "neutral";

    // Most used ambience
    const ambienceCount = {};
    entries.forEach(e => {
      const ambience = e.ambience || "none";
      ambienceCount[ambience] = (ambienceCount[ambience] || 0) + 1;
    });

   const mostUsedAmbience =
  Object.keys(ambienceCount).length > 0
    ? Object.keys(ambienceCount).reduce((a, b) =>
        ambienceCount[a] > ambienceCount[b] ? a : b
      )
    : "none";

    // Recent keywords
   const recentKeywords = entries
  .slice(-5)
  .flatMap(e => e.keywords || [])
  .filter(Boolean)
  .slice(0,5);

    // Mood timeline
    const moodTimeline = entries.map(e => ({
      date: e.createdAt.toISOString().split("T")[0],
      emotion: e.emotion || "neutral"
    }));

// AI Mood Summary
const emotions = entries.map(e => e.emotion || "neutral");

const moodSummary = `Your recent journal entries mostly reflect a ${topEmotion} mood. 
You tend to prefer ${mostUsedAmbience} ambience while writing. 
Across ${totalEntries} reflections, your emotional trend suggests ${topEmotion} patterns.`;

    res.json({
      totalEntries,
      topEmotion,
      mostUsedAmbience,
      recentKeywords,
      moodTimeline,
      moodSummary,
      patterns
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};