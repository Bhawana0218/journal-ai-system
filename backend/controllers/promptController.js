const Journal = require("../models/Journel");
const generateDailyPrompt = require("../services/promptGenerator");
const { getCache, setCache } = require("../utils/cache");

exports.getDailyPrompt = async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = `prompt:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ prompt: cached });

    const recentEntries = await Journal.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const prompt = await generateDailyPrompt(recentEntries);

    await setCache(cacheKey, prompt, 3600);

    res.json({ prompt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
