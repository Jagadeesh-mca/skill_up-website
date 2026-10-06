"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react";

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const errorReason = searchParams.get("reason") || searchParams.get("error") || "Institutional domain verification failed.";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Access Denied
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Hindustan University Security Verification Failed
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl border border-rose-100 sm:px-10 space-y-6">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">Verification Failure</h3>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">{errorReason}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Please verify the following institutional criteria:</p>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span><strong>Students:</strong> Must use your official university Google account ending with <code className="bg-white px-1 py-0.5 rounded border border-slate-300 text-blue-700">@student.hindustanuniv.ac.in</code>.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span><strong>Student ID:</strong> The email local username must contain <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-bold text-blue-700">sp</code> or <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-bold text-blue-700">su</code>.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span><strong>Faculty & Staff:</strong> Must log in using your staff email ending with <code className="bg-white px-1 py-0.5 rounded border border-slate-300 text-purple-700">@hindustanuniv.ac.in</code>.</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AccessDeniedContent />
    </Suspense>
  );
}
