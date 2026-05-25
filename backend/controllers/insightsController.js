const Journal = require('../models/Journel');
const detectPatterns = require("../services/patternDetector");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateMoodSummary(topEmotion, mostUsedAmbience, totalEntries, avgSentiment, moodTimeline) {
  try {
    const recentEmotions = moodTimeline.slice(-7).map(e => e.emotion).join(", ");
    const prompt = `
You are a compassionate AI wellness coach. Write a single warm, personalized sentence (max 25 words) summarizing this user's emotional state based on their journal data.

Data:
- Total entries: ${totalEntries}
- Top emotion: ${topEmotion}
- Preferred ambience: ${mostUsedAmbience}
- Average sentiment score: ${avgSentiment} (range -1 to 1)
- Recent emotions (newest first): ${recentEmotions}

Return ONLY the summary sentence. No quotes, no explanation.
`;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });
    return response.choices[0].message.content.trim();
  } catch {
    return `Your ${totalEntries} entries reflect a predominantly ${topEmotion} mood with ${mostUsedAmbience} as your favourite writing space.`;
  }
}

async function generateSuggestion(topEmotion, avgSentiment, patterns) {
  try {
    const prompt = `
You are a compassionate AI wellness coach. Write ONE practical, specific suggestion (max 20 words) for this user based on their journal patterns.

Data:
- Top emotion: ${topEmotion}
- Average sentiment: ${avgSentiment}
- Detected patterns: ${JSON.stringify(patterns?.patterns?.slice(0, 3) || [])}

Return ONLY the suggestion. No quotes, no explanation.
`;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    });
    return response.choices[0].message.content.trim();
  } catch {
    return "Keep journaling daily to build a clearer picture of your emotional patterns.";
  }
}

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

   const recentKeywords = entries
  .slice(-5)
  .flatMap(e => e.keywords || [])
  .filter(Boolean)
  .slice(0,5);

    const moodTimeline = entries.map(e => ({
      date: e.createdAt.toISOString().split("T")[0],
      emotion: e.emotion || "neutral",
      sentimentScore: e.sentimentScore || 0
    }));

    const avgSentiment = entries.length
      ? parseFloat((entries.reduce((sum, e) => sum + (e.sentimentScore || 0), 0) / entries.length).toFixed(2))
      : 0;

    // Mood streak
    const positiveEmotions = new Set(["happy", "excited", "calm", "grateful", "content", "joyful", "hopeful"]);
    const sortedEntries = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let moodStreak = 0;
    for (const e of sortedEntries) {
      if (positiveEmotions.has((e.emotion || "").toLowerCase())) {
        moodStreak++;
      } else {
        break;
      }
    }

    // Emotion distribution for charts
    const emotionDistribution = Object.entries(emotionCount).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / totalEntries) * 100)
    }));

    // AI-generated summary and suggestion (run in parallel)
    const [moodSummary, suggestion] = await Promise.all([
      generateMoodSummary(topEmotion, mostUsedAmbience, totalEntries, avgSentiment, moodTimeline),
      generateSuggestion(topEmotion, avgSentiment, patterns)
    ]);

    res.json({
      totalEntries,
      topEmotion,
      mostUsedAmbience,
      recentKeywords,
      moodTimeline,
      moodSummary,
      suggestion,
      moodStreak,
      avgSentiment,
      emotionDistribution,
      patterns
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};