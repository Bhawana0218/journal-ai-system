const Journal = require('../models/Journel');

exports.createJournal = async (req, res) => {
  try {
    const { userId, ambience, text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    // Random emotion (temporary until AI model)
    const emotions = ["happy", "calm", "sad", "excited", "neutral"];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];

    // Better keyword extraction
   const stopWords = ["this","that","with","have","from","were","been","today","very"];

const keywords = text
  .toLowerCase()
  .replace(/[^\w\s]/g, "")
  .split(/\s+/)
  .filter(word => word.length > 3 && !stopWords.includes(word))
  .slice(0,5);

    const entry = await Journal.create({
      userId,
      ambience,
      text,
      emotion: randomEmotion,
      keywords
    });

    res.status(201).json(entry);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserEntries = async (req, res) => {
  try {
    const { userId } = req.params;

    const entries = await Journal.find({ userId }).sort({ createdAt: -1 });

    res.json(entries);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};