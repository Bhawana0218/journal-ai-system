const axios = require("axios");

const analyzeEmotion = require('../services/llmServices');
const { getCache, setCache } = require("../utils/cache");

exports.analyzeJournal = async(req, res) =>{
    try{

        const { text } = req.body;

        const prompt = `
Analyze the following journal entry.

Return JSON with:
emotion
keywords
reflection

Journal:
${text}
`;

        // checl cache first
        const cached = await getCache(text);
        if (cached) return res.json(cached);

        const result = await analyzeEmotion(text);

        res.json(result);

    }
    catch (error){
        res.status(500).json({ error: error.message });
    }
};