"use client";

import { useState } from "react";
import type { ReportModel } from "@/lib/types";
import BrandingHeader from "./BrandingHeader";

interface Props {
  report: ReportModel;
  claimsLoading?: boolean;
}

export default function SnapshotPreview({ report, claimsLoading }: Props) {
  const { facility, manual, displayName } = report;
  const careCompareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${facility.ccn}`;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(139,63,200,0.08), 0 8px 30px rgba(139,63,200,0.1)",
        border: "1px solid rgba(139,63,200,0.12)",
      }}
    >
      <BrandingHeader state={facility.state} />

      <div className="px-8 py-6 space-y-3">
        <Accordion title="Facility Information">
          <Row label="Name of Facility" value={displayName} />
          <Row label="Location" value={facility.location} />
          <Row label="EMR" value={manual.emr} />
          <Row
            label="Census Capacity"
            value={facility.certifiedBeds != null ? String(facility.certifiedBeds) : undefined}
          />
          <Row label="Current Census" value={manual.currentCensus} />
          <Row label="Type of Patient" value={manual.typeOfPatient} />
        </Accordion>

        <Accordion title="Medelite History">
          <Row
            label="Previous Coverage from Medelite"
            value={manual.previousCoverage || undefined}
          />
          <Row
            label="Previous Provider Performance from Medelite"
            value={manual.previousProviderPerformance}
          />
          <Row label="Medical Coverage" value={manual.medicalCoverage} />
        </Accordion>

        <Accordion title="CMS Star Ratings">
          <RatingRow label="Overall Rating" value={facility.overallRating} />
          <RatingRow label="Health Inspection" value={facility.healthInspectionRating} />
          <RatingRow label="Staffing" value={facility.staffingRating} />
          <RatingRow label="Quality of Resident Care" value={facility.qmRating} />
        </Accordion>

        {(claimsLoading || facility.claims) && (
          <Accordion title="Hospitalization &amp; ED Metrics">
            {claimsLoading ? (
              <div className="flex items-center gap-3 py-6">
                <svg
                  className="animate-spin h-5 w-5 flex-shrink-0"
                  style={{ color: "#8b3fc8" }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm font-medium" style={{ color: "#8b3fc8" }}>
                  Loading metrics…
                </span>
              </div>
            ) : facility.claims ? (
              <>
                <MetricRow label="Short Term Hospitalization" value={facility.claims.strHospitalization} pct />
                <MetricRow label="STR National Avg. for Hospitalization" value={facility.claims.strHospitalizationNational} pct />
                <MetricRow label="STR State Avg. for Hospitalization" value={facility.claims.strHospitalizationState} pct />
                <MetricRow label="STR ED Visit" value={facility.claims.strEdVisit} pct />
                <MetricRow label="STR ED Visits National Avg." value={facility.claims.strEdVisitNational} pct />
                <MetricRow label="STR ED Visits State Avg." value={facility.claims.strEdVisitState} pct />
                <MetricRow label="LT Hospitalization" value={facility.claims.ltHospitalization} />
                <MetricRow label="LT National Avg. for Hospitalization" value={facility.claims.ltHospitalizationNational} />
                <MetricRow label="LT State Avg. for Hospitalization" value={facility.claims.ltHospitalizationState} />
                <MetricRow label="ED Visit" value={facility.claims.ltEdVisit} />
                <MetricRow label="LT ED Visits National Avg." value={facility.claims.ltEdVisitNational} />
                <MetricRow label="LT ED Visits State Avg." value={facility.claims.ltEdVisitState} />
              </>
            ) : null}
          </Accordion>
        )}

        {/* Medicare source link */}
        <div className="pt-4 mt-1" style={{ borderTop: "1px solid #f3f0ff" }}>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1.5"
            style={{ color: "#8b3fc8" }}
          >
            Medicare Source
          </p>
          <a
            href={careCompareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium break-all transition-colors hover:underline"
            style={{ color: "#e91e8c" }}
          >
            {careCompareUrl}
          </a>
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(139,63,200,0.1)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
        style={{
          background: "linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)",
        }}
      >
        <p
          className="text-xs font-black uppercase tracking-widest"
          style={{ color: "#7c3aed" }}
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8b3fc8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="px-4">
          {children}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div
      className="flex items-baseline py-3 gap-4"
      style={{ borderBottom: "1px solid #f8f5ff" }}
    >
      <span
        className="w-64 flex-shrink-0 text-xs font-bold uppercase tracking-wide"
        style={{ color: "#9ca3af" }}
      >
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color: "#1a1a2e" }}>
        {value?.trim() || (
          <span className="font-normal" style={{ color: "#d1d5db" }}>
            —
          </span>
        )}
      </span>
    </div>
  );
}

function MetricRow({ label, value, pct }: { label: string; value: number | null; pct?: boolean }) {
  return (
    <div
      className="flex items-baseline py-3 gap-4"
      style={{ borderBottom: "1px solid #f8f5ff" }}
    >
      <span
        className="w-64 flex-shrink-0 text-xs font-bold uppercase tracking-wide"
        style={{ color: "#9ca3af" }}
      >
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color: "#1a1a2e" }}>
        {value != null ? `${value}${pct ? "%" : ""}` : (
          <span className="font-normal italic" style={{ color: "#d1d5db" }}>N/A</span>
        )}
      </span>
    </div>
  );
}

function RatingRow({ label, value }: { label: string; value: number | null }) {
  const score = value ?? 0;

  const pill =
    score >= 4
      ? { bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)", color: "#065f46", border: "#6ee7b7" }
      : score === 3
      ? { bg: "linear-gradient(135deg, #fef9c3, #fde68a)", color: "#854d0e", border: "#fcd34d" }
      : score >= 1
      ? { bg: "linear-gradient(135deg, #ffe4e6, #fecdd3)", color: "#9f1239", border: "#fda4af" }
      : { bg: "#f3f4f6", color: "#9ca3af", border: "#e5e7eb" };

  return (
    <div
      className="flex items-center py-3 gap-4"
      style={{ borderBottom: "1px solid #f8f5ff" }}
    >
      <span
        className="w-64 flex-shrink-0 text-xs font-bold uppercase tracking-wide"
        style={{ color: "#9ca3af" }}
      >
        {label}
      </span>
      {value != null ? (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black"
          style={{
            background: pill.bg,
            color: pill.color,
            border: `1px solid ${pill.border}`,
          }}
        >
          {"★".repeat(value)}
          {"☆".repeat(5 - value)}
          <span className="ml-1 font-black">{value}/5</span>
        </span>
      ) : (
        <span className="text-sm font-normal italic" style={{ color: "#d1d5db" }}>
          N/A
        </span>
      )}
    </div>
  );
}
