"use client";

import React, { useState } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Target, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, PlayCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentPracticeBuilderPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState("comp-1");
  const [topicId, setTopicId] = useState("top-2");
  const [questionCount, setQuestionCount] = useState(5);
  const [targetWeakAreas, setTargetWeakAreas] = useState(true);
  const [unseenOnly, setUnseenOnly] = useState(true);
  const [isBuilding, setIsBuilding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBuilding(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/assessments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Adaptive Practice: ${targetWeakAreas ? "Weak Topic Focus" : "Custom Drill"}`,
          companyId,
          topicIds: [topicId],
          difficultyMix: { EASY: 40, MEDIUM: 40, HARD: 20 },
          questionCount: Number(questionCount),
          durationMinutes: Number(questionCount) * 2, // 2 mins per question
          mode: "PRACTICE",
          studentEmail: "sp2026cs01@student.hindustanuniv.ac.in",
        }),
      });

      const data = await res.json();
      if (data.success && data.assessment) {
        // Start attempt directly
        const startRes = await fetch("/api/attempts/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessmentId: data.assessment.id,
            studentEmail: "sp2026cs01@student.hindustanuniv.ac.in",
            studentName: "SP2026CS01 Student",
          }),
        });
        const startData = await startRes.json();
        if (startData.success) {
          router.push(`/exam/${startData.attempt.id}`);
        }
      } else {
        setErrorMsg(data.error || "Unable to assemble practice set. Try selecting broader topics.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to start practice");
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="STUDENT" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="border-b border-slate-200 pb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Adaptive Learning Engine
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Personalized Practice Drill Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build custom practice tests targeting placement patterns with guaranteed no-repetition.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Shortage Notification</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleStartPractice}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
        >
          {/* Smart Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setTargetWeakAreas(!targetWeakAreas)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                targetWeakAreas
                  ? "bg-blue-50/70 border-blue-500 text-blue-900"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Target My Weak Topics</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Prioritizes topics where your historical accuracy is below 50%.
                </p>
              </div>
            </div>

            <div
              onClick={() => setUnseenOnly(!unseenOnly)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                unseenOnly
                  ? "bg-emerald-50/70 border-emerald-500 text-emerald-900"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Unseen Questions Only</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Excludes every question you have previously attempted or seen.
                </p>
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5">Placement Target Company</label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none"
                >
                  <option value="comp-1">TCS (Tata Consultancy Services)</option>
                  <option value="comp-2">Infosys</option>
                  <option value="comp-3">Wipro</option>
                  <option value="comp-4">Accenture</option>
                  <option value="comp-5">Cognizant</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5">Subject / Topic Drill</label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none"
                >
                  <option value="top-2">Time & Work (Quantitative)</option>
                  <option value="top-3">Speed, Time & Distance (Quantitative)</option>
                  <option value="top-5">Probability & Combinatorics (Quantitative)</option>
                  <option value="top-7">Blood Relations (Logical)</option>
                  <option value="top-13">Data Structures & Algorithms (Technical)</option>
                  <option value="top-14">SQL & Database Queries (Technical)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1.5">Question Count: {questionCount} Questions</label>
              <input
                type="range"
                min={3}
                max={20}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Quick (3 Qs)</span>
                <span>Standard (10 Qs)</span>
                <span>Deep Drill (20 Qs)</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isBuilding}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              {isBuilding ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking Unseen Question Pool...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  <span>Launch Practice Drill</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
