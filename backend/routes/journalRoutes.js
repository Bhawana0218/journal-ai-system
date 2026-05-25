const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const os       = require('os');
const router   = express.Router();

const { analyzeJournal }   = require('../controllers/analysisController');
const { createJournal, getUserEntries } = require('../controllers/journalController');
const { getInsights }      = require('../controllers/insightsController');
const { getDailyPrompt }   = require('../controllers/promptController');
const { chatWithJournal }  = require('../controllers/chatController');
const { therapistChat }    = require('../controllers/therapistController');
const { transcribeVoice }  = require('../controllers/voiceController');

// ── Multer: store audio in OS temp dir, accept up to 25 MB ──────────────────
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["audio/webm", "audio/ogg", "audio/wav", "audio/mpeg",
                     "audio/mp4", "audio/x-m4a", "audio/flac", "video/webm"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio type: ${file.mimetype}`));
    }
  }
});

// ── Static / specific routes first ──────────────────────────────────────────
router.post('/journal/analyze',                    analyzeJournal);
router.get ('/journal/prompt/:userId',             getDailyPrompt);
router.post('/journal/chat/:userId',               chatWithJournal);
router.post('/journal/therapist/:userId',          therapistChat);
router.post('/journal/voice/transcribe',           upload.single('audio'), transcribeVoice);

// ── Parameterised routes ─────────────────────────────────────────────────────
router.post('/journal',                            createJournal);
router.get ('/journal/:userId',                    getUserEntries);
router.get ('/journal/insights/:userId',           getInsights);

module.exports = router;
