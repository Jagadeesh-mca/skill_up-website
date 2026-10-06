"use client";

import React, { useState, useEffect } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { TrendingDown, TrendingUp, AlertTriangle, Target, Award, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function StudentPerformancePage() {
  const [weakAreas, setWeakAreas] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics?type=STUDENT&email=sp2026cs01@student.hindustanuniv.ac.in")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setWeakAreas(d.weakAreas || []);
          setRecommendations(d.recommendations || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="STUDENT" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance Analytics & Weak Areas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time accuracy analytics, skill gap detection, and personalized practice recommendations.
          </p>
        </div>

        {/* Weak Areas Banner */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-bold text-slate-900">Detected Skill Gaps & Weak Topics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakAreas.map((w, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                      {w.severity} PRIORITY
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{w.topicName}</h3>
                    <p className="text-xs text-slate-400">{w.subjectName}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-rose-600">{w.accuracy}%</span>
                    <span className="text-[10px] text-slate-400 block">Accuracy</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {w.recommendationReason}
                </p>

                <div className="pt-1">
                  <Link
                    href="/student/practice"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                  >
                    <span>Practice {w.topicName} Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Recommendations Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Recommended Targeted Practice Sets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">
                      {rec.topicName}
                    </span>
                    <span className="text-slate-400 font-semibold">{rec.estimatedMinutes} Mins</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>
                  <p className="text-xs text-slate-500">{rec.reason}</p>
                </div>

                <Link
                  href="/student/practice"
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1.5"
                >
                  <span>Start Targeted Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
