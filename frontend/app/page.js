"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import JournalForm from "@/components/JournalForm";
import EntryList from "@/components/EntryList";
import Insights from "@/components/Insights";
import EmotionChart from "@/components/EmotionChart";
import EmotionPieChart from "@/components/EmotionPieChart";
import KeywordCloud from "@/components/KeywordCloud";
import MentalHealthPatterns from "@/components/MentalHealthPatterns";


export default function Home() {
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState({
  recentKeywords: [],
  patterns: [],
  emotionStats: {}
});

  const fetchEntries = async () => {
    const res = await axios.get("http://localhost:5000/api/journal/123");
    setEntries(res.data);
  };

  const fetchInsights = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/journal/insights/123");

    if (res.data) {
      setInsights(res.data);
    }
  } catch (error) {
    console.error("Insights error:", error);
  }
};

  useEffect(() => {
    fetchEntries();
    fetchInsights();
  }, []);

  const handleNewEntry = (entry) => {
    setEntries([entry, ...entries]);
    fetchInsights();
  };

  return (

    <div className="max-w-6xl mx-auto p-6 bg-linear-to-br from-green-50 to-green-100 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-green-800 text-center drop-shadow-md">
        🌿 NatureMind AI Journal
      </h1>

      {/* Insights Card */}
      <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <Insights insights={insights} />
      </div>

      {/* Journal Form */}
      <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <JournalForm onNewEntry={handleNewEntry} />
      </div>

      {/* Entries List */}
      <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <EntryList entries={entries} />
      </div>

      {/* Dashboard / Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <EmotionPieChart entries={entries} />
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <EmotionChart insights={insights || {}} />
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <KeywordCloud keywords={insights?.recentKeywords || []} />
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <MentalHealthPatterns patterns={insights?.patterns || []} />
        </div>
      </div>
    </div>
  );
}