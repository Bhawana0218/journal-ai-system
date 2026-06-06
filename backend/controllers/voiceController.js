const fs = require("fs");
const { transcribeAudio, analyzeVoice } = require("../services/voiceService");

exports.transcribeVoice = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file received." });
    }

    const recordingSeconds = parseFloat(req.body?.duration) || 0;

    // Step 1 — Transcribe with Groq Whisper
    const whisperResult = await transcribeAudio(filePath, req.file.mimetype);
    const transcript    = (whisperResult.text || "").trim();

    if (!transcript) {
      return res.status(422).json({
        message: "Could not transcribe audio. Please speak clearly and try again."
      });
    }

    // Step 2 — Analyze voice characteristics with Llama
    const voiceAnalysis = await analyzeVoice(whisperResult, recordingSeconds);

    res.json({ transcript, voiceAnalysis });

  } catch (error) {
    console.error("Voice transcription error:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    // Always clean up the temp file
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch { /* ignore cleanup errors */ }
    }
  }
};
