import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  ExternalHyperlink,
  ImageRun,
  ShadingType,
  VerticalAlign,
  convertInchesToTwip,
  Header,
} from "docx";
import type { ReportModel } from "@/lib/types";

// Brand colours (hex without #)
const DARK_BG = "1a1a2e";
const PINK = "e91e8c";
const PURPLE = "8b3fc8";
const PURPLE_LIGHT = "c084fc";
const SECTION_BG = "f5f0ff";
const LABEL_GRAY = "9ca3af";
const BODY_TEXT = "1a1a2e";
const WHITE = "ffffff";
const EMPTY_TEXT = "d1d5db";
const GREEN_BG = "d1fae5";
const GREEN_TEXT = "065f46";
const AMBER_BG = "fef9c3";
const AMBER_TEXT = "854d0e";
const RED_BG = "ffe4e6";
const RED_TEXT = "9f1239";
const GRAY_BG = "f3f4f6";
const GRAY_TEXT = "9ca3af";

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: "auto" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
  left: { style: BorderStyle.NONE, size: 0, color: "auto" },
  right: { style: BorderStyle.NONE, size: 0, color: "auto" },
};

const THIN_BOTTOM = {
  top: { style: BorderStyle.NONE, size: 0, color: "auto" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "f3f0ff" },
  left: { style: BorderStyle.NONE, size: 0, color: "auto" },
  right: { style: BorderStyle.NONE, size: 0, color: "auto" },
};

function ratingColors(value: number | null): { bg: string; text: string } {
  const score = value ?? 0;
  if (score >= 4) return { bg: GREEN_BG, text: GREEN_TEXT };
  if (score === 3) return { bg: AMBER_BG, text: AMBER_TEXT };
  if (score >= 1) return { bg: RED_BG, text: RED_TEXT };
  return { bg: GRAY_BG, text: GRAY_TEXT };
}

// ── Section heading row (full-width colored band) ──────────────────────────
function sectionRow(title: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: 2,
        shading: { type: ShadingType.SOLID, color: SECTION_BG },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: "e9d5ff" },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: "e9d5ff" },
          left: { style: BorderStyle.NONE, size: 0, color: "auto" },
          right: { style: BorderStyle.NONE, size: 0, color: "auto" },
        },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: title.toUpperCase(),
                bold: true,
                color: PURPLE,
                size: 16,
                characterSpacing: 40,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ── Standard data row ──────────────────────────────────────────────────────
function dataRow(label: string, value: string | null | undefined): TableRow {
  const empty = !value?.trim();
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        borders: THIN_BOTTOM,
        margins: { top: 80, bottom: 80, left: 120, right: 80 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: label.toUpperCase(),
                bold: true,
                color: LABEL_GRAY,
                size: 16,
                characterSpacing: 20,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        borders: THIN_BOTTOM,
        margins: { top: 80, bottom: 80, left: 80, right: 120 },
        children: [
          new Paragraph({
            children: [
              new TextRun(
                empty
                  ? { text: "—", color: EMPTY_TEXT, size: 18, italics: true }
                  : { text: value!, bold: true, color: BODY_TEXT, size: 18 },
              ),
            ],
          }),
        ],
      }),
    ],
  });
}

// ── Rating row (colored badge text) ───────────────────────────────────────
function ratingRow(label: string, value: number | null): TableRow {
  const { bg, text } = ratingColors(value);
  const stars =
    value != null
      ? "★".repeat(value) + "☆".repeat(5 - value) + `  ${value}/5`
      : null;

  return new TableRow({
    children: [
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        borders: THIN_BOTTOM,
        margins: { top: 80, bottom: 80, left: 120, right: 80 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: label.toUpperCase(),
                bold: true,
                color: LABEL_GRAY,
                size: 16,
                characterSpacing: 20,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        borders: THIN_BOTTOM,
        margins: { top: 80, bottom: 80, left: 80, right: 120 },
        shading: stars ? { type: ShadingType.SOLID, color: bg } : undefined,
        children: [
          new Paragraph({
            children: [
              stars
                ? new TextRun({ text: stars, bold: true, color: text, size: 18 })
                : new TextRun({ text: "N/A", color: EMPTY_TEXT, size: 18, italics: true }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ── Metric row (numeric, optional % suffix) ───────────────────────────────
function metricRow(
  label: string,
  value: number | null,
  pct?: boolean,
): TableRow {
  const display =
    value != null ? `${value}${pct ? "%" : ""}` : null;
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        borders: THIN_BOTTOM,
        margins: { top: 80, bottom: 80, left: 120, right: 80 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: label.toUpperCase(),
                bold: true,
                color: LABEL_GRAY,
                size: 16,
                characterSpacing: 20,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        borders: THIN_BOTTOM,
        margins: { top: 80, bottom: 80, left: 80, right: 120 },
        children: [
          new Paragraph({
            children: [
              display
                ? new TextRun({ text: display, bold: true, color: BODY_TEXT, size: 18 })
                : new TextRun({ text: "N/A", color: EMPTY_TEXT, size: 18, italics: true }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ── Fetch logo as ArrayBuffer (browser fetch of /logo.png) ────────────────
async function fetchLogoBuffer(): Promise<ArrayBuffer> {
  const res = await fetch("/logo.png");
  return res.arrayBuffer();
}

// ── Main export function ───────────────────────────────────────────────────
export async function generateDocx(report: ReportModel): Promise<Blob> {
  const { facility, manual, displayName } = report;
  const careCompareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${facility.ccn}`;

  const logoBuffer = await fetchLogoBuffer();

  // ── Header (appears on every page) ──────────────────────────────────────
  const docHeader = new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "auto" },
          bottom: { style: BorderStyle.SINGLE, size: 12, color: PINK },
          left: { style: BorderStyle.NONE, size: 0, color: "auto" },
          right: { style: BorderStyle.NONE, size: 0, color: "auto" },
        },
        rows: [
          new TableRow({
            children: [
              // Logo cell
              new TableCell({
                width: { size: 10, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: DARK_BG },
                borders: NO_BORDER,
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: logoBuffer,
                        transformation: { width: 40, height: 40 },
                        type: "png",
                      }),
                    ],
                  }),
                ],
              }),
              // Brand text cell
              new TableCell({
                width: { size: 72, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: DARK_BG },
                borders: NO_BORDER,
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "INFINITE — Managed by MEDELITE",
                        bold: true,
                        color: PURPLE_LIGHT,
                        size: 14,
                        characterSpacing: 40,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "FACILITY ASSESSMENT SNAPSHOT",
                        bold: true,
                        color: WHITE,
                        size: 22,
                        characterSpacing: 30,
                      }),
                    ],
                  }),
                ],
              }),
              // State cell
              new TableCell({
                width: { size: 18, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: DARK_BG },
                borders: NO_BORDER,
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 80, bottom: 80, left: 80, right: 120 },
                children: facility.state
                  ? [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: facility.state,
                            bold: true,
                            color: PINK,
                            size: 52,
                            characterSpacing: 60,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: "STATE",
                            bold: true,
                            color: PURPLE_LIGHT,
                            size: 12,
                            characterSpacing: 40,
                          }),
                        ],
                      }),
                    ]
                  : [new Paragraph({ children: [] })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // ── Body table ────────────────────────────────────────────────────────────
  const bodyRows: TableRow[] = [
    sectionRow("Facility Information"),
    dataRow("Name of Facility", displayName || null),
    dataRow("Location", facility.location),
    dataRow("EMR", manual.emr || null),
    dataRow(
      "Census Capacity",
      facility.certifiedBeds != null ? String(facility.certifiedBeds) : null,
    ),
    dataRow("Current Census", manual.currentCensus || null),
    dataRow("Type of Patient", manual.typeOfPatient || null),

    sectionRow("Medelite History"),
    dataRow("Previous Coverage from Medelite", manual.previousCoverage || null),
    dataRow("Previous Provider Performance", manual.previousProviderPerformance || null),
    dataRow("Medical Coverage", manual.medicalCoverage || null),

    sectionRow("CMS Star Ratings"),
    ratingRow("Overall Rating", facility.overallRating),
    ratingRow("Health Inspection", facility.healthInspectionRating),
    ratingRow("Staffing", facility.staffingRating),
    ratingRow("Quality of Resident Care", facility.qmRating),
  ];

  if (facility.claims) {
    bodyRows.push(
      sectionRow("Hospitalization & ED Metrics"),
      metricRow("Short Term Hospitalization", facility.claims.strHospitalization, true),
      metricRow("STR National Avg. for Hospitalization", facility.claims.strHospitalizationNational, true),
      metricRow("STR State Avg. for Hospitalization", facility.claims.strHospitalizationState, true),
      metricRow("STR ED Visit", facility.claims.strEdVisit, true),
      metricRow("STR ED Visits National Avg.", facility.claims.strEdVisitNational, true),
      metricRow("STR ED Visits State Avg.", facility.claims.strEdVisitState, true),
      metricRow("LT Hospitalization", facility.claims.ltHospitalization),
      metricRow("LT National Avg. for Hospitalization", facility.claims.ltHospitalizationNational),
      metricRow("LT State Avg. for Hospitalization", facility.claims.ltHospitalizationState),
      metricRow("ED Visit", facility.claims.ltEdVisit),
      metricRow("LT ED Visits National Avg.", facility.claims.ltEdVisitNational),
      metricRow("LT ED Visits State Avg.", facility.claims.ltEdVisitState),
    );
  }

  const doc = new Document({
    creator: "INFINITE — Managed by MEDELITE",
    title: `Facility Assessment — ${displayName}`,
    description: "Generated by the Medelite Facility Assessment Snapshot tool",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1.1),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
            },
          },
        },
        headers: { default: docHeader },
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "auto" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
              left: { style: BorderStyle.NONE, size: 0, color: "auto" },
              right: { style: BorderStyle.NONE, size: 0, color: "auto" },
            },
            rows: bodyRows,
          }),

          // Medicare source link
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "MEDICARE SOURCE  ",
                bold: true,
                color: PURPLE,
                size: 14,
                characterSpacing: 40,
              }),
              new ExternalHyperlink({
                link: careCompareUrl,
                children: [
                  new TextRun({
                    text: careCompareUrl,
                    color: PINK,
                    size: 16,
                    underline: { type: "single" },
                  }),
                ],
              }),
            ],
          }),

          // Footer brand line
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "ede9fe" },
            },
            children: [
              new TextRun({
                text: "INFINITE — Managed by MEDELITE",
                bold: true,
                color: PURPLE,
                size: 14,
                characterSpacing: 30,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
