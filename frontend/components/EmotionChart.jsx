"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function EmotionChart({ insights }) {
  if (!insights || !insights.moodTimeline) 
    return <p className="text-center text-gray-500">Loading chart...</p>;

  const labels = insights.moodTimeline.map(e => e.date);

  const emotions = insights.moodTimeline.map(e => {
    const map = {
      happy: 5,
      excited: 4,
      calm: 3,
      neutral: 2,
      sad: 1
    };
    return map[e.emotion] || 2;
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Mood Score",
        data: emotions,
        backgroundColor: "rgba(34,197,94,0.6)", // Tailwind green-500 semi-transparent
        borderColor: "rgb(34,197,94)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: "rgb(59,130,246)", // Tailwind blue-500
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14, weight: "bold" },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#dcfce7", // light green
        titleColor: "#166534",
        bodyColor: "#166534",
        borderColor: "#34d399",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 6,
        ticks: {
          callback: val => {
            const map = { 1: "Sad", 2: "Neutral", 3: "Calm", 4: "Excited", 5: "Happy" };
            return map[val] || val;
          },
          font: { weight: "bold" }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 mb-6">
      <h2 className="text-2xl font-extrabold mb-4 text-center text-green-700 drop-shadow-sm">
        🌈 Mood Insights
      </h2>
      <div className="h-64 md:h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}