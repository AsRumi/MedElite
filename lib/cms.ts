import type { FacilityData, ClaimsMetrics } from "./types";

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      next: { revalidate: 0 },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("CMS API request timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

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
    claims: null,
  };
}

const CLAIMS_ENDPOINT =
  "https://data.cms.gov/provider-data/api/1/datastore/query/ijh5-nb2v/0";
const AVERAGES_ENDPOINT =
  "https://data.cms.gov/provider-data/api/1/datastore/query/xcdc-v8bm/0";

function parseFloatOrNull(s: string | undefined): number | null {
  if (s === undefined || s.trim() === "") return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : Math.round(n * 1000) / 1000;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(url, { next: { revalidate: 0 }, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchClaimsMetrics(ccn: string, state: string): Promise<ClaimsMetrics | null> {
  try {
    const claimsUrl = new URL(CLAIMS_ENDPOINT);
    claimsUrl.searchParams.set("conditions[0][property]", "cms_certification_number_ccn");
    claimsUrl.searchParams.set("conditions[0][value]", ccn);
    claimsUrl.searchParams.set("conditions[0][operator]", "=");

    const natUrl = new URL(AVERAGES_ENDPOINT);
    natUrl.searchParams.set("conditions[0][property]", "state_or_nation");
    natUrl.searchParams.set("conditions[0][value]", "NATION");
    natUrl.searchParams.set("conditions[0][operator]", "=");

    const stateUrl = new URL(AVERAGES_ENDPOINT);
    stateUrl.searchParams.set("conditions[0][property]", "state_or_nation");
    stateUrl.searchParams.set("conditions[0][value]", state.toUpperCase());
    stateUrl.searchParams.set("conditions[0][operator]", "=");

    const [claimsRes, natRes, stateRes] = await Promise.all([
      fetchWithTimeout(claimsUrl.toString()),
      fetchWithTimeout(natUrl.toString()),
      fetchWithTimeout(stateUrl.toString()),
    ]);

    if (!claimsRes.ok || !natRes.ok || !stateRes.ok) return null;

    const [claimsBody, natBody, stateBody] = await Promise.all([
      claimsRes.json(),
      natRes.json(),
      stateRes.json(),
    ]);

    const rows: Array<{ measure_code: string; adjusted_score: string }> =
      claimsBody?.results ?? [];
    const nat = natBody?.results?.[0] ?? {};
    const st = stateBody?.results?.[0] ?? {};

    const byCode = Object.fromEntries(rows.map((r) => [r.measure_code, r.adjusted_score]));

    return {
      strHospitalization: parseFloatOrNull(byCode["521"]),
      strHospitalizationNational: parseFloatOrNull(nat["percentage_of_short_stay_residents_who_were_rehospitalized__1d02"]),
      strHospitalizationState: parseFloatOrNull(st["percentage_of_short_stay_residents_who_were_rehospitalized__1d02"]),
      strEdVisit: parseFloatOrNull(byCode["522"]),
      strEdVisitNational: parseFloatOrNull(nat["percentage_of_short_stay_residents_who_had_an_outpatient_em_d911"]),
      strEdVisitState: parseFloatOrNull(st["percentage_of_short_stay_residents_who_had_an_outpatient_em_d911"]),
      ltHospitalization: parseFloatOrNull(byCode["551"]),
      ltHospitalizationNational: parseFloatOrNull(nat["number_of_hospitalizations_per_1000_longstay_resident_days"]),
      ltHospitalizationState: parseFloatOrNull(st["number_of_hospitalizations_per_1000_longstay_resident_days"]),
      ltEdVisit: parseFloatOrNull(byCode["552"]),
      ltEdVisitNational: parseFloatOrNull(nat["number_of_outpatient_emergency_department_visits_per_1000_l_de9d"]),
      ltEdVisitState: parseFloatOrNull(st["number_of_outpatient_emergency_department_visits_per_1000_l_de9d"]),
    };
  } catch {
    return null;
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
