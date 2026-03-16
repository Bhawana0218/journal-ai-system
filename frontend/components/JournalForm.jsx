import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function JournalForm({ onNewEntry }) {
  const [text, setText] = useState("");
  const [ambience, setAmbience] = useState("forest");

  const audioRef = useRef(null);

   const ambienceAssets = {
    forest: {
      bg: "/ambience/forest.jpg",
      sound: "/ambience/forest.mp3",
    },
    ocean: {
      bg: "/ambience/ocean.jpg",
      sound: "/ambience/ocean.mp3",
    },
    mountain: {
      bg: "/ambience/mountain.jpg",
      sound: "/ambience/mountain.mp3",
    },
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
    if (!text) return;

    try {
      const res = await axios.post("http://localhost:5000/api/journal", {
        userId: "123",
        ambience,
        text,
      });

      onNewEntry(res.data);
      setText("");

      if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // start from beginning
      audioRef.current.play().catch(() => {});
    }
      // setAmbience("forest");
    } catch (err) {
      console.error(err);
    }
  };

  return (

    <div
      className="relative p-6 rounded-2xl overflow-hidden shadow-lg mb-6"
      style={{
        backgroundImage: `url(${ambienceAssets[ambience]?.bg || "/ambience/forest.jpg"})`,
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] rounded-2xl"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex flex-col gap-4"
      >
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center drop-shadow-md">
          🖊️ Write Your Journal
        </h2>

        {/* Journal Textarea */}
        <textarea
          className="w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-600 bg-white/80 text-gray-900 shadow-inner transition-all duration-300"
          placeholder="Write your journal entry..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
        />

        {/* Ambience Selector */}
        <label className="block text-white font-medium">Choose Ambience</label>
        <select
          value={ambience}
          onChange={(e) => setAmbience(e.target.value)}
          className="w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/80 text-gray-900 shadow-inner transition-all duration-300"
        >
          <option value="forest">🌲 Forest</option>
          <option value="ocean">🌊 Ocean</option>
          <option value="mountain">⛰ Mountain</option>
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-linear-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 drop-shadow-md"
        >
          Add Entry
        </button>
      </form>

      {/* Ambient Audio */}
      <audio ref={audioRef} loop>
        <source src={ambienceAssets[ambience]?.sound} type="audio/mpeg" />
      </audio>
    </div>
  );
}