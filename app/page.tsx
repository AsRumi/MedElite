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
    <div className="min-h-screen" style={{ background: "#f8f7fc" }}>
      {/* Full-width header */}
      <header
        className="px-8 py-5 shadow-lg"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 60%, #3d1f6b 100%)",
          borderBottom: "3px solid #e91e8c",
        }}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-1 h-12 rounded-full"
              style={{ background: "linear-gradient(180deg, #e91e8c 0%, #8b3fc8 100%)" }}
            />
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "#c084fc", fontFamily: "var(--font-inter)" }}
              >
                INFINITE &mdash; Managed by MEDELITE
              </p>
              <h1
                className="text-xl font-bold tracking-wider uppercase text-white mt-0.5"
                style={{ fontFamily: "var(--font-jakarta)" }}
              >
                Facility Assessment Snapshot
              </h1>
            </div>
          </div>
          {facility?.state && (
            <div className="flex flex-col items-center">
              <span
                className="text-4xl font-black tracking-widest"
                style={{
                  background: "linear-gradient(135deg, #e91e8c 0%, #8b3fc8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontFamily: "var(--font-jakarta)",
                }}
              >
                {facility.state}
              </span>
              <span className="text-xs text-purple-300 tracking-widest uppercase font-medium mt-0.5">
                State
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Side-by-side layout on lg+, stacked below */}
      <div className="max-w-screen-xl mx-auto px-4 py-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start space-y-6 lg:space-y-0">

        {/* LEFT — form column */}
        <div className="space-y-5">
          {/* CCN lookup card */}
          <section
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#ffffff",
              boxShadow: "0 1px 3px rgba(139,63,200,0.08), 0 4px 20px rgba(139,63,200,0.06)",
              border: "1px solid rgba(139,63,200,0.12)",
            }}
          >
            <div
              className="px-6 py-4 border-b"
              style={{
                background: "linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)",
                borderColor: "rgba(139,63,200,0.1)",
              }}
            >
              <h2
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#7c3aed", fontFamily: "var(--font-jakarta)" }}
              >
                Facility Lookup
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                Enter a 6-character CMS Certification Number.
              </p>
            </div>
            <div className="px-6 py-5">
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
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  style={{
                    background: loading
                      ? "#c084fc"
                      : "linear-gradient(135deg, #e91e8c 0%, #8b3fc8 100%)",
                    boxShadow: loading ? "none" : "0 4px 14px rgba(233,30,140,0.35)",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {loading ? "Loading…" : "Fetch"}
                </button>
              </form>
              {error && (
                <div
                  className="mt-4 flex items-start gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: "#fff1f2",
                    border: "1px solid #fecdd3",
                  }}
                >
                  <span className="text-base leading-none mt-0.5" style={{ color: "#e11d48" }}>⚠</span>
                  <p className="text-sm font-medium" style={{ color: "#9f1239" }}>{error}</p>
                </div>
              )}
            </div>
          </section>

          {/* Operational details — only shown after a successful fetch */}
          {facility && (
            <section
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#ffffff",
                boxShadow: "0 1px 3px rgba(139,63,200,0.08), 0 4px 20px rgba(139,63,200,0.06)",
                border: "1px solid rgba(139,63,200,0.12)",
              }}
            >
              <div
                className="px-6 py-4 border-b"
                style={{
                  background: "linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)",
                  borderColor: "rgba(139,63,200,0.1)",
                }}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#7c3aed", fontFamily: "var(--font-jakarta)" }}
                >
                  Operational Details
                </h2>
              </div>
              <div className="px-6 py-5 space-y-4">
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
                    <p className="text-xs mt-1.5 font-medium" style={{ color: "#8b3fc8" }}>
                      Report will show:{" "}
                      <span className="font-bold">{displayName}</span>
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
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: pdfLoading
                  ? "#c084fc"
                  : "linear-gradient(135deg, #e91e8c 0%, #8b3fc8 100%)",
                boxShadow: pdfLoading ? "none" : "0 6px 20px rgba(233,30,140,0.4)",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              {pdfLoading ? "Generating PDF…" : "⬇ Download PDF"}
            </button>
          )}
          {report ? (
            <SnapshotPreview report={report} />
          ) : (
            <div
              className="rounded-2xl flex flex-col items-center justify-center py-24 text-center px-8"
              style={{
                background: "#ffffff",
                border: "1.5px dashed rgba(139,63,200,0.2)",
                boxShadow: "0 1px 3px rgba(139,63,200,0.06)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: "linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)",
                  border: "1px solid rgba(139,63,200,0.15)",
                }}
              >
                <span className="text-2xl">🏥</span>
              </div>
              <p
                className="text-sm font-bold"
                style={{ color: "#1a1a2e", fontFamily: "var(--font-jakarta)" }}
              >
                Preview will appear here
              </p>
              <p className="text-xs mt-1.5" style={{ color: "#9ca3af" }}>
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
  "w-full rounded-xl px-4 py-2.5 text-sm font-medium bg-white border transition-all outline-none placeholder-gray-300"
  + " focus:ring-2"
  + " text-gray-800"
  + " border-gray-200 focus:border-purple-400 focus:ring-purple-100";

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
      <label
        className="block text-xs font-bold mb-1.5 uppercase tracking-widest"
        style={{ color: "#7c3aed", fontFamily: "var(--font-jakarta)" }}
      >
        {label}
      </label>
      {hint && <p className="text-xs mb-1.5" style={{ color: "#9ca3af" }}>{hint}</p>}
      {children}
    </div>
  );
}
