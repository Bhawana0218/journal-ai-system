"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

// ── Stress score → colour ─────────────────────────────────────────────────────
function stressColor(score) {
  if (score <= 3) return { bar: "bg-green-400",  text: "text-green-700",  bg: "bg-green-50",  border: "border-green-200"  };
  if (score <= 6) return { bar: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" };
  return              { bar: "bg-red-400",    text: "text-red-700",    bg: "bg-red-50",    border: "border-red-200"    };
}

// ── Animated waveform bars ────────────────────────────────────────────────────
function Waveform({ active }) {
  return (
    <div className="flex items-end gap-0.5 h-8">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${active ? "bg-red-400" : "bg-gray-300"}`}
          style={{
            height: active ? `${20 + Math.sin(i * 0.8) * 12}px` : "6px",
            animation: active ? `wave ${0.6 + i * 0.07}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function Pill({ icon, label, value, colorClass = "bg-gray-100 text-gray-700" }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${colorClass}`}>
      <span>{icon}</span>
      <span>{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export default function VoiceRecorder({ onTranscript }) {
  const [state, setState] = useState("idle"); // idle | recording | processing | done | error
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState(null);   // { transcript, voiceAnalysis }
  const [errorMsg, setErrorMsg] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const timerRef         = useRef(null);
  const streamRef        = useRef(null);

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  // ── Start recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    setErrorMsg("");
    setResult(null);
    setSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Prefer webm/opus, fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = handleStop;

      recorder.start(250); // collect chunks every 250ms
      setState("recording");

      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch (err) {
      setErrorMsg("Microphone access denied. Please allow microphone permission and try again.");
      setState("error");
    }
  };

  // ── Stop recording ─────────────────────────────────────────────────────────
  const stopRecording = () => {
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setState("processing");
  };

  // ── Send to backend ────────────────────────────────────────────────────────
  const handleStop = async () => {
    try {
      const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mimeType });

      // Determine file extension from mime type
      const ext = mimeType.includes("ogg") ? "ogg" : mimeType.includes("wav") ? "wav" : "webm";

      const formData = new FormData();
      formData.append("audio", blob, `recording.${ext}`);
      formData.append("duration", String(seconds)); // send timer value to backend

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/journal/voice/transcribe`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(res.data);
      setState("done");

      // Auto-fill the journal textarea
      if (onTranscript && res.data.transcript) {
        onTranscript(res.data.transcript);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Transcription failed. Please try again.");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setResult(null);
    setSeconds(0);
    setErrorMsg("");
  };

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">

      {/* ── Recorder bar ──────────────────────────────────────────────── */}
      <div className={`px-5 py-4 flex items-center justify-between gap-4 transition-colors duration-500 ${
        state === "recording" ? "bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100"
        : state === "processing" ? "bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100"
        : state === "done" ? "bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100"
        : "bg-gray-50 border-b border-gray-100"
      }`}>

        <div className="flex items-center gap-3">
          {/* Mic button */}
          {state === "idle" || state === "error" ? (
            <button
              onClick={startRecording}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-rose-500 text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              title="Start recording"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-1 14.93V20H9v2h6v-2h-2v-2.07A7 7 0 0 0 19 11h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93z"/>
              </svg>
            </button>
          ) : state === "recording" ? (
            <button
              onClick={stopRecording}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform animate-pulse"
              title="Stop recording"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            </button>
          ) : state === "processing" ? (
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">✓</div>
          )}

          {/* Status text + waveform */}
          <div>
            {state === "idle" && <p className="text-sm font-semibold text-gray-700">🎙️ Voice Journal</p>}
            {state === "idle" && <p className="text-xs text-gray-400">Tap the mic to start speaking</p>}

            {state === "recording" && (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-red-600">Recording {fmt(seconds)}</span>
                </div>
                <Waveform active={true} />
              </>
            )}

            {state === "processing" && (
              <>
                <p className="text-sm font-semibold text-violet-700">Transcribing with Whisper…</p>
                <p className="text-xs text-violet-400">Analyzing tone, emotion & stress</p>
              </>
            )}

            {state === "done" && (
              <>
                <p className="text-sm font-semibold text-green-700">✓ Voice entry ready</p>
                <p className="text-xs text-gray-400">Transcript added to your journal below</p>
              </>
            )}

            {state === "error" && (
              <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Reset button */}
        {(state === "done" || state === "error") && (
          <button
            onClick={reset}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Record again
          </button>
        )}
      </div>

      {/* ── Voice Analysis Card ────────────────────────────────────────── */}
      {state === "done" && result?.voiceAnalysis && (() => {
        const va = result.voiceAnalysis;
        const sc = stressColor(va.stressScore ?? 0);

        return (
          <div className="p-5 space-y-4">
            {/* Top row — emotion + tone */}
            <div className="flex flex-wrap gap-2">
              <Pill icon="🎭" label="Emotion"  value={va.emotion}     colorClass="bg-purple-100 text-purple-700" />
              <Pill icon="🎵" label="Tone"     value={va.tone}        colorClass="bg-blue-100 text-blue-700" />
              <Pill icon="⚡" label="Energy"   value={va.energyLevel} colorClass="bg-amber-100 text-amber-700" />
              <Pill icon="💬" label="Pace"     value={`${va.wpm} WPM (${va.paceLabel})`} colorClass="bg-teal-100 text-teal-700" />
              <Pill icon="🤝" label="Confidence" value={va.confidence} colorClass="bg-green-100 text-green-700" />
            </div>

            {/* Stress meter */}
            <div className={`p-3 rounded-xl border ${sc.bg} ${sc.border}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold uppercase tracking-wide ${sc.text}`}>
                  🧠 Stress Level — {va.stressLevel}
                </span>
                <span className={`text-xs font-bold ${sc.text}`}>{va.stressScore}/10</span>
              </div>
              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${sc.bar}`}
                  style={{ width: `${(va.stressScore / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Speech stats row */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: "⏱️", label: "Duration",    value: `${va.duration}s` },
                { icon: "⏸️", label: "Pauses",      value: va.pauseSummary },
                { icon: "🔤", label: "Filler words", value: `${va.fillerCount} (${va.fillerRate}%)` },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <p className="text-base">{s.icon}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  <p className="text-xs font-bold text-gray-700 mt-0.5 leading-tight">{s.value}</p>
                </div>
              ))}
            </div>

            {/* AI Insight */}
            {va.insight && (
              <div className="p-3 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold text-violet-700">💡 Voice Insight — </span>
                  {va.insight}
                </p>
              </div>
            )}

            {/* AI Recommendation */}
            {va.recommendation && (
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold text-green-700">✅ Recommendation — </span>
                  {va.recommendation}
                </p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
