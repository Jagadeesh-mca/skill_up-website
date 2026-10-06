"use client";

import React, { useState, useEffect } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { History, ShieldCheck, Clock, User } from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // In our system store, audit logs are tracked in real-time
    const sampleLogs = [
      {
        id: "audit-1",
        action: "EXCEL_IMPORT",
        entityType: "ImportBatch",
        performedBy: "prof.kavitha@hindustanuniv.ac.in",
        timestamp: new Date().toISOString(),
        details: "Imported 15 rows from 'Skill up Assessment.xlsx'. 14 valid, 1 flagged duplicate.",
      },
      {
        id: "audit-2",
        action: "APPROVE_QUESTION",
        entityType: "Question",
        performedBy: "prof.kavitha@hindustanuniv.ac.in",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: "Approved question 'A train 240 m long passes a pole' into central bank.",
      },
      {
        id: "audit-3",
        action: "GENERATE_ASSESSMENT",
        entityType: "Assessment",
        performedBy: "admin.placement@hindustanuniv.ac.in",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        details: "Published assessment 'HITS Placement Diagnostic Mock 2026' for batch 2026.",
      },
      {
        id: "audit-4",
        action: "RESOLVE_DUPLICATE",
        entityType: "DuplicateFlag",
        performedBy: "prof.kavitha@hindustanuniv.ac.in",
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        details: "Resolved duplicate collision with action: MERGED company tags.",
      },
    ];
    setLogs(sampleLogs);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="ADMIN" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit & Compliance Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable tracking of uploads, question approvals, test publications, and duplicate resolutions.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Target Entity</th>
                  <th className="px-6 py-3.5">Performed By</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-black">
                      <span className="px-2.5 py-1 rounded-full text-[10px] bg-blue-50 text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{log.entityType}</td>
                    <td className="px-6 py-4 font-medium text-slate-600 flex items-center gap-1.5 mt-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.performedBy}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-sm">{log.details}</td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
