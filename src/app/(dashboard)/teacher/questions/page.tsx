"use client";

import React, { useState, useEffect } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Search, Filter, Download, Plus, Layers, CheckCircle2, AlertCircle } from "lucide-react";

export default function TeacherQuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (difficultyFilter) params.append("difficulty", difficultyFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/questions?${params.toString()}`);
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
    fetchQuestions();
  }, [search, difficultyFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="TEACHER" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Central Question Repository</h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse approved questions across companies (TCS, Infosys, Wipro, Accenture) and subjects.
            </p>
          </div>

          <a
            href="/api/exports?target=QUESTIONS"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Question Bank (Excel)</span>
          </a>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search question text or explanations..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <span className="text-xs font-bold text-slate-500 px-2">
              {questions.length} Questions Found
            </span>
          </div>
        </div>

        {/* Questions Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Searching question bank...</div>
        ) : questions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">No questions match your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {q.id}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        q.difficulty === "HARD"
                          ? "bg-rose-100 text-rose-800"
                          : q.difficulty === "MEDIUM"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        q.status === "APPROVED"
                          ? "bg-blue-100 text-blue-800"
                          : q.status === "PENDING_REVIEW"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {q.status}
                    </span>
                    <span className="text-xs text-slate-400">Marks: {q.marks} (Neg: {q.negativeMarks})</span>
                  </div>

                  <span className="text-xs text-slate-500">Source: {q.source}</span>
                </div>

                <p className="text-sm font-bold text-slate-900 leading-snug">{q.text}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`p-2 rounded-lg border ${
                        opt.isCorrect
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <span className="font-bold mr-1">{String.fromCharCode(65 + opt.position)}.</span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong className="text-slate-700">Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
