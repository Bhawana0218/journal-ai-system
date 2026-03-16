# 🌿 NatureMind AI Journal

**NatureMind** is a full-stack AI-powered journaling platform that helps you track your emotions, analyze mental patterns, and gain actionable insights over time using free AI (Llama-3 via Groq).

---

## ✨ Key Features

- 📝 **Create & View Journal Entries**  
  Easily log your daily thoughts, moods, and ambience.

- 🧠 **AI Emotion Analysis**  
  Detect emotions like calm, happy, sad, anxious, angry, and more.

- 📊 **Interactive Insights Dashboard**  
  Track top emotions, total entries, recent keywords, and mood timelines with charts and graphs.

- 🔄 **Mental Health Pattern Detection**  
  Identify recurring patterns, triggers, and positive habits to improve your well-being.

- ⚡ **Caching & Performance**  
  Insights are cached using Redis for faster repeated analysis.

- 🐳 **Docker Ready**  
  Easily run the full stack with Docker for seamless local or cloud deployment.

---

## 🛠 Tech Stack

- **Backend:** Node.js + Express  
- **Frontend:** Next.js + React + TailwindCSS  
- **Database:** MongoDB  
- **AI:** Groq API (free Llama-3)  
- **Cache:** Redis  
- **Containerization:** Docker & Docker Compose  

---

## 🚀 Installation

### 1️⃣ Using Node.js Locally

#### Backend Setup
```bash
cd backend
npm install
# Create a .env file with the following variables:
# PORT=5000
# MONGO_URI=<your_mongodb_connection_string>
# GROQ_API_KEY=<your_groq_api_key>
npm run dev
```
#### Frontend Setup
```bash 
cd frontend
npm install
# Optional: Create a .env.local if needed for frontend environment variables
npm run dev
```

### Using Docker
```bash
# Build and start all services
docker-compose up --build

# Access frontend
http://localhost:3000

# Backend API
http://localhost:5000
```