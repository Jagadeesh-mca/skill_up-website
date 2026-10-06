"use client";

import React, { useState, useEffect } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Building2, BookOpen, Layers, Plus, Check, RefreshCw } from "lucide-react";

export default function AdminMasterDataPage() {
  const [activeTab, setActiveTab] = useState<"COMPANIES" | "SUBJECTS" | "TOPICS">("COMPANIES");
  const [companies, setCompanies] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Entity Form State
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/master-data");
      const d = await res.json();
      if (d.success) {
        setCompanies(d.companies);
        setSubjects(d.subjects);
        setTopics(d.topics);
        if (d.subjects.length > 0) setSelectedSubjectId(d.subjects[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let type = "COMPANY";
    let data: any = { name: nameInput, description: descInput };

    if (activeTab === "SUBJECTS") {
      type = "SUBJECT";
      data = { name: nameInput, code: codeInput };
    } else if (activeTab === "TOPICS") {
      type = "TOPIC";
      data = { name: nameInput, subjectId: selectedSubjectId };
    }

    try {
      const res = await fetch("/api/master-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      const resData = await res.json();
      if (resData.success) {
        setNameInput("");
        setDescInput("");
        setCodeInput("");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="ADMIN" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic & Corporate Master Data</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure partner placement companies, curricular subjects, and hierarchical topic structures.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("COMPANIES")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "COMPANIES"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Placement Companies ({companies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("SUBJECTS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "SUBJECTS"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Subjects ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("TOPICS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "TOPICS"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Topics & Subtopics ({topics.length})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Add New {activeTab === "COMPANIES" ? "Company" : activeTab === "SUBJECTS" ? "Subject" : "Topic"}</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={`e.g. ${activeTab === "COMPANIES" ? "Deloitte" : activeTab === "SUBJECTS" ? "Verbal Ability" : "Permutations"}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              {activeTab === "COMPANIES" && (
                <div>
                  <label className="block mb-1">Description / Pattern</label>
                  <input
                    type="text"
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder="e.g. Campus Recruitment Assessment"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  />
                </div>
              )}

              {activeTab === "SUBJECTS" && (
                <div>
                  <label className="block mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="e.g. CS, QA, LR"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  />
                </div>
              )}

              {activeTab === "TOPICS" && (
                <div>
                  <label className="block mb-1">Parent Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Save Record</span>
              </button>
            </form>
          </div>

          {/* List Display */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Configured Master Records</h3>

            {loading ? (
              <p className="text-xs text-slate-400">Loading master data...</p>
            ) : activeTab === "COMPANIES" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {companies.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs">{c.name}</h4>
                    <p className="text-[11px] text-slate-500">{c.description || "Campus assessment profile"}</p>
                  </div>
                ))}
              </div>
            ) : activeTab === "SUBJECTS" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjects.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{s.name}</h4>
                      <p className="text-[11px] text-slate-500">Code: {s.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topics.map((t) => {
                  const parent = subjects.find((s) => s.id === t.subjectId);
                  return (
                    <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-0.5">
                      <h4 className="font-bold text-slate-900 text-xs">{t.name}</h4>
                      <p className="text-[11px] text-blue-600 font-semibold">{parent?.name || "General Subject"}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
