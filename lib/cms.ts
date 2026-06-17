import type { FacilityData } from "./types";

export function parseIntOrNull(s: string | undefined): number | null {
  if (s === undefined || s.trim() === "") return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

export function parseStringOrNull(s: string | undefined): string | null {
  if (s === undefined || s.trim() === "") return null;
  return s.trim();
}

interface CmsRawRow {
  cms_certification_number_ccn: string;
  provider_name: string;
  provider_address: string;
  citytown: string;
  state: string;
  zip_code: string;
  location: string;
  number_of_certified_beds: string;
  overall_rating: string;
  health_inspection_rating: string;
  staffing_rating: string;
  qm_rating: string;
  [key: string]: string;
}

const CMS_ENDPOINT =
  "https://data.cms.gov/provider-data/api/1/datastore/query/4pq5-n9py/0";

export async function fetchFacilityByCcn(ccn: string): Promise<FacilityData> {
  const url = new URL(CMS_ENDPOINT);
  url.searchParams.set(
    "conditions[0][property]",
    "cms_certification_number_ccn",
  );
  url.searchParams.set("conditions[0][value]", ccn);
  url.searchParams.set("conditions[0][operator]", "=");

  const res = await fetch(url.toString(), {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`CMS API responded with status ${res.status}`);
  }

  const body = await res.json();
  const results: CmsRawRow[] = body?.results ?? [];

  if (results.length === 0) {
    throw new NotFoundError(`No facility found for CCN "${ccn}"`);
  }

  const row = results[0];

  // Collect location from "location" if available,
  // else build it from ("ADDRESS,CITY,STATE,ZIP").

  const location =
    parseStringOrNull(row.location) ??
    [row.provider_address, row.citytown, row.state, row.zip_code]
      .map((s) => s?.trim())
      .filter(Boolean)
      .join(", ");

  return {
    ccn,
    providerName: row.provider_name?.trim() ?? "",
    location,
    state: row.state?.trim() ?? "",
    certifiedBeds: parseIntOrNull(row.number_of_certified_beds),
    overallRating: parseIntOrNull(row.overall_rating),
    healthInspectionRating: parseIntOrNull(row.health_inspection_rating),
    staffingRating: parseIntOrNull(row.staffing_rating),
    qmRating: parseIntOrNull(row.qm_rating),
  };
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
