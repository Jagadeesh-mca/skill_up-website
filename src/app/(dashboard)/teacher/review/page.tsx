"use client";

import React, { useState, useEffect } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Check, X, Sparkles, AlertCircle, CheckCircle2, Tag, BookOpen, Layers } from "lucide-react";

export default function TeacherReviewQueuePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/questions?status=PENDING_REVIEW");
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleStatusChange = async (questionId: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`Question ${newStatus === "APPROVED" ? "approved into central bank" : "rejected"}.`);
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="TEACHER" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Question Review & Approval Queue</h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify questions uploaded by staff. AI classification is provided as a suggestion for your review.
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs">
            {questions.length} Pending Approval
          </span>
        </div>

        {actionMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading pending questions...</div>
        ) : questions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Review Queue is Clear!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All uploaded questions have been reviewed and approved into the central repository.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                      ID: {q.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700">
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-slate-400">Source: {q.source}</span>
                  </div>

                  {/* AI Suggestion Badge */}
                  {q.aiClassification && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>
                        AI Suggestion: {q.aiClassification.topic} ({Math.round(q.aiClassification.confidence * 100)}% match)
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.text}</p>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        opt.isCorrect
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>
                        {String.fromCharCode(65 + opt.position)}. {opt.text}
                      </span>
                      {opt.isCorrect && (
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 flex justify-end items-center gap-3">
                  <button
                    onClick={() => handleStatusChange(q.id, "REJECTED")}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange(q.id, "APPROVED")}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve to Question Bank</span>
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
