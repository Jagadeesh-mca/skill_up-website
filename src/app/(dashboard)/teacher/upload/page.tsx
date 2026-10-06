"use client";

import React, { useState } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, FileText } from "lucide-react";

export default function TeacherUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
      setErrorMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", "prof.kavitha@hindustanuniv.ac.in");

    try {
      const res = await fetch("/api/imports/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadResult(data.batch);
      } else {
        setErrorMsg(data.error || "Upload failed");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Network error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav role="TEACHER" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Question Paper Excel Import</h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload spreadsheets (.xlsx / .csv). Original files are preserved untouched on disk.
            </p>
          </div>

          <a
            href="/api/imports/template"
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download Standard Template</span>
          </a>
        </div>

        {/* Upload Box */}
        <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <div>
            <label className="cursor-pointer font-semibold text-blue-600 hover:text-blue-500 text-sm">
              <span>Select an Excel or CSV file</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-1">Supports XLSX, XLS, and CSV files up to 25MB</p>
          </div>

          {file && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-700 font-medium">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 max-w-md mx-auto flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm transition inline-flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating & Deduplicating...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Start Validation & Import</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Processing Results & Row-Level Error Inspector */}
        {uploadResult && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold">Total Rows Processed</p>
                <p className="text-2xl font-black text-slate-800">{uploadResult.totalRows}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
                <p className="text-xs text-emerald-700 uppercase font-bold">Valid & Imported (Pending Review)</p>
                <p className="text-2xl font-black text-emerald-700">{uploadResult.validRowsCount}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
                <p className="text-xs text-rose-700 uppercase font-bold">Invalid Rows with Errors</p>
                <p className="text-2xl font-black text-rose-700">{uploadResult.invalidRowsCount}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
                <p className="text-xs text-amber-700 uppercase font-bold">Duplicates Detected</p>
                <p className="text-2xl font-black text-amber-700">{uploadResult.duplicatesCount}</p>
              </div>
            </div>

            {/* Row Inspection Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Row Validation Audit Breakdown</h3>
                <span className="text-xs text-slate-500">Partial Import Enabled: Valid rows safely imported</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Row #</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Question Statement</th>
                      <th className="px-6 py-3">Validation Errors / Flags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {uploadResult.parsedRows.map((r: any) => (
                      <tr key={r.rowNumber} className={r.isValid ? "hover:bg-slate-50/60" : "bg-rose-50/40"}>
                        <td className="px-6 py-3 font-bold text-slate-700">Row {r.rowNumber}</td>
                        <td className="px-6 py-3">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-100/70 px-2 py-0.5 rounded-full text-[11px]">
                              <AlertTriangle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 font-medium text-slate-800 max-w-xs truncate">
                          {r.questionData?.text || "—"}
                        </td>
                        <td className="px-6 py-3">
                          {r.errors.length > 0 ? (
                            <span className="text-rose-700 font-semibold">{r.errors.join("; ")}</span>
                          ) : r.duplicateFlag ? (
                            <span className="text-amber-700 font-semibold">
                              Flagged as {r.duplicateFlag.type} duplicate ({Math.round(r.duplicateFlag.similarityScore * 100)}% match)
                            </span>
                          ) : (
                            <span className="text-slate-400">No issues found</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
