"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import VoiceRecorder from "./VoiceRecorder";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function JournalForm({ onNewEntry }) {
  const [mode, setMode] = useState("write");   // "write" | "speak"
  const [text, setText] = useState("");
  const [ambience, setAmbience] = useState("forest");
  const [submitting, setSubmitting] = useState(false);
  const audioRef = useRef(null);

  const ambienceAssets = {
    forest:   { bg: "/ambience/forest.jpg",   sound: "/ambience/forest.mp3"   },
    ocean:    { bg: "/ambience/ocean.jpg",    sound: "/ambience/ocean.mp3"    },
    mountain: { bg: "/ambience/mountain.jpg", sound: "/ambience/mountain.mp3" },
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [ambience]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/api/journal`, {
        userId: "123",
        ambience,
        text,
      });
      onNewEntry(res.data);
      setText("");
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-lg mb-6"
      style={{ backgroundImage: `url(${ambienceAssets[ambience]?.bg})` }}
    >
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px] rounded-2xl" />

      <div className="relative z-10 p-6 flex flex-col gap-4">
        {/* ── Mode toggle ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white drop-shadow-md">
            {mode === "write" ? "🖊️ Write Your Journal" : "🎙️ Speak Your Journal"}
          </h2>
          <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                mode === "write"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              ✍️ Write
            </button>
            <button
              type="button"
              onClick={() => setMode("speak")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                mode === "speak"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              🎙️ Speak
            </button>
          </div>
        </div>

        {/* ── Write mode ──────────────────────────────────────────────── */}
        {mode === "write" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              className="w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-500 bg-white/85 text-gray-900 shadow-inner transition-all duration-300"
              placeholder="Write your journal entry…"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
            />

            <label className="block text-white font-medium text-sm">Choose Ambience</label>
            <select
              value={ambience}
              onChange={e => setAmbience(e.target.value)}
              className="w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/85 text-gray-900 shadow-inner transition-all duration-300"
            >
              <option value="forest">🌲 Forest</option>
              <option value="ocean">🌊 Ocean</option>
              <option value="mountain">⛰ Mountain</option>
            </select>

            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 drop-shadow-md disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing with AI…
                </>
              ) : "Add Entry"}
            </button>
          </form>
        )}

        {/* ── Speak mode ──────────────────────────────────────────────── */}
        {mode === "speak" && (
          <div className="flex flex-col gap-4">
            {/* Voice recorder — transcript auto-fills textarea below */}
            <VoiceRecorder onTranscript={t => { setText(t); }} />

            {/* Editable transcript textarea */}
            {text && (
              <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-medium">
                  📝 Transcript — review & edit before saving
                </label>
                <textarea
                  className="w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/85 text-gray-900 shadow-inner transition-all duration-300"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {/* Ambience selector */}
            <label className="block text-white font-medium text-sm">Choose Ambience</label>
            <select
              value={ambience}
              onChange={e => setAmbience(e.target.value)}
              className="w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/85 text-gray-900 shadow-inner transition-all duration-300"
            >
              <option value="forest">🌲 Forest</option>
              <option value="ocean">🌊 Ocean</option>
              <option value="mountain">⛰ Mountain</option>
            </select>

            {/* Save button — only shown when transcript is ready */}
            {text && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 drop-shadow-md disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving voice entry…
                  </>
                ) : "💾 Save Voice Entry"}
              </button>
            )}
          </div>
        )}
      </div>

      <audio ref={audioRef} loop>
        <source src={ambienceAssets[ambience]?.sound} type="audio/mpeg" />
      </audio>
    </div>
  );
}
