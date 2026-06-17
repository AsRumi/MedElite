"use client";

import { useState } from "react";
import type { FacilityData, ManualInputs } from "@/lib/types";

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

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8" }}>
      {/* Top nav bar */}
      <header style={{ background: "#0a3d62" }} className="px-8 py-4 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#7fb3d3" }}
            >
              INFINITE -- Managed by MEDELITE
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

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* CCN lookup card */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-slate-100"
            style={{ background: "#e8f4fd" }}
          >
            <h2
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "#0a3d62" }}
            >
              Facility Lookup
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter a 6-character CMS Certification Number to load facility
              data.
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
                className="flex-1 rounded-lg px-4 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:border-transparent placeholder-slate-400"
                style={{ "--tw-ring-color": "#41b3a3" } as React.CSSProperties}
              />
              <button
                type="submit"
                disabled={loading || !ccnInput.trim()}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: loading ? "#7fb3d3" : "#0a3d62" }}
              >
                {loading ? "Loading…" : "Fetch Facility"}
              </button>
            </form>
            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <span className="text-red-500 text-base leading-none mt-0.5">
                  ⚠
                </span>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>
        </section>

        {facility && (
          <>
            {/* Manual inputs card */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div
                className="px-6 py-4 border-b border-slate-100"
                style={{ background: "#e8f4fd" }}
              >
                <h2
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "#0a3d62" }}
                >
                  Operational Details
                </h2>
              </div>
              <div className="px-6 py-5 space-y-5">
                <Field
                  label="Facility Name"
                  hint="Leave blank to use the official CMS name"
                >
                  <input
                    type="text"
                    value={manual.nameOverride}
                    onChange={(e) =>
                      setManualField("nameOverride", e.target.value)
                    }
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

                <div className="grid grid-cols-2 gap-4">
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
                      onChange={(e) =>
                        setManualField("currentCensus", e.target.value)
                      }
                      placeholder="e.g. 142"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Type of Patient">
                    <input
                      type="text"
                      value={manual.typeOfPatient}
                      onChange={(e) =>
                        setManualField("typeOfPatient", e.target.value)
                      }
                      placeholder="e.g. SNF"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Previous Coverage from Medelite">
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

                <Field label="Previous Provider Performance from Medelite">
                  <input
                    type="text"
                    value={manual.previousProviderPerformance}
                    onChange={(e) =>
                      setManualField(
                        "previousProviderPerformance",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. Good standing"
                    className={inputCls}
                  />
                </Field>

                <Field label="Medical Coverage">
                  <input
                    type="text"
                    value={manual.medicalCoverage}
                    onChange={(e) =>
                      setManualField("medicalCoverage", e.target.value)
                    }
                    placeholder="e.g. Medicare A"
                    className={inputCls}
                  />
                </Field>
              </div>
            </section>

            {/* CMS data summary card */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div
                className="px-6 py-4 border-b border-slate-100"
                style={{ background: "#e8f4fd" }}
              >
                <h2
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "#0a3d62" }}
                >
                  {displayName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Live CMS Data.</p>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <DataRow label="Location" value={facility.location} />
                  <DataRow label="State" value={facility.state} />
                  <DataRow
                    label="Certified Beds"
                    value={facility.certifiedBeds ?? "N/A"}
                  />
                  <DataRow label="CCN" value={facility.ccn} />
                </div>

                <div className="mt-5 grid grid-cols-4 gap-3">
                  <RatingBadge label="Overall" value={facility.overallRating} />
                  <RatingBadge
                    label="Health Inspection"
                    value={facility.healthInspectionRating}
                  />
                  <RatingBadge
                    label="Staffing"
                    value={facility.staffingRating}
                  />
                  <RatingBadge
                    label="Quality of Care"
                    value={facility.qmRating}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg px-4 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder-slate-400";

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

function DataRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800 mt-0.5">{value}</span>
    </div>
  );
}

function RatingBadge({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  const score = value ?? 0;
  const bg =
    score >= 4
      ? "#d1fae5"
      : score === 3
        ? "#fef9c3"
        : score >= 1
          ? "#fee2e2"
          : "#f1f5f9";
  const text =
    score >= 4
      ? "#065f46"
      : score === 3
        ? "#854d0e"
        : score >= 1
          ? "#991b1b"
          : "#64748b";

  return (
    <div
      className="rounded-lg px-3 py-3 text-center border"
      style={{ background: bg, borderColor: text + "33" }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide mb-1"
        style={{ color: text }}
      >
        {label}
      </p>
      <p className="text-2xl font-extrabold" style={{ color: text }}>
        {value ?? "—"}
      </p>
      <p className="text-xs mt-0.5" style={{ color: text }}>
        / 5 stars
      </p>
    </div>
  );
}
