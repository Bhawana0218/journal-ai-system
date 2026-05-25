const Groq = require("groq-sdk");
const { toFile } = require("groq-sdk/uploads");
const fs = require("fs");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Transcribes an audio file using Groq Whisper (whisper-large-v3).
 * Uses toFile() so the SDK receives a proper named file object.
 *
 * @param {string} filePath  - absolute path to the uploaded temp file
 * @param {string} mimeType  - e.g. "audio/webm", "audio/ogg", "audio/wav"
 * @returns {{ text, duration, segments }} - Groq transcription result
 */
async function transcribeAudio(filePath, mimeType) {
  // Determine a sensible extension from the mime type
  const extMap = {
    "audio/webm":  "webm",
    "video/webm":  "webm",
    "audio/ogg":   "ogg",
    "audio/wav":   "wav",
    "audio/mpeg":  "mp3",
    "audio/mp4":   "mp4",
    "audio/x-m4a": "m4a",
    "audio/flac":  "flac",
  };
  const ext = extMap[mimeType] || "webm";
  const fileName = `recording.${ext}`;

  const fileStream = fs.createReadStream(filePath);

  // toFile() wraps the stream with a filename — required by Groq SDK 1.x
  const audioFile = await toFile(fileStream, fileName, { type: mimeType });

  // Groq Whisper supports: json | text  (NOT verbose_json)
  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-large-v3",
    response_format: "json",
    language: "en",
  });

  // transcription.text is the transcript string
  // duration and segments are not returned with response_format:"json"
  // so we derive what we can from the text itself
  return {
    text: transcription.text || "",
    duration: null,   // not available in json mode
    segments: [],     // not available in json mode
  };
}

/**
 * Analyzes the transcript for tone, emotion, stress, pace, and insight.
 * Since Groq Whisper json mode doesn't return timestamps, we derive
 * speaking pace from word count and let Llama handle the rest.
 *
 * @param {{ text, duration, segments }} whisperResult
 * @param {number} recordingSeconds - duration from the frontend timer
 * @returns {object} voiceAnalysis
 */
async function analyzeVoice(whisperResult, recordingSeconds = 0) {
  const transcript = whisperResult.text || "";
  const wordCount  = transcript.trim().split(/\s+/).filter(Boolean).length;

  // Speaking pace — use frontend-reported duration if available
  const duration   = recordingSeconds > 0 ? recordingSeconds : null;
  const wpm        = duration ? Math.round((wordCount / duration) * 60) : null;
  const paceLabel  = wpm === null ? "unknown"
    : wpm < 100 ? "slow" : wpm < 150 ? "moderate" : wpm < 180 ? "fast" : "very fast";

  // Filler word detection
  const fillerPattern = /\b(um|uh|like|you know|i mean|basically|literally|actually|so|well|right)\b/gi;
  const fillers       = (transcript.match(fillerPattern) || []).length;
  const fillerRate    = wordCount > 0 ? parseFloat((fillers / wordCount * 100).toFixed(1)) : 0;

  const statsText = [
    wordCount > 0 ? `Words spoken: ${wordCount}` : null,
    wpm          ? `Speaking pace: ${wpm} WPM (${paceLabel})` : null,
    `Filler words: ${fillers} (${fillerRate}% of words)`,
  ].filter(Boolean).join("\n");

  const prompt = `
You are an expert voice and speech analyst. Analyze the following spoken journal transcript.

Transcript: "${transcript}"

Computed speech stats:
${statsText}

Return ONLY valid JSON with this exact format:
{
  "emotion": "",
  "tone": "",
  "stressLevel": "",
  "stressScore": 0,
  "energyLevel": "",
  "confidence": "",
  "insight": "",
  "recommendation": ""
}

Rules:
- emotion: one word (e.g. anxious, calm, excited, sad, hopeful)
- tone: 2-3 words (e.g. "reflective and calm", "tense and rushed")
- stressLevel: one of: low / moderate / high / very high
- stressScore: integer 0-10 (0=no stress, 10=extreme stress)
- energyLevel: one of: low / moderate / high
- confidence: one of: low / moderate / high
- insight: one sentence about what the voice reveals emotionally
- recommendation: one actionable sentence based on the voice analysis
- Return ONLY the JSON object, no extra text
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const raw   = response.choices[0].message.content;
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid voice analysis JSON from AI");

  const analysis = JSON.parse(match[0]);

  return {
    ...analysis,
    wpm:          wpm ?? "—",
    paceLabel,
    wordCount,
    duration:     duration ?? "—",
    fillerCount:  fillers,
    fillerRate,
    pauseSummary: "N/A",   // not available without verbose_json
  };
}

module.exports = { transcribeAudio, analyzeVoice };
