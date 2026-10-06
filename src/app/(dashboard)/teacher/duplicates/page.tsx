"use client";

import React, { useState, useEffect } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Copy, ArrowRightLeft, CheckCheck, Merge, XCircle, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function TeacherDuplicatesPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/duplicates?resolution=PENDING");
      const data = await res.json();
      if (data.success) {
        setFlags(data.flags);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const handleResolve = async (flagId: string, action: "KEPT_BOTH" | "MERGED" | "REJECTED") => {
    try {
      const res = await fetch("/api/duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagId, action, resolvedBy: "teacher@hindustanuniv.ac.in" }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`Duplicate resolution applied: ${action}`);
        setFlags((prev) => prev.filter((f) => f.id !== flagId));
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="TEACHER" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Duplicate Detection & Resolution</h1>
            <p className="text-sm text-slate-500 mt-1">
              Multi-tier duplicate detector (Exact Hash, Reordered Options, Semantic Vector). Compare side-by-side.
            </p>
          </div>
          <span className="px-3 py-1 bg-rose-100 text-rose-800 font-bold rounded-full text-xs">
            {flags.length} Conflicts Flagged
          </span>
        </div>

        {msg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Scanning question bank for duplicates...</div>
        ) : flags.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Zero Unresolved Duplicates!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All question pairs in the bank are uniquely distinguished.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Banner */}
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Flag Type:</span>
                    <span className="px-2 py-0.5 rounded font-black bg-rose-100 text-rose-800">
                      {flag.type}
                    </span>
                    <span className="text-slate-500">
                      Similarity Match: <strong>{Math.round(flag.similarityScore * 100)}%</strong>
                    </span>
                  </div>
                  <span className="text-slate-400">Flag ID: {flag.id}</span>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Left: Existing Question */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Question A (Existing in Bank)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {flag.questionA?.status || "APPROVED"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {flag.questionA?.text || flag.questionAText}
                    </p>
                    {flag.questionA?.options && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Existing Options:</span>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {flag.questionA.options.map((o: any) => (
                            <div key={o.id} className="p-2 rounded bg-slate-50 text-slate-700 truncate">
                              {o.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Incoming Question */}
                  <div className="space-y-3 md:pl-6 pt-4 md:pt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Question B (Incoming Upload)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        PENDING
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 bg-amber-50/40 p-4 rounded-xl border border-amber-200">
                      {flag.questionB?.text || flag.questionBText}
                    </p>
                    {flag.questionB?.options && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Incoming Options:</span>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {flag.questionB.options.map((o: any) => (
                            <div key={o.id} className="p-2 rounded bg-amber-50/50 text-slate-700 truncate">
                              {o.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resolution Actions Bar */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
                  <p className="text-xs text-slate-500">
                    Never auto-deleted: Choose how to resolve this collision.
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolve(flag.id, "KEPT_BOTH")}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Keep Both</span>
                    </button>

                    <button
                      onClick={() => handleResolve(flag.id, "MERGED")}
                      className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition flex items-center gap-1.5"
                    >
                      <Merge className="w-3.5 h-3.5" />
                      <span>Merge & Link Company</span>
                    </button>

                    <button
                      onClick={() => handleResolve(flag.id, "REJECTED")}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Duplicate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
