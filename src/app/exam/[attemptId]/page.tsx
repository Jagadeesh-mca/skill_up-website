"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, ShieldAlert, CheckCircle2, Bookmark, AlertCircle, ArrowLeft, ArrowRight, Check, X, RefreshCw } from "lucide-react";

export default function ExamTakingPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.attemptId as string;

  const [assessment, setAssessment] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; isFlagged?: boolean }>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [autosaveStatus, setAutosaveStatus] = useState("Saved");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize test data
  useEffect(() => {
    // For demo/standalone, load active assessment questions
    fetch("/api/questions?status=APPROVED")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.questions.length > 0) {
          const qs = d.questions.slice(0, 6);
          setQuestions(qs);
          setAssessment({
            title: "Hindustan Skill Up Diagnostic Test 2026",
            durationMinutes: 60,
            totalMarks: qs.length,
          });
          setTimeLeft(60 * 60);
        }
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  // Server Countdown Timer
  useEffect(() => {
    if (evaluationResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto submit on timer expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [evaluationResult]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: optionId,
      },
    }));

    // Trigger debounced autosave
    setAutosaveStatus("Saving...");
    fetch("/api/attempts/autosave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId: attemptId || "demo-attempt",
        questionId,
        selectedOptionId: optionId,
        timeSpentSeconds: 5,
      }),
    })
      .then(() => setAutosaveStatus("Saved"))
      .catch(() => setAutosaveStatus("Sync Error"));
  };

  const toggleFlag = (questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isFlagged: !prev[questionId]?.isFlagged,
      },
    }));
  };

  const clearAnswer = (questionId: string) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      if (copy[questionId]) {
        delete copy[questionId].selectedOptionId;
      }
      return copy;
    });
  };

  const handleSubmit = async (isTimeout = false) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/attempts/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attemptId || "demo-attempt",
          isTimeout,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEvaluationResult(data.evaluation);
        setShowSubmitModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentIdx];
  const answeredCount = Object.values(answers).filter((a) => a.selectedOptionId).length;
  const flaggedCount = Object.values(answers).filter((a) => a.isFlagged).length;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span>Setting up secure assessment environment...</span>
        </div>
      </div>
    );
  }

  // Result Evaluation Screen
  if (evaluationResult) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col justify-center items-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              evaluationResult.passed
                ? "bg-emerald-100 text-emerald-600"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            {evaluationResult.passed ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
          </div>

          <div>
            <span
              className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                evaluationResult.passed
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {evaluationResult.passed ? "ASSESSMENT PASSED" : "ASSESSMENT FAILED"}
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-3">
              {evaluationResult.score} / {evaluationResult.totalMarks} Points
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Percentage: <strong>{evaluationResult.percentage}%</strong> • Accuracy:{" "}
              <strong>{evaluationResult.accuracy}%</strong>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Correct</span>
              <strong className="text-emerald-600 text-base">{evaluationResult.correctCount}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Incorrect</span>
              <strong className="text-rose-600 text-base">{evaluationResult.incorrectCount}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Negative Deducted</span>
              <strong className="text-amber-600 text-base">-{evaluationResult.negativeMarksDeducted}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Performance metrics and seen-question history have been recorded. Questions in this test will not repeat in future practice sessions.
          </p>

          <button
            onClick={() => router.push("/student")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Return to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Test-Taking Header */}
      <header className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
            HITS
          </div>
          <div>
            <h2 className="text-sm font-bold truncate max-w-xs sm:max-w-md">{assessment?.title}</h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{autosaveStatus}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Server Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold ${
              timeLeft < 120
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                : timeLeft < 600
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-slate-800 text-slate-200 border border-slate-700"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Test Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Question Display */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6">
          {currentQ ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    +{currentQ.marks} Mark / -{currentQ.negativeMarks} Neg
                  </span>
                  <button
                    onClick={() => toggleFlag(currentQ.id)}
                    className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                      answers[currentQ.id]?.isFlagged
                        ? "bg-purple-100 border-purple-300 text-purple-700"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {answers[currentQ.id]?.isFlagged ? "Flagged" : "Flag"}
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQ.text}
              </p>

              {/* Options Radio List */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt: any) => {
                  const isSelected = answers[currentQ.id]?.selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-3.5 ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + opt.position)}
                      </div>
                      <span className="text-sm font-medium">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p>No question loaded</p>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => clearAnswer(currentQ.id)}
              disabled={!answers[currentQ.id]?.selectedOptionId}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 disabled:opacity-30"
            >
              Clear Choice
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
                disabled={currentIdx === questions.length - 1}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                <span>Save & Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Collapsible Question Palette */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 h-fit">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Question Palette</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Jump directly to any item</p>
          </div>

          {/* Status Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span>Flagged ({flaggedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-200"></span>
              <span>Unvisited ({questions.length - answeredCount})</span>
            </div>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isAnswered = Boolean(ans?.selectedOptionId);
              const isFlagged = Boolean(ans?.isFlagged);
              const isCurrent = idx === currentIdx;

              let bgClass = "bg-slate-100 text-slate-700 hover:bg-slate-200";
              if (isAnswered) bgClass = "bg-emerald-500 text-white hover:bg-emerald-600";
              if (isFlagged) bgClass = "bg-purple-500 text-white hover:bg-purple-600";

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-9 rounded-xl font-bold text-xs transition relative ${bgClass} ${
                    isCurrent ? "ring-2 ring-blue-600 ring-offset-2" : ""
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Confirm Final Submission?</h3>
              <p className="text-xs text-slate-500 mt-1">
                You cannot alter your responses once submitted.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Answered</span>
                <strong className="text-emerald-600 font-bold">{answeredCount}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Flagged</span>
                <strong className="text-purple-600 font-bold">{flaggedCount}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Unanswered</span>
                <strong className="text-rose-600 font-bold">{questions.length - answeredCount}</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Back to Test
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Submit Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
