const express = require('express');
const router = express.Router();
const { analyzeJournal } = require('../controllers/analysisController');

const {
    createJournal,
    getUserEntries
} = require('../controllers/journalController');
const { getInsights } = require("../controllers/insightsController");

router.post('/journal', createJournal );

router.get('/journal/:userId', getUserEntries);

router.post('/journal/analyze', analyzeJournal);

router.get('/journal/insights/:userId', getInsights );

module.exports = router;