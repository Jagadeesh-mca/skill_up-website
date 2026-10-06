import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import Link from "next/link";
import { Upload, CheckSquare, Layers, AlertTriangle, FileSpreadsheet, ArrowRight, ShieldCheck, Users } from "lucide-react";

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  if (user.role !== "TEACHER" && user.role !== "ADMIN") {
    redirect("/access-denied?reason=Only+faculty+and+staff+can+access+the+teacher+portal");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="TEACHER" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-purple-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Faculty Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user.name || "Faculty"}!
            </h1>
            <p className="text-purple-100 text-sm">
              Question Bank Management & Placement Assessment Engine
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/teacher/upload"
              className="px-5 py-2.5 bg-white text-purple-700 hover:bg-purple-50 text-sm font-bold rounded-xl shadow transition flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Excel</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
              <p className="text-2xl font-black text-slate-800">24 Items</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duplicate Flags</p>
              <p className="text-2xl font-black text-slate-800">6 Detected</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Central Question Bank</p>
              <p className="text-2xl font-black text-slate-800">1,280 Approved</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Students</p>
              <p className="text-2xl font-black text-slate-800">450 Enrolled</p>
            </div>
          </div>
        </div>

        {/* Quick Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/teacher/upload"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-purple-300 hover:shadow-md transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition flex items-center justify-between">
              Upload Question Paper <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload standard .xlsx/.csv files, preserve raw uploads untouched, inspect row validation errors, and send valid items to review.
            </p>
          </Link>

          <Link
            href="/teacher/review"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center justify-between">
              Review & Approve Queue <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify AI classification suggestions (subject, topic, difficulty), edit question details, and approve into central repository.
            </p>
          </Link>

          <Link
            href="/teacher/assessments"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition flex items-center justify-between">
              Assessment Generator <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Build fixed batch assessments or dynamic practice blueprints with difficulty mix and real-time shortage checking.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
