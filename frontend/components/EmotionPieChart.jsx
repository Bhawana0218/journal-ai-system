"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const EMOTION_PALETTE = {
  happy:    "#facc15",
  excited:  "#fb923c",
  calm:     "#60a5fa",
  sad:      "#818cf8",
  stressed: "#f87171",
  anxious:  "#f472b6",
  neutral:  "#94a3b8",
  grateful: "#34d399",
  hopeful:  "#2dd4bf",
};

export default function EmotionPieChart({ insights }) {
  // Use emotionDistribution from insights API (real AI data)
  const distribution = insights?.emotionDistribution;

  if (!distribution?.length)
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <span className="text-3xl mb-2">🥧</span>
        <p className="text-sm">No emotion data yet</p>
      </div>
    );

  const labels = distribution.map(d => d.emotion);
  const values = distribution.map(d => d.count);
  const colors = labels.map(l => EMOTION_PALETTE[l.toLowerCase()] || "#a3e635");

  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors,
      borderColor: "#fff",
      borderWidth: 3,
      hoverOffset: 8,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: { size: 12 },
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 10,
        }
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#d1fae5",
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed} entries (${distribution[ctx.dataIndex]?.percentage}%)`
        }
      }
    }
  };

  return (
    <div>
      <div className="h-56">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
