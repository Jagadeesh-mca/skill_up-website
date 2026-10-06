"use client";

import React, { useState, useEffect } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Clock, Award, BookOpen, AlertCircle, PlayCircle, CheckCircle2, ChevronRight, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentAssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/assessments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAssessments(data.assessments);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStartExam = async (assessmentId: string) => {
    setStartingId(assessmentId);
    try {
      const res = await fetch("/api/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          studentEmail: "sp2026cs01@student.hindustanuniv.ac.in",
          studentName: "SP2026CS01 Student",
        }),
      });
      const data = await res.json();
      if (data.success && data.attempt) {
        router.push(`/exam/${data.attempt.id}`);
      }
    } catch (e) {
      console.error(e);
      setStartingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="STUDENT" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Placement Assessments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Official timed assessments assigned to your batch. Ensure stable connectivity before launching.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading available assessments...</div>
        ) : assessments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">No assessments currently open for your batch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.map((asm) => (
              <div
                key={asm.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                      {asm.companyName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Code: {asm.code}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{asm.title}</h3>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Questions</span>
                      <strong className="text-slate-800">{asm.questionCount} Questions</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Time Limit</span>
                      <strong className="text-slate-800">{asm.durationMinutes} Minutes</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Marking</span>
                      <strong className="text-slate-800">{asm.totalMarks} Pts (-{asm.negativeMarkingRate})</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-700">Exam Instructions:</p>
                    <p>• Countdown timer runs on server; auto-submits upon expiry.</p>
                    <p>• Answers autosave in real time; you can resume if disconnected.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleStartExam(asm.id)}
                    disabled={startingId === asm.id}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{startingId === asm.id ? "Launching Secure Test..." : "Start Assessment Now"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
