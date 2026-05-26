# 🌿 NatureMind AI Journal — Project Explanation

---

## 1. PROJECT OVERVIEW

**NatureMind AI Journal** is a full-stack AI-powered mental wellness journaling application. Users write or speak their journal entries, and the AI automatically analyzes their emotion, sentiment, keywords, and provides personalized insights, breathing exercises, and wellness recommendations.

### Problem It Solves
Most people don't track their mental health. This app makes it effortless — just write or speak, and AI does the rest: detecting emotions, spotting patterns, and suggesting improvements.

### Target Users
Students, professionals, and anyone who wants to understand their emotional patterns and improve mental wellness.

### Core Features
- **Write or Speak** journal entries (text + voice)
- **AI Emotion Analysis** — detects emotion, sentiment score, keywords, summary, insight per entry
- **Voice Journaling** — speak your entry, Whisper transcribes it, Llama analyzes tone/stress
- **AI Insights Dashboard** — mood timeline, emotion breakdown chart, keyword cloud, pattern detection
- **AI Wellness Companion (Chat)** — conversational AI grounded in your real journal data; guides breathing, mindfulness, habits
- **Mood Streak Tracking** — consecutive positive days
- **Ambience Mode** — forest, ocean, mountain backgrounds with ambient audio
- **4-Tab UI** — Overview, Write, Analytics, AI Chat

---

## 2. TECH STACK

### Frontend
| Technology | Why Used |
|---|---|
| **Next.js 16** | React framework with SSR, file-based routing, optimized builds |
| **React 19** | Component-based UI, hooks for state management |
| **Tailwind CSS v4** | Utility-first styling, rapid responsive design without writing CSS files |
| **Axios** | HTTP client for API calls — cleaner than fetch, supports interceptors |
| **Chart.js + react-chartjs-2** | Mood timeline (Line chart) and emotion breakdown (Doughnut chart) |
| **react-tagcloud** | Keyword cloud visualization |
| **Roboto (Google Fonts)** | Professional, readable typography |

### Backend
| Technology | Why Used |
|---|---|
| **Node.js + Express 5** | Fast, non-blocking server; Express handles routing and middleware |
| **Mongoose** | ODM for MongoDB — schema validation, easy CRUD operations |
| **MongoDB Atlas** | Cloud NoSQL database — flexible schema suits journal entries |
| **Groq SDK** | Access to Llama 3.3 70B and Whisper models via fast inference API |
| **Redis** | Caching AI responses — avoids repeated expensive Groq API calls |
| **Multer** | Handles multipart/form-data for audio file uploads |
| **dotenv** | Loads environment variables from `.env` file |
| **CORS** | Allows frontend (port 3000) to call backend (port 5000) |

### AI Models Used
| Model | Purpose |
|---|---|
| **Llama 3.3 70B Versatile** | Emotion analysis, pattern detection, mood summary, suggestion, therapist chat, voice analysis |
| **Whisper Large V3** | Speech-to-text transcription for voice journaling |

---

## 3. FOLDER STRUCTURE

```
arvayx-ai-journal/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── journalController.js    # Create entry, get entries
│   │   ├── analysisController.js   # Standalone text analysis
│   │   ├── insightsController.js   # Aggregated AI insights
│   │   ├── chatController.js       # AI wellness chat
│   │   ├── therapistController.js  # Therapist session (legacy)
│   │   ├── promptController.js     # Daily AI writing prompt
│   │   └── voiceController.js      # Voice transcription
│   ├── models/
│   │   └── Journel.js         # MongoDB schema
│   ├── routes/
│   │   └── journalRoutes.js   # All API routes
│   ├── services/
│   │   ├── llmServices.js         # Emotion analysis via Groq
│   │   ├── patternDetector.js     # Pattern detection via Groq
│   │   ├── therapistService.js    # AI therapist/chat logic
│   │   ├── journalChat.js         # Simple journal Q&A
│   │   ├── promptGenerator.js     # Daily prompt generation
│   │   └── voiceService.js        # Whisper + voice analysis
│   ├── utils/
│   │   └── cache.js           # Redis get/set helpers
│   ├── server.js              # Express app entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── page.js            # Main page — 4-tab layout
│   │   ├── layout.js          # Root layout, font, metadata
│   │   └── globals.css        # Global styles + animations
│   ├── components/
│   │   ├── JournalForm.jsx        # Write/Speak toggle form
│   │   ├── VoiceRecorder.jsx      # Mic recording + voice analysis
│   │   ├── EntryList.jsx          # List of past entries
│   │   ├── Insights.jsx           # AI stats cards
│   │   ├── EmotionChart.jsx       # Line chart (mood timeline)
│   │   ├── EmotionPieChart.jsx    # Doughnut chart (emotion breakdown)
│   │   ├── KeywordCloud.jsx       # Tag cloud
│   │   ├── MentalHealthPatterns.jsx # Patterns/triggers/habits
│   │   └── JournalChat.jsx        # AI wellness companion chat
│   ├── public/ambience/       # Background images + audio files
│   ├── .env                   # NEXT_PUBLIC_API_URL
│   └── package.json
├── docker-compose.yml         # Docker setup for all services
└── ARCHITECTURE.md
```

---

## 4. DATABASE — MongoDB Schema

**File:** `backend/models/Journel.js`

```js
{
  userId: String,          // identifies the user (currently hardcoded "123")
  ambience: String,        // enum: forest | ocean | mountain
  text: String,            // the journal entry text
  emotion: String,         // AI-detected: happy, sad, calm, anxious, etc.
  sentimentScore: Number,  // AI score: -1 (very negative) to +1 (very positive)
  keywords: [String],      // 3-5 key words extracted by AI
  summary: String,         // AI-generated summary of the entry
  insight: String,         // AI-generated personal insight
  createdAt: Date,         // auto-added by timestamps: true
  updatedAt: Date          // auto-added by timestamps: true
}
```

**Why MongoDB?** Journal entries are unstructured and variable. NoSQL fits better than SQL here — no rigid table schema needed.

**Why `timestamps: true`?** Automatically adds `createdAt` and `updatedAt` to every document without writing extra code.

---

## 5. API ROUTES

**File:** `backend/routes/journalRoutes.js`

| Method | Route | Controller | Purpose |
|---|---|---|---|
| POST | `/api/journal` | journalController | Create new entry + AI analysis |
| GET | `/api/journal/:userId` | journalController | Get all entries for user |
| GET | `/api/journal/insights/:userId` | insightsController | Get aggregated AI insights |
| POST | `/api/journal/chat/:userId` | chatController | AI wellness companion chat |
| POST | `/api/journal/therapist/:userId` | therapistController | Therapist session |
| GET | `/api/journal/prompt/:userId` | promptController | Get daily AI writing prompt |
| POST | `/api/journal/analyze` | analysisController | Standalone text analysis |
| POST | `/api/journal/voice/transcribe` | voiceController | Voice → text + analysis |

**Important:** Static routes (`/journal/analyze`, `/journal/prompt/:userId`) are defined **before** parameterized routes (`/journal/:userId`) to prevent Express from matching "analyze" as a userId.

---

## 6. COMPLETE APPLICATION FLOW

```
User opens app
      ↓
Next.js page.js loads → fetchAll() called
      ↓
Two parallel API calls:
  GET /api/journal/123        → MongoDB → returns entries array
  GET /api/journal/insights/123 → Redis cache check
      ↓ (cache miss)
  MongoDB → fetch all entries
  Groq Llama → generateMoodSummary() + generateSuggestion()
  Groq Llama → detectPatterns()
  → returns insights object
      ↓
Frontend renders 4-tab UI with real data

User writes entry → POST /api/journal
      ↓
journalController → analyzeEmotion(text) via Groq Llama
      ↓
Returns: { emotion, sentimentScore, keywords, summary, insight }
      ↓
Saved to MongoDB → response sent to frontend
      ↓
handleNewEntry() → bust insights cache → re-fetch insights
```

---

## 7. KEY CODE EXPLANATIONS

### `server.js` — Express Setup
```js
require('events').EventEmitter.defaultMaxListeners = 20;
```
Prevents Node.js warning when many event listeners are attached (Redis + Mongoose both attach listeners).

```js
app.use(cors());
app.use(express.json());
```
`cors()` allows cross-origin requests from the frontend. `express.json()` parses incoming JSON request bodies.

```js
app.use('/api', (req,res,next) => {
  console.log("API hit:", req.method, req.url);
  next();
});
```
Custom logging middleware — logs every API call. `next()` passes control to the actual route handler.

---

### `llmServices.js` — AI Emotion Analysis
```js
const jsonMatch = output.match(/\{[\s\S]*\}/);
```
Groq sometimes returns text before/after the JSON. This regex extracts only the JSON object using `[\s\S]*` which matches any character including newlines.

```js
return {
  emotion: parsed.emotion || "neutral",
  sentimentScore: parsed.sentimentScore || 0,
  ...
};
```
Fallback values ensure the app never crashes if AI returns incomplete data.

---

### `insightsController.js` — Safe Date Handling
```js
function safeDate(val) {
  if (!val) return null;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}
```
Some old MongoDB entries have no `createdAt`. Calling `.toISOString()` on `undefined` throws an error. This helper returns `null` safely instead of crashing.

```js
const entries = await Journal.find({ userId }).lean();
```
`.lean()` returns plain JavaScript objects instead of Mongoose documents — faster and uses less memory since we don't need Mongoose methods here.

---

### `cache.js` — Redis Fault Tolerance
```js
client.on("error", (err) => {
  isConnected = false;
});
```
If Redis goes down, `isConnected` becomes false. All `getCache`/`setCache` calls check this flag first and silently skip caching — the app continues working without Redis.

---

### `voiceService.js` — Voice Pipeline
```js
const audioFile = await toFile(fileStream, fileName, { type: mimeType });
```
Groq SDK 1.x requires `toFile()` wrapper — a raw stream without a filename is rejected by the API.

```js
response_format: "json"  // NOT "verbose_json" — Groq doesn't support it
```
Groq Whisper only supports `json` and `text` formats. `verbose_json` (which gives timestamps) is an OpenAI-only feature.

---

### `therapistService.js` — AI Therapist Logic
```js
if (userMessage && userMessage !== "__OPEN__") {
  messages.push({ role: "user", content: userMessage });
}
```
`__OPEN__` is a special token sent when the chat first loads. It tells the AI to generate an opening greeting based on journal data without any user message.

```js
let phase = "reflect";
if (lower.includes("breath") || lower.includes("inhale")) phase = "breathe";
```
The AI's response text is scanned for keywords to detect which "phase" it's in. This drives the UI — the breathing orb changes color and animation based on the phase.

---

### `page.js` — Hydration Fix
```js
const [greeting, setGreeting] = useState("");
useEffect(() => {
  const hour = new Date().getHours();
  setGreeting(hour < 12 ? "Good morning" : ...);
}, []);
```
`new Date().getHours()` in the render body causes a **hydration mismatch** — the server renders at one time, the client at another. Moving it to `useEffect` ensures it only runs on the client after hydration.

---

## 8. FRONTEND COMPONENTS

| Component | Purpose |
|---|---|
| `page.js` | Root page — manages all state, 4-tab navigation, data fetching |
| `JournalForm.jsx` | Write/Speak toggle; submits entry to backend |
| `VoiceRecorder.jsx` | MediaRecorder API → audio blob → backend → transcript + voice analysis |
| `JournalChat.jsx` | Full AI chat with breathing orb, phase detection, conversation history |
| `EntryList.jsx` | Renders past entries with emotion badge, keywords, date |
| `Insights.jsx` | 6 stat cards (entries, emotion, ambience, sentiment, streak, keywords) + AI summary |
| `EmotionChart.jsx` | Line chart of real sentiment scores over time |
| `EmotionPieChart.jsx` | Doughnut chart of emotion distribution |
| `KeywordCloud.jsx` | Tag cloud of recent journal keywords |
| `MentalHealthPatterns.jsx` | AI-detected patterns, triggers, habits, recommendation |

---

## 9. STATE MANAGEMENT

No Redux or Zustand — React's built-in `useState` and `useCallback` are sufficient for this app's complexity.

```js
const [entries, setEntries] = useState([]);
const [insights, setInsights] = useState(null);
const [loading, setLoading] = useState(true);
const [tab, setTab] = useState("home");
```

All state lives in `page.js` and is passed down as props. This is called **"lifting state up"** — a standard React pattern.

`useCallback` on `fetchAll` prevents the function from being recreated on every render, which would cause an infinite loop in the `useEffect` dependency array.

---

## 10. CACHING STRATEGY

**Redis** caches two things:
1. **Insights** (`insights:{userId}`) — cached for 30 minutes. Busted with `?bust=1` when a new entry is saved.
2. **Daily Prompt** (`prompt:{userId}`) — cached for 1 hour.

**Why cache insights?** The insights endpoint makes 3 Groq API calls (pattern detection + mood summary + suggestion). Without caching, every page load hits Groq 3 times — slow and expensive.

---

## 11. VOICE JOURNALING PIPELINE

```
User clicks mic → MediaRecorder captures audio (WebM/Opus)
      ↓
Stop recording → Blob created → FormData with audio + duration
      ↓
POST /api/journal/voice/transcribe (multipart/form-data)
      ↓
Multer saves to OS temp directory
      ↓
voiceService.transcribeAudio() → toFile() → Groq Whisper Large V3
      ↓
Returns transcript text
      ↓
voiceService.analyzeVoice() → compute WPM, filler words
      ↓
Groq Llama analyzes: emotion, tone, stress score (0-10), energy, confidence
      ↓
Returns { transcript, voiceAnalysis } to frontend
      ↓
Transcript auto-fills journal textarea
Voice analysis card shown (stress meter, emotion, tone, pace)
      ↓
User reviews/edits transcript → clicks Save → normal journal entry flow
```

---

## 12. ERROR HANDLING

**Backend:** Every controller is wrapped in `try/catch`. AI calls inside `insightsController` have individual try/catch blocks so one failing Groq call doesn't kill the entire response — fallback strings are used instead.

**Frontend:** Axios errors are caught with `.catch()`. The chat component shows a friendly message on network failure. The voice recorder shows specific error messages (mic denied, transcription failed).

**Database safety:** `safeDate()` helper prevents crashes from entries with missing `createdAt`. `.lean()` on Mongoose queries prevents method-not-found errors on plain objects.

---

## 13. DEPLOYMENT

**Docker Compose** (`docker-compose.yml`) defines 4 services:
- `backend` — Node.js on port 5000
- `frontend` — Next.js on port 3000
- `mongo` — MongoDB 7 with persistent volume
- `redis` — Redis 7 Alpine

```bash
docker-compose up --build
```

**Environment variables** are injected via Docker environment section. The `GROQ_API_KEY` is passed from the host machine's environment.

**Local development:**
```bash
# Backend
cd backend && npm run dev   # nodemon server.js on port 5000

# Frontend
cd frontend && npm run dev  # Next.js on port 3000
```

---

## 14. SECURITY CONSIDERATIONS

| Area | Current State | Improvement |
|---|---|---|
| Authentication | None — userId hardcoded as "123" | Add JWT auth |
| API Keys | In `.env` file | Use secrets manager in production |
| Input validation | Basic (text required check) | Add express-validator |
| CORS | Open (`app.use(cors())`) | Restrict to frontend origin |
| Rate limiting | None | Add express-rate-limit |
| HTTPS | Not configured locally | Required in production |

---

## 15. PERFORMANCE OPTIMIZATIONS

1. **Redis caching** — insights cached 30 min, prompts 1 hour
2. **`.lean()`** on Mongoose queries — returns plain objects, 2-3x faster
3. **`Promise.all()`** — entries and insights fetched in parallel on page load
4. **`max_tokens` limits** — mood summary (60 tokens), suggestion (50 tokens) — faster Groq responses
5. **Individual AI fallbacks** — one Groq failure doesn't block the response
6. **Cache busting** — only re-calls Groq when new entry is added (`?bust=1`)

---

## 16. WEAKNESSES & FUTURE IMPROVEMENTS

| Weakness | Improvement |
|---|---|
| No real authentication | Implement JWT + user registration/login |
| UserId hardcoded as "123" | Dynamic userId from auth system |
| No input sanitization | Add DOMPurify on frontend, express-validator on backend |
| Groq rate limits can cause slow responses | Add request queuing with Bull |
| No tests | Add Jest unit tests + Supertest API tests |
| Voice only works in Chrome/Edge | Add ffmpeg conversion for Safari |
| No pagination on entries | Add limit/offset to `getUserEntries` |
| Patterns re-detected on every insights call | Cache pattern detection separately |

---

## 17. VIVA QUESTIONS & ANSWERS

**Q: Why did you use Next.js instead of plain React?**
A: Next.js gives SSR, automatic code splitting, optimized image handling, and built-in routing. For a production app, these matter. Plain React would need extra setup for all of this.

**Q: Why MongoDB instead of PostgreSQL?**
A: Journal entries are semi-structured — different entries may have different fields (some have voice analysis, some don't). MongoDB's flexible schema handles this naturally. PostgreSQL would require ALTER TABLE for every new field.

**Q: Why Groq instead of OpenAI?**
A: Groq provides extremely fast inference (LPU hardware) and has a generous free tier. The same Llama 3.3 70B model is available. For a student project, cost and speed matter.

**Q: What is the hydration error and how did you fix it?**
A: Next.js renders components on the server first, then "hydrates" them on the client. `new Date().getHours()` returns different values on server vs client (different time or timezone), causing a mismatch. Fixed by initializing greeting as empty string and setting it in `useEffect` which only runs on the client.

**Q: Why do you use `.lean()` on Mongoose queries?**
A: `.lean()` returns plain JavaScript objects instead of full Mongoose Document instances. This is 2-3x faster and uses less memory because Mongoose doesn't attach all its methods and metadata to each object.

**Q: What happens if Redis is down?**
A: The `cache.js` utility has a fault-tolerant design. If Redis connection fails, `isConnected` is set to false. All `getCache` calls return `null` and all `setCache` calls silently skip. The app continues working — just without caching.

**Q: Why are static routes defined before parameterized routes?**
A: Express matches routes in order. If `/journal/:userId` is defined first, a request to `/journal/analyze` would match with `userId = "analyze"`. Static routes must come first to prevent this.

**Q: What is `toFile()` and why is it needed for voice?**
A: Groq SDK 1.x requires audio files to have a filename and content-type. A raw `fs.createReadStream()` has no filename. `toFile()` from `groq-sdk/uploads` wraps the stream with metadata so Groq's API accepts it.

**Q: How does the AI therapist know about my journal?**
A: `therapistService.js` builds a system prompt that includes the user's real data: top emotion, average sentiment, mood streak, recent keywords, detected patterns, and the last 10 journal entries. This context is sent to Groq with every message, so the AI's responses are grounded in actual data.

**Q: What is the `__OPEN__` token?**
A: When the chat component mounts, it sends `question: "__OPEN__"` to the backend. The therapist service checks for this token and skips adding it as a user message — instead, the AI generates an opening greeting based on journal data with no user input.

**Q: How does emotion distribution work in the pie chart?**
A: The backend counts how many entries have each emotion, calculates the percentage, and returns `emotionDistribution` array. The frontend maps each emotion to a fixed color palette and renders a Doughnut chart. No hardcoded data — all from real MongoDB entries.

**Q: What is the mood streak?**
A: Entries are sorted newest-first. The code iterates through them and counts consecutive entries with positive emotions (happy, excited, calm, grateful, etc.). As soon as a non-positive emotion is found, the loop breaks. This gives the current streak of positive days.

**Q: How does voice stress detection work?**
A: The frontend timer measures recording duration. After transcription, the backend counts filler words (um, uh, like, you know) and calculates words-per-minute. These stats are sent to Groq Llama which returns a stress score (0-10), stress level, tone, energy, and confidence based on the transcript content and speech patterns.

---

## 18. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER (Port 3000)                │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Overview │  │  Write   │  │ Analytics │ Chat  │  │
│  │  Tab     │  │  Tab     │  │   Tab     │  Tab  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│         Next.js (React 19 + Tailwind CSS)            │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP (Axios)
                      ▼
┌─────────────────────────────────────────────────────┐
│              EXPRESS SERVER (Port 5000)              │
│                                                      │
│  CORS → JSON Parser → Logger → Routes               │
│                                                      │
│  /api/journal          → journalController           │
│  /api/journal/insights → insightsController          │
│  /api/journal/chat     → chatController              │
│  /api/journal/voice    → voiceController             │
└──────┬──────────────────────┬────────────────────────┘
       │                      │
       ▼                      ▼
┌─────────────┐      ┌────────────────────┐
│   MongoDB   │      │    Groq API        │
│   Atlas     │      │                   │
│             │      │  Llama 3.3 70B    │
│  Journal    │      │  (emotion, chat,  │
│  Collection │      │   patterns, voice)│
│             │      │                   │
└─────────────┘      │  Whisper Large V3 │
                     │  (transcription)  │
       ▲             └────────────────────┘
       │
┌─────────────┐
│    Redis    │
│   Cache     │
│             │
│ insights:*  │
│ prompt:*    │
└─────────────┘
```

---

## 19. QUICK CHEAT SHEET

**Key Files:**
- Entry point: `backend/server.js`
- All routes: `backend/routes/journalRoutes.js`
- DB schema: `backend/models/Journel.js`
- AI emotion: `backend/services/llmServices.js`
- AI chat: `backend/services/therapistService.js`
- Voice: `backend/services/voiceService.js`
- Caching: `backend/utils/cache.js`
- Main page: `frontend/app/page.js`
- Chat UI: `frontend/components/JournalChat.jsx`
- Voice UI: `frontend/components/VoiceRecorder.jsx`

**Key Commands:**
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Docker (all services)
docker-compose up --build

# Install backend deps
cd backend && npm install

# Install frontend deps
cd frontend && npm install
```

**Key Environment Variables:**
```
# backend/.env
PORT=5000
MONGO_URI=mongodb+srv://...
GROQ_API_KEY=gsk_...
REDIS_URL=redis://localhost:6379

# frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Important Concepts:**
- `async/await` — used everywhere for non-blocking I/O (DB queries, AI calls)
- `try/catch` — every controller has error handling
- `Promise.all()` — parallel API calls for performance
- `.lean()` — faster Mongoose queries
- `useCallback` — prevents infinite re-render loops
- `useEffect` — side effects (data fetching, client-only code)
- `useState` — reactive UI state
- Hydration — SSR/client mismatch issue with `Date.now()`
- Cache busting — `?bust=1` query param forces fresh AI data

---

*This document covers the complete NatureMind AI Journal project — architecture, code logic, API flow, AI pipeline, and viva preparation.*
