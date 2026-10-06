import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import Link from "next/link";
import { ShieldAlert, Database, Users, History, Settings, ArrowRight, Activity, Server } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  if (user.role !== "ADMIN") {
    redirect("/access-denied?reason=Only+system+administrators+can+access+the+admin+portal");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="ADMIN" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm text-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Institutional Super Admin Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              System Administration
            </h1>
            <p className="text-slate-300 text-sm">
              Manage master data, university departments, user permissions, and audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Online & Healthy
          </div>
        </div>

        {/* Admin Operational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/master-data"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-md transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center justify-between">
              Master Data <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manage Companies (TCS, Infosys, etc.), Subjects, Topics, Subtopics, Departments, and Student Batches.
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-purple-400 hover:shadow-md transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition flex items-center justify-between">
              User Management <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect student and faculty accounts, assign academic batches, and modify role permissions.
            </p>
          </Link>

          <Link
            href="/admin/audit"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition flex items-center justify-between">
              Audit Logs <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track who approved questions, published assessments, resolved duplicates, or uploaded question papers.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-400 hover:shadow-md transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-slate-800 transition flex items-center justify-between">
              System Settings <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Configure AI providers (Groq/OpenAI), similarity thresholds, and student email policy rules.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
