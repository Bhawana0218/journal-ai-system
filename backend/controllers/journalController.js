const Journal = require('../models/Journel');
const analyzeEmotion = require('../services/llmServices');

exports.createJournal = async (req, res) => {
  try {
    const { userId, ambience, text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }
    const analysis = await analyzeEmotion(text);

    const entry = await Journal.create({
      userId,
      ambience,
      text,
      emotion: analysis.emotion,
      sentimentScore: analysis.sentimentScore,
      keywords: analysis.keywords.length > 0 ? analysis.keywords : extractKeywords(text),
      summary: analysis.summary,
      insight: analysis.insight
    });

    res.status(201).json(entry);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function extractKeywords(text) {
  const stopWords = ["this","that","with","have","from","were","been","today","very","just","about","would","could","should"];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 5);
}

exports.getUserEntries = async (req, res) => {
  try {
    const { userId } = req.params;

    const entries = await Journal.find({ userId }).sort({ createdAt: -1 });

    res.json(entries);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};