import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import Link from "next/link";
import { Award, BookOpen, Clock, Target, ArrowRight, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  if (user.role !== "STUDENT") {
    redirect("/access-denied?reason=Only+students+can+access+the+student+portal");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="STUDENT" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Student Account
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.name || "Student"}!
            </h1>
            <p className="text-blue-100 text-sm">
              Hindustan Placement Preparation & Skill Assessment Portal
            </p>
          </div>

          <Link
            href="/student/practice"
            className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-sm font-bold rounded-xl shadow transition flex items-center gap-2"
          >
            <span>Start Practice</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Assessments</p>
              <p className="text-2xl font-black text-slate-800">1 Available</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Accuracy</p>
              <p className="text-2xl font-black text-slate-800">76.4%</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Questions Solved</p>
              <p className="text-2xl font-black text-slate-800">142</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Rank</p>
              <p className="text-2xl font-black text-slate-800">Top 12%</p>
            </div>
          </div>
        </div>

        {/* Available Tests Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Upcoming & Active Assessments</h2>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Live Window
            </span>
          </div>

          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white">TCS NQT MOCK</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 60 Mins
                </span>
                <span className="text-xs text-slate-500">• 50 Questions</span>
              </div>
              <h3 className="text-base font-bold text-slate-800">Hindustan Skill Up Diagnostic Test 2026</h3>
              <p className="text-xs text-slate-600">Covers Quantitative Aptitude, Logical Reasoning, and Programming Basics.</p>
            </div>

            <Link
              href="/student/assessments"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition whitespace-nowrap"
            >
              View Instructions & Start
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
