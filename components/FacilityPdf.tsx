import {
  Document,
  Page,
  Text,
  View,
  Link,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ReportModel } from "@/lib/types";

Font.registerHyphenationCallback((word) => [word]);

const C = {
  // Brand palette (matching the web UI)
  darkBg: "#1a1a2e",
  deepPurple: "#2d1b4e",
  pink: "#e91e8c",
  purple: "#8b3fc8",
  purpleLight: "#c084fc",
  purpleFaint: "#faf5ff",
  pinkFaint: "#fdf2f8",
  sectionBg: "#f5f0ff",
  sectionBorder: "#e9d5ff",
  // Text
  white: "#ffffff",
  bodyText: "#1a1a2e",
  labelText: "#9ca3af",
  emptyText: "#d1d5db",
  linkColor: "#e91e8c",
  footerText: "#9ca3af",
  // Row borders
  rowBorder: "#f3f0ff",
  linkBorder: "#ede9fe",
  // Rating pill colours
  greenBg: "#d1fae5",
  greenText: "#065f46",
  greenBorder: "#6ee7b7",
  amberBg: "#fef9c3",
  amberText: "#854d0e",
  amberBorder: "#fcd34d",
  redBg: "#ffe4e6",
  redText: "#9f1239",
  redBorder: "#fda4af",
  grayBg: "#f3f4f6",
  grayText: "#9ca3af",
  grayBorder: "#e5e7eb",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: "Helvetica",
    paddingBottom: 44,
  },
  // ── Branding header ──
  header: {
    backgroundColor: C.darkBg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderBottomWidth: 2,
    borderBottomColor: C.pink,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAccentBar: {
    width: 3,
    height: 36,
    backgroundColor: C.pink,
    borderRadius: 2,
  },
  headerLogo: {
    width: 40,
    height: 40,
    objectFit: "contain",
  },
  headerSub: {
    fontSize: 7,
    color: C.purpleLight,
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
    marginTop: 4,
  },
  headerStateBox: {
    alignItems: "center",
  },
  headerState: {
    fontSize: 28,
    color: C.pink,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  headerStateLabel: {
    fontSize: 6,
    color: C.purpleLight,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 2,
  },
  // ── Body ──
  body: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  // ── Section header ──
  sectionHeader: {
    backgroundColor: C.sectionBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 14,
    marginBottom: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.sectionBorder,
  },
  sectionHeaderText: {
    fontSize: 7,
    color: C.purple,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  // ── Row ──
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: C.rowBorder,
    paddingVertical: 6,
    gap: 12,
  },
  rowLabel: {
    width: 160,
    fontSize: 7.5,
    color: C.labelText,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flexShrink: 0,
    paddingTop: 1,
  },
  rowValue: {
    flex: 1,
    fontSize: 9,
    color: C.bodyText,
    fontFamily: "Helvetica-Bold",
  },
  rowValueEmpty: {
    flex: 1,
    fontSize: 9,
    color: C.emptyText,
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
    borderWidth: 1,
  },
  ratingScore: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  // ── Medicare link section ──
  linkSection: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.linkBorder,
  },
  linkLabel: {
    fontSize: 7,
    color: C.purple,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  link: {
    fontSize: 8,
    color: C.linkColor,
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
    borderTopWidth: 1,
    borderTopColor: C.linkBorder,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: C.footerText,
    fontFamily: "Helvetica",
  },
  footerBrand: {
    fontSize: 7,
    color: C.purple,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
});

function ratingColors(value: number | null) {
  const score = value ?? 0;
  if (score >= 4)
    return { bg: C.greenBg, text: C.greenText, border: C.greenBorder };
  if (score === 3)
    return { bg: C.amberBg, text: C.amberText, border: C.amberBorder };
  if (score >= 1) return { bg: C.redBg, text: C.redText, border: C.redBorder };
  return { bg: C.grayBg, text: C.grayText, border: C.grayBorder };
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

function PdfRatingRow({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  const { bg, text, border } = ratingColors(value);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {value != null ? (
        <View
          style={[
            styles.ratingPill,
            { backgroundColor: bg, borderColor: border },
          ]}
        >
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
  logoSrc: string;
}

export default function FacilityPdf({ report, logoSrc }: Props) {
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
          <View style={styles.headerLeft}>
            <Image src={logoSrc} style={styles.headerLogo} />
            <View style={styles.headerAccentBar} />
            <View>
              <Text style={styles.headerSub}>
                INFINITE — Managed by MEDELITE
              </Text>
              <Text style={styles.headerTitle}>
                Facility Assessment Snapshot
              </Text>
            </View>
          </View>
          {facility.state ? (
            <View style={styles.headerStateBox}>
              <Text style={styles.headerState}>{facility.state}</Text>
              <Text style={styles.headerStateLabel}>State</Text>
            </View>
          ) : null}
        </View>

        {/* Body */}
        <View style={styles.body}>
          <SectionHeader>Facility Information</SectionHeader>
          <PdfRow label="Name of Facility" value={displayName} />
          <PdfRow label="Location" value={facility.location} />
          <PdfRow label="EMR" value={manual.emr} />
          <PdfRow
            label="Census Capacity"
            value={
              facility.certifiedBeds != null
                ? String(facility.certifiedBeds)
                : undefined
            }
          />
          <PdfRow label="Current Census" value={manual.currentCensus} />
          <PdfRow label="Type of Patient" value={manual.typeOfPatient} />

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

          <SectionHeader>CMS Star Ratings</SectionHeader>
          <PdfRatingRow label="Overall Rating" value={facility.overallRating} />
          <PdfRatingRow
            label="Health Inspection"
            value={facility.healthInspectionRating}
          />
          <PdfRatingRow label="Staffing" value={facility.staffingRating} />
          <PdfRatingRow
            label="Quality of Resident Care"
            value={facility.qmRating}
          />

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
          <Text style={styles.footerBrand}>INFINITE — Managed by MEDELITE</Text>
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
