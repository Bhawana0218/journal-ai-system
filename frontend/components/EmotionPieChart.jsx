"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function EmotionPieChart({ entries }) {

  if (!entries || entries.length === 0) return null;

  const emotionCount = {};

  entries.forEach(e => {
    const emotion = e.emotion || "neutral";
    emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
  });

  const data = {
    labels: Object.keys(emotionCount),
    datasets: [
      {
        label: "Emotion Distribution",
        data: Object.values(emotionCount),
        backgroundColor: [
          "#60a5fa",
          "#34d399",
          "#fbbf24",
          "#f87171",
          "#a78bfa"
        ]
      }
    ]
  };

  return (

    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-green-700 text-center drop-shadow-sm">
        🌈 Emotion Distribution
      </h2>
      <div className="w-full h-64 md:h-80 flex justify-center items-center">
        <Pie data={data} />
      </div>
    </div>
  );
}