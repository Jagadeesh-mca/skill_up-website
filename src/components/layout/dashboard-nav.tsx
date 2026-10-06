"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { GraduationCap, LogOut, User, ShieldAlert, BookOpen, Layers, CheckSquare, BarChart3, Settings } from "lucide-react";

export function DashboardNav({ role }: { role: "STUDENT" | "TEACHER" | "ADMIN" }) {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <Link href="/" className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <span>Skill Up</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                {role}
              </span>
            </Link>
            <p className="text-[11px] text-slate-500 hidden sm:block">Hindustan Institute of Technology & Science</p>
          </div>
        </div>

        {/* Navigation Links according to Role */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          {role === "STUDENT" && (
            <>
              <Link href="/student" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Dashboard
              </Link>
              <Link href="/student/assessments" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Assessments
              </Link>
              <Link href="/student/practice" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Practice
              </Link>
              <Link href="/student/performance" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Performance
              </Link>
            </>
          )}

          {role === "TEACHER" && (
            <>
              <Link href="/teacher" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Dashboard
              </Link>
              <Link href="/teacher/upload" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Upload
              </Link>
              <Link href="/teacher/review" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Review Queue
              </Link>
              <Link href="/teacher/duplicates" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Duplicates
              </Link>
              <Link href="/teacher/questions" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Question Bank
              </Link>
              <Link href="/teacher/assessments" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Assessments
              </Link>
            </>
          )}

          {role === "ADMIN" && (
            <>
              <Link href="/admin" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Overview
              </Link>
              <Link href="/admin/master-data" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Master Data
              </Link>
              <Link href="/admin/users" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Users
              </Link>
              <Link href="/admin/audit" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Audit Logs
              </Link>
              <Link href="/admin/settings" className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition">
                Settings
              </Link>
            </>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800">{session?.user?.name || "User"}</span>
            <span className="text-[11px] text-slate-500">{session?.user?.email || ""}</span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
