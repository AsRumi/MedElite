"use client";

import { useState } from "react";
import type { FacilityData, ManualInputs, ReportModel } from "@/lib/types";
import SnapshotPreview from "@/components/SnapshotPreview";
import { pdf } from "@react-pdf/renderer";
import FacilityPdf from "@/components/FacilityPdf";

const EMPTY_MANUAL: ManualInputs = {
  nameOverride: "",
  emr: "",
  currentCensus: "",
  typeOfPatient: "",
  previousCoverage: "",
  previousProviderPerformance: "",
  medicalCoverage: "",
};

export default function Home() {
  const [ccnInput, setCcnInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facility, setFacility] = useState<FacilityData | null>(null);
  const [manual, setManual] = useState<ManualInputs>(EMPTY_MANUAL);

  const displayName =
    manual.nameOverride.trim() || facility?.providerName || "";

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    const ccn = ccnInput.trim();
    if (!ccn) return;

    setLoading(true);
    setError(null);
    setFacility(null);
    setManual(EMPTY_MANUAL);

    try {
      const res = await fetch(`/api/facility?ccn=${encodeURIComponent(ccn)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "An unexpected error occurred.");
      } else {
        setFacility(json.data);
      }
    } catch {
      setError("Network error: could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  function setManualField<K extends keyof ManualInputs>(
    key: K,
    value: ManualInputs[K],
  ) {
    setManual((prev) => ({ ...prev, [key]: value }));
  }

  const [pdfLoading, setPdfLoading] = useState(false);

  const report: ReportModel | null = facility
    ? { facility, manual, displayName }
    : null;

  async function handleDownloadPdf() {
    if (!report) return;
    setPdfLoading(true);
    setError(null);
    try {
      const blob = await pdf(<FacilityPdf report={report} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.displayName || report.facility.ccn} — Facility Assessment.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("PDF generation failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8" }}>
      {/* Full-width header */}
      <header style={{ background: "#0a3d62" }} className="px-8 py-4 shadow-md">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#7fb3d3" }}
            >
              INFINITE &mdash; Managed by MEDELITE
            </p>
            <h1 className="text-lg font-bold tracking-wider uppercase text-white mt-0.5">
              Facility Assessment Snapshot
            </h1>
          </div>
          {facility?.state && (
            <span
              className="text-3xl font-extrabold tracking-widest"
              style={{ color: "#41b3a3" }}
            >
              {facility.state}
            </span>
          )}
        </div>
      </header>

      {/* Side-by-side layout on lg+, stacked below */}
      <div className="max-w-screen-xl mx-auto px-4 py-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start space-y-6 lg:space-y-0">

        {/* LEFT — form column */}
        <div className="space-y-5">
          {/* CCN lookup card */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div
              className="px-5 py-3 border-b border-slate-100"
              style={{ background: "#e8f4fd" }}
            >
              <h2
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: "#0a3d62" }}
              >
                Facility Lookup
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter a 6-character CMS Certification Number.
              </p>
            </div>
            <div className="px-5 py-4">
              <form onSubmit={handleFetch} className="flex gap-3">
                <input
                  type="text"
                  value={ccnInput}
                  onChange={(e) => setCcnInput(e.target.value)}
                  placeholder="e.g. 686123"
                  maxLength={6}
                  className={inputCls}
                />
                <button
                  type="submit"
                  disabled={loading || !ccnInput.trim()}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  style={{ background: loading ? "#7fb3d3" : "#0a3d62" }}
                >
                  {loading ? "Loading…" : "Fetch"}
                </button>
              </form>
              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <span className="text-red-500 text-base leading-none mt-0.5">⚠</span>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}
            </div>
          </section>

          {/* Operational details — only shown after a successful fetch */}
          {facility && (
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div
                className="px-5 py-3 border-b border-slate-100"
                style={{ background: "#e8f4fd" }}
              >
                <h2
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "#0a3d62" }}
                >
                  Operational Details
                </h2>
              </div>
              <div className="px-5 py-4 space-y-4">
                <Field
                  label="Facility Name Override"
                  hint="Leave blank to use the official CMS name"
                >
                  <input
                    type="text"
                    value={manual.nameOverride}
                    onChange={(e) => setManualField("nameOverride", e.target.value)}
                    placeholder={facility.providerName}
                    className={inputCls}
                  />
                  {manual.nameOverride.trim() && (
                    <p className="text-xs mt-1" style={{ color: "#0a3d62" }}>
                      Report will show:{" "}
                      <span className="font-semibold">{displayName}</span>
                    </p>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="EMR System">
                    <input
                      type="text"
                      value={manual.emr}
                      onChange={(e) => setManualField("emr", e.target.value)}
                      placeholder="e.g. PCC"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Current Census">
                    <input
                      type="number"
                      min={0}
                      value={manual.currentCensus}
                      onChange={(e) => setManualField("currentCensus", e.target.value)}
                      placeholder="e.g. 142"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Type of Patient">
                    <input
                      type="text"
                      value={manual.typeOfPatient}
                      onChange={(e) => setManualField("typeOfPatient", e.target.value)}
                      placeholder="e.g. SNF"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Prev. Coverage">
                    <select
                      value={manual.previousCoverage}
                      onChange={(e) =>
                        setManualField(
                          "previousCoverage",
                          e.target.value as ManualInputs["previousCoverage"],
                        )
                      }
                      className={inputCls}
                    >
                      <option value="">Select…</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </Field>
                </div>

                <Field label="Previous Provider Performance">
                  <input
                    type="text"
                    value={manual.previousProviderPerformance}
                    onChange={(e) =>
                      setManualField("previousProviderPerformance", e.target.value)
                    }
                    placeholder="e.g. Good standing"
                    className={inputCls}
                  />
                </Field>

                <Field label="Medical Coverage">
                  <input
                    type="text"
                    value={manual.medicalCoverage}
                    onChange={(e) => setManualField("medicalCoverage", e.target.value)}
                    placeholder="e.g. Medicare A"
                    className={inputCls}
                  />
                </Field>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT — sticky snapshot preview */}
        <div className="lg:sticky lg:top-6 space-y-3">
          {report && (
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white tracking-wide transition-opacity disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              style={{ background: pdfLoading ? "#7fb3d3" : "#41b3a3" }}
            >
              {pdfLoading ? "Generating PDF…" : "⬇ Download PDF"}
            </button>
          )}
          {report ? (
            <SnapshotPreview report={report} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-dashed border-slate-300 flex flex-col items-center justify-center py-20 text-center px-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: "#e8f4fd" }}
              >
                <span className="text-2xl">🏥</span>
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: "#0a3d62" }}
              >
                Preview will appear here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Enter a CCN on the left to load a facility
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg px-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder-slate-400";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
        {label}
      </label>
      {hint && <p className="text-xs text-slate-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}
