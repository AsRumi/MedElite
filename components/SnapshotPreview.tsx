import type { ReportModel } from "@/lib/types";
import BrandingHeader from "./BrandingHeader";

interface Props {
  report: ReportModel;
}

export default function SnapshotPreview({ report }: Props) {
  const { facility, manual, displayName } = report;
  const careCompareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${facility.ccn}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Branding header inside the preview */}
      <BrandingHeader state={facility.state} />

      {/* Snapshot body */}
      <div className="px-8 py-6 space-y-0">
        {/* Section: Facility Info */}
        <SectionHeader>Facility Information</SectionHeader>
        <Row label="Name of Facility" value={displayName} />
        <Row label="Location" value={facility.location} />
        <Row label="EMR" value={manual.emr} />
        <Row
          label="Census Capacity"
          value={facility.certifiedBeds != null ? String(facility.certifiedBeds) : undefined}
        />
        <Row label="Current Census" value={manual.currentCensus} />
        <Row label="Type of Patient" value={manual.typeOfPatient} />

        {/* Section: Medelite History */}
        <SectionHeader>Medelite History</SectionHeader>
        <Row
          label="Previous Coverage from Medelite"
          value={manual.previousCoverage || undefined}
        />
        <Row
          label="Previous Provider Performance from Medelite"
          value={manual.previousProviderPerformance}
        />
        <Row label="Medical Coverage" value={manual.medicalCoverage} />

        {/* Section: Star Ratings */}
        <SectionHeader>CMS Star Ratings</SectionHeader>
        <RatingRow label="Overall Rating" value={facility.overallRating} />
        <RatingRow
          label="Health Inspection"
          value={facility.healthInspectionRating}
        />
        <RatingRow label="Staffing" value={facility.staffingRating} />
        <RatingRow
          label="Quality of Resident Care"
          value={facility.qmRating}
        />

        {/* Medicare source link */}
        <div className="pt-5 mt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">
            Medicare Source
          </p>
          <a
            href={careCompareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium break-all"
            style={{ color: "#0a3d62" }}
          >
            {careCompareUrl}
          </a>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-4 py-2 mt-4 first:mt-0 rounded-md"
      style={{ background: "#e8f4fd" }}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "#0a3d62" }}
      >
        {children}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline border-b border-slate-50 py-2.5 gap-4">
      <span className="w-64 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800">
        {value?.trim() || <span className="text-slate-300 italic">—</span>}
      </span>
    </div>
  );
}

function RatingRow({ label, value }: { label: string; value: number | null }) {
  const score = value ?? 0;
  const bg =
    score >= 4 ? "#d1fae5" : score === 3 ? "#fef9c3" : score >= 1 ? "#fee2e2" : "#f1f5f9";
  const color =
    score >= 4 ? "#065f46" : score === 3 ? "#854d0e" : score >= 1 ? "#991b1b" : "#94a3b8";

  return (
    <div className="flex items-center border-b border-slate-50 py-2.5 gap-4">
      <span className="w-64 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {value != null ? (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-bold"
          style={{ background: bg, color }}
        >
          {"★".repeat(value)}
          {"☆".repeat(5 - value)}
          <span className="ml-1 text-xs font-semibold">{value}/5</span>
        </span>
      ) : (
        <span className="text-slate-300 italic text-sm">N/A</span>
      )}
    </div>
  );
}
