import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ReportModel } from "@/lib/types";

// Register a clean sans-serif font via built-in Helvetica
Font.registerHyphenationCallback((word) => [word]);

const C = {
  navy: "#0a3d62",
  navyLight: "#1a5276",
  teal: "#41b3a3",
  tealLight: "#a8d8d3",
  lightBlue: "#e8f4fd",
  pageBg: "#f7fafc",
  white: "#ffffff",
  slate500: "#64748b",
  slate700: "#334155",
  slate800: "#1e293b",
  green: "#065f46",
  greenBg: "#d1fae5",
  amber: "#854d0e",
  amberBg: "#fef9c3",
  red: "#991b1b",
  redBg: "#fee2e2",
  grayBg: "#f1f5f9",
  grayText: "#94a3b8",
  border: "#e2e8f0",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: "Helvetica",
    paddingBottom: 40,
  },
  // ── Branding header ──
  header: {
    backgroundColor: C.navy,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 18,
  },
  headerSub: {
    fontSize: 7,
    color: "#7fb3d3",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  headerTitle: {
    fontSize: 14,
    color: C.white,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginTop: 3,
  },
  headerState: {
    fontSize: 28,
    color: C.teal,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  // ── Body ──
  body: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  // ── Section header ──
  sectionHeader: {
    backgroundColor: C.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 12,
    marginBottom: 2,
    borderRadius: 4,
  },
  sectionHeaderText: {
    fontSize: 7,
    color: C.navy,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  // ── Row ──
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 6,
    gap: 12,
  },
  rowLabel: {
    width: 160,
    fontSize: 7.5,
    color: C.slate500,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flexShrink: 0,
    paddingTop: 1,
  },
  rowValue: {
    flex: 1,
    fontSize: 9,
    color: C.slate800,
    fontFamily: "Helvetica",
  },
  rowValueEmpty: {
    flex: 1,
    fontSize: 9,
    color: C.grayText,
    fontFamily: "Helvetica-Oblique",
  },
  // ── Rating pill ──
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    gap: 4,
  },
  ratingStars: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  ratingScore: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  // ── Footer link ──
  linkSection: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  linkLabel: {
    fontSize: 7,
    color: C.slate500,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  link: {
    fontSize: 8,
    color: C.navy,
    textDecoration: "underline",
  },
  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: C.grayText,
    fontFamily: "Helvetica",
  },
});

function ratingColors(value: number | null) {
  const score = value ?? 0;
  if (score >= 4) return { bg: C.greenBg, text: C.green };
  if (score === 3) return { bg: C.amberBg, text: C.amber };
  if (score >= 1) return { bg: C.redBg, text: C.red };
  return { bg: C.grayBg, text: C.grayText };
}

function stars(value: number) {
  return "★".repeat(value) + "☆".repeat(5 - value);
}

function PdfRow({ label, value }: { label: string; value?: string }) {
  const empty = !value?.trim();
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {empty ? (
        <Text style={styles.rowValueEmpty}>—</Text>
      ) : (
        <Text style={styles.rowValue}>{value}</Text>
      )}
    </View>
  );
}

function PdfRatingRow({ label, value }: { label: string; value: number | null }) {
  const { bg, text } = ratingColors(value);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {value != null ? (
        <View style={[styles.ratingPill, { backgroundColor: bg }]}>
          <Text style={[styles.ratingStars, { color: text }]}>{stars(value)}</Text>
          <Text style={[styles.ratingScore, { color: text }]}>{value}/5</Text>
        </View>
      ) : (
        <Text style={styles.rowValueEmpty}>N/A</Text>
      )}
    </View>
  );
}

function SectionHeader({ children }: { children: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{children}</Text>
    </View>
  );
}

interface Props {
  report: ReportModel;
}

export default function FacilityPdf({ report }: Props) {
  const { facility, manual, displayName } = report;
  const careCompareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${facility.ccn}`;

  return (
    <Document
      title={`Facility Assessment — ${displayName}`}
      author="INFINITE — Managed by MEDELITE"
    >
      <Page size="A4" style={styles.page}>
        {/* Branding header */}
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.headerSub}>INFINITE — Managed by MEDELITE</Text>
            <Text style={styles.headerTitle}>Facility Assessment Snapshot</Text>
          </View>
          {facility.state ? (
            <Text style={styles.headerState}>{facility.state}</Text>
          ) : null}
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Facility Information */}
          <SectionHeader>Facility Information</SectionHeader>
          <PdfRow label="Name of Facility" value={displayName} />
          <PdfRow label="Location" value={facility.location} />
          <PdfRow label="EMR" value={manual.emr} />
          <PdfRow
            label="Census Capacity"
            value={facility.certifiedBeds != null ? String(facility.certifiedBeds) : undefined}
          />
          <PdfRow label="Current Census" value={manual.currentCensus} />
          <PdfRow label="Type of Patient" value={manual.typeOfPatient} />

          {/* Medelite History */}
          <SectionHeader>Medelite History</SectionHeader>
          <PdfRow
            label="Previous Coverage"
            value={manual.previousCoverage || undefined}
          />
          <PdfRow
            label="Prev. Provider Performance"
            value={manual.previousProviderPerformance}
          />
          <PdfRow label="Medical Coverage" value={manual.medicalCoverage} />

          {/* CMS Star Ratings */}
          <SectionHeader>CMS Star Ratings</SectionHeader>
          <PdfRatingRow label="Overall Rating" value={facility.overallRating} />
          <PdfRatingRow label="Health Inspection" value={facility.healthInspectionRating} />
          <PdfRatingRow label="Staffing" value={facility.staffingRating} />
          <PdfRatingRow label="Quality of Resident Care" value={facility.qmRating} />

          {/* Medicare source link */}
          <View style={styles.linkSection}>
            <Text style={styles.linkLabel}>Medicare Source</Text>
            <Link src={careCompareUrl} style={styles.link}>
              {careCompareUrl}
            </Link>
          </View>
        </View>

        {/* Page footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>INFINITE — Managed by MEDELITE</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
