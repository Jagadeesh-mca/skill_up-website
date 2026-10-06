"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { validateHindustanEmail } from "@/lib/email-validator";
import { ShieldCheck, AlertCircle, ArrowRight, UserCheck, GraduationCap, Briefcase, Lock } from "lucide-react";

export default function LoginPage() {
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<"STUDENT" | "TEACHER" | "ADMIN">("STUDENT");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ isValid: boolean; message: string } | null>(null);

  const handleValidateEmail = (val: string) => {
    setEmailInput(val);
    if (!val) {
      setFeedback(null);
      return;
    }
    const result = validateHindustanEmail(val);
    if (result.isValid) {
      setFeedback({
        isValid: true,
        message: `Valid email! Inferred role: ${result.role}`,
      });
      if (result.role) setRoleInput(result.role);
    } else {
      setFeedback({
        isValid: false,
        message: result.error || "Invalid institutional format.",
      });
    }
  };

  const handleDevLogin = async (presetEmail?: string, presetRole?: "STUDENT" | "TEACHER" | "ADMIN") => {
    setIsLoading(true);
    const targetEmail = presetEmail || emailInput;
    const targetRole = presetRole || roleInput;

    const validation = validateHindustanEmail(targetEmail);
    if (!validation.isValid) {
      setFeedback({ isValid: false, message: validation.error || "Email validation failed." });
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn("mock-login", {
        email: targetEmail,
        role: targetRole,
        callbackUrl: targetRole === "ADMIN" ? "/admin" : targetRole === "TEACHER" ? "/teacher" : "/student",
      });
    } catch (e: any) {
      setFeedback({ isValid: false, message: e.message || "Login failed" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/30">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
          Hindustan University
        </h2>
        <p className="mt-1 text-sm font-medium text-blue-600">
          Skill Up Placement Assessment Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-100 sm:px-10 space-y-6">
          {/* Institutional SSO Section */}
          <div>
            <button
              onClick={() => signIn("google", { callbackUrl: "/student" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 font-semibold bg-white hover:bg-slate-50 transition shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google Workspace SSO</span>
            </button>
            <p className="mt-2 text-xs text-center text-slate-500">
              Only <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">@student.hindustanuniv.ac.in</code> & <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">@hindustanuniv.ac.in</code> accounts are allowed.
            </p>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Live Validation & Dev Auth
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Email Rule Inspector */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Institutional Email
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => handleValidateEmail(e.target.value)}
                  placeholder="e.g. sp22001@student.hindustanuniv.ac.in"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                />
              </div>

              {/* Real-time Validation Banner */}
              {feedback && (
                <div
                  className={`mt-2 p-3 rounded-lg flex items-start gap-2.5 text-xs ${
                    feedback.isValid
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {feedback.isValid ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="font-medium leading-relaxed">{feedback.message}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => handleDevLogin()}
              disabled={isLoading || !feedback?.isValid}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              <span>{isLoading ? "Signing In..." : "Sign In with Validated Email"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Persona Quick Switcher */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              Quick One-Click Test Accounts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const mail = "sp2024cs101@student.hindustanuniv.ac.in";
                  handleValidateEmail(mail);
                  handleDevLogin(mail, "STUDENT");
                }}
                className="p-2.5 text-left rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-100/70 text-blue-900 transition flex flex-col"
              >
                <span className="font-bold flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Student (sp prefix)
                </span>
                <span className="text-[11px] text-blue-700 truncate mt-0.5">
                  sp2024cs101@student...
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const mail = "su2024it202@student.hindustanuniv.ac.in";
                  handleValidateEmail(mail);
                  handleDevLogin(mail, "STUDENT");
                }}
                className="p-2.5 text-left rounded-lg border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-900 transition flex flex-col"
              >
                <span className="font-bold flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Student (su prefix)
                </span>
                <span className="text-[11px] text-indigo-700 truncate mt-0.5">
                  su2024it202@student...
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const mail = "prof.kavitha@hindustanuniv.ac.in";
                  handleValidateEmail(mail);
                  handleDevLogin(mail, "TEACHER");
                }}
                className="p-2.5 text-left rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 text-purple-900 transition flex flex-col"
              >
                <span className="font-bold flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" /> Faculty / Teacher
                </span>
                <span className="text-[11px] text-purple-700 truncate mt-0.5">
                  prof.kavitha@hindustan...
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const mail = "admin.placement@hindustanuniv.ac.in";
                  handleValidateEmail(mail);
                  handleDevLogin(mail, "ADMIN");
                }}
                className="p-2.5 text-left rounded-lg border border-amber-100 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900 transition flex flex-col"
              >
                <span className="font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" /> Administrator
                </span>
                <span className="text-[11px] text-amber-700 truncate mt-0.5">
                  admin.placement@hindustan...
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Rule Card */}
        <div className="mt-4 p-4 rounded-xl bg-slate-100 text-xs text-slate-600 border border-slate-200">
          <p className="font-semibold text-slate-700 mb-1">Student Security Policy:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Email domain must be <code className="text-blue-700">@student.hindustanuniv.ac.in</code></li>
            <li>Username portion must contain <code className="text-blue-700 font-bold">sp</code> or <code className="text-blue-700 font-bold">su</code> (case-insensitive)</li>
            <li>Faculty and staff use <code className="text-blue-700">@hindustanuniv.ac.in</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
