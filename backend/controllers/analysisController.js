const analyzeEmotion = require('../services/llmServices');
const { getCache, setCache } = require("../utils/cache");

exports.analyzeJournal = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }
    const cached = await getCache(text);
    if (cached) return res.json(cached);

    const result = await analyzeEmotion(text);
    await setCache(text, result);
    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
