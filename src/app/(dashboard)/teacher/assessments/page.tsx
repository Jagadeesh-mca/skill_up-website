"use client";

import React, { useState, useEffect } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Plus, Layers, Clock, Award, AlertTriangle, CheckCircle2, ChevronRight, FileSpreadsheet, RefreshCw } from "lucide-react";

export default function TeacherAssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("comp-1");
  const [mode, setMode] = useState<"FIXED" | "PRACTICE">("FIXED");
  const [questionCount, setQuestionCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [easyPct, setEasyPct] = useState(40);
  const [medPct, setMedPct] = useState(40);
  const [hardPct, setHardPct] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shortageReport, setShortageReport] = useState<any | null>(null);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/assessments");
      const data = await res.json();
      if (data.success) {
        setAssessments(data.assessments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg(null);
    setShortageReport(null);

    try {
      const res = await fetch("/api/assessments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          companyId,
          mode,
          questionCount: Number(questionCount),
          durationMinutes: Number(durationMinutes),
          difficultyMix: { EASY: easyPct, MEDIUM: medPct, HARD: hardPct },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchAssessments();
      } else {
        setErrorMsg(data.error || "Generation failed");
        if (data.shortageReport) {
          setShortageReport(data.shortageReport);
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Network error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="TEACHER" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Placement Assessments</h1>
            <p className="text-sm text-slate-500 mt-1">
              Generate fixed batch test papers or dynamic adaptive blueprints with anti-repetition protection.
            </p>
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setErrorMsg(null);
              setShortageReport(null);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Assessment</span>
          </button>
        </div>

        {/* Assessments List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading assessments...</div>
        ) : assessments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">No assessments configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {assessments.map((asm) => (
              <div
                key={asm.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                      {asm.mode} MODE
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{asm.title}</h3>
                    <p className="text-xs text-slate-500 font-mono">Code: {asm.code}</p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {asm.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Questions</span>
                    <strong className="text-slate-700">{asm.questionCount} Items</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Duration</span>
                    <strong className="text-slate-700">{asm.durationMinutes} Mins</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Marks</span>
                    <strong className="text-slate-700">{asm.totalMarks} Pts</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-slate-500">
                    Company: <strong>{asm.companyName}</strong>
                  </span>

                  <a
                    href={`/api/exports?target=RESULTS&assessmentId=${asm.id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Results</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assessment Generator Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black text-slate-900">Configure Dynamic Assessment Blueprint</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Picks strictly APPROVED questions from central repository without duplication.
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>Shortage Notice: Insufficient Approved Questions</span>
                  </div>
                  <p>{errorMsg}</p>

                  {shortageReport && (
                    <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1 font-mono text-[11px]">
                      <p>• Requested: {shortageReport.totalRequested} questions</p>
                      <p>• Available in Bank: {shortageReport.totalAvailable} questions</p>
                      <p className="text-rose-600 font-bold">
                        • Shortage: Deficit of {shortageReport.shortageCount} questions
                      </p>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1">Assessment Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. TCS NQT Quantitative Mock Exam 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    >
                      <option value="FIXED">FIXED (Same paper for all)</option>
                      <option value="PRACTICE">PRACTICE (Dynamic per student)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Target Company</label>
                    <select
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    >
                      <option value="comp-1">TCS</option>
                      <option value="comp-2">Infosys</option>
                      <option value="comp-3">Wipro</option>
                      <option value="comp-4">Accenture</option>
                      <option value="comp-5">Cognizant</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Total Question Count</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2">
                    Difficulty Distribution Mix ({easyPct}% Easy / {medPct}% Medium / {hardPct}% Hard)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={easyPct}
                      onChange={(e) => setEasyPct(Number(e.target.value))}
                      className="p-2 border rounded-lg text-center"
                      placeholder="Easy %"
                    />
                    <input
                      type="number"
                      value={medPct}
                      onChange={(e) => setMedPct(Number(e.target.value))}
                      className="p-2 border rounded-lg text-center"
                      placeholder="Med %"
                    />
                    <input
                      type="number"
                      value={hardPct}
                      onChange={(e) => setHardPct(Number(e.target.value))}
                      className="p-2 border rounded-lg text-center"
                      placeholder="Hard %"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center gap-2"
                  >
                    {isGenerating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Generate & Publish</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
