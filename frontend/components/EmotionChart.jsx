"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export default function EmotionChart({ insights }) {
  if (!insights?.moodTimeline?.length)
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <span className="text-3xl mb-2">📈</span>
        <p className="text-sm">No mood data yet</p>
      </div>
    );

  const timeline = insights.moodTimeline;

  const labels = timeline.map(e => {
    const d = new Date(e.date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  // Use real sentimentScore from AI (-1 to 1), fall back to 0
  const scores = timeline.map(e =>
    typeof e.sentimentScore === "number" ? e.sentimentScore : 0
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Sentiment Score",
        data: scores,
        borderColor: "rgb(34,197,94)",
        backgroundColor: "rgba(34,197,94,0.08)",
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: scores.map(s =>
          s >= 0.3 ? "#22c55e" : s >= -0.3 ? "#facc15" : "#f87171"
        ),
        pointHoverRadius: 8,
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#d1fae5",
        borderColor: "#22c55e",
        borderWidth: 1,
        callbacks: {
          label: ctx => {
            const score = ctx.parsed.y;
            const emotion = timeline[ctx.dataIndex]?.emotion || "";
            const label = score >= 0.3 ? "Positive" : score >= -0.3 ? "Neutral" : "Negative";
            return ` ${emotion}  •  ${label} (${score >= 0 ? "+" : ""}${score.toFixed(2)})`;
          }
        }
      }
    },
    scales: {
      y: {
        min: -1,
        max: 1,
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: {
          callback: val => val === 1 ? "😊 +1" : val === 0 ? "😐 0" : val === -1 ? "😔 -1" : val.toFixed(1),
          font: { size: 11 }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  return (
    <div>
      <div className="h-56">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
