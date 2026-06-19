# Facility Assessment Report Generator

**INFINITE — Managed by MEDELITE**

A lightweight web app that accepts a CMS Certification Number (CCN), fetches public facility data from the CMS Provider Data Catalog API, merges it with manually entered operational fields, and produces a print-ready PDF report ("Facility Assessment Snapshot").

---

## Live URL

> [https://med-elite-eosin.vercel.app/](https://med-elite-eosin.vercel.app/)

## Repository

> [https://github.com/AsRumi/MedElite](https://github.com/AsRumi/MedElite)

---

## Run Locally

**Requirements:** Node.js 18+, npm 9+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are required since the app calls the public CMS API from the server side with no authentication.

---

## How It Works

1. User enters a 6-character CCN in the form.
2. The browser calls `/api/facility?ccn=...` — a Next.js Route Handler that proxies the CMS Provider Data Catalog API (dataset `4pq5-n9py`, index 0). Running the request server-side sidesteps CORS and normalizes the raw string response before the client sees it.
3. The normalized `FacilityData` is merged with the user's manual form inputs into a `ReportModel`.
4. The on-screen `SnapshotPreview` component renders the full report live, updating as manual fields are filled in.
5. Clicking **Download PDF** invokes `@react-pdf/renderer` entirely in the browser. It produces a vector PDF with selectable text and a genuinely clickable Medicare Care Compare hyperlink, then triggers a direct file download — no print dialog.

---

## Assumptions

- **Current Census** is a manual input field (not pulled from the CMS `average_number_of_residents_per_day` column), per the authoritative field-mapping table in the assignment brief.
- **Facility name** defaults to `provider_name` from the API (not `legal_business_name`), as this matches the displayed name on the reference snapshot. A manual override field takes precedence when filled. The word "INFINITE" in the branding header is a static internal brand name and is never touched by the name-override logic.
- **CMS `location` field** is a prebuilt `"ADDRESS, CITY, STATE, ZIP"` string returned by the API and used directly. Individual address fields (`provider_address`, `citytown`, `state`, `zip_code`) are kept as a fallback in case it is ever empty.
- **CMS column names verified** against the live endpoint using test CCN `686123` (Kendall Lakes Healthcare and Rehab Center, FL). All four rating columns (`overall_rating`, `health_inspection_rating`, `staffing_rating`, `qm_rating`) and the address fields matched the mapping table exactly — no renames were needed.
- **Live ratings vs. reference PDF:** The CMS dataset refreshes continuously, so ratings for CCN `686123` may differ from the static reference PDF provided with the brief.
- **Facilities with no rating** (e.g. CCN `185489`, Willowbrook KY) display "N/A" for missing star ratings rather than crashing or showing zero.
- **Asynchronously loading 12 metrics:** During testing runs, it was found that loading metrics takes longer than loading facility information, ratings and history, sometimes resulting in timeouts. Therefore, router.ts was split to make two calls; one for the 12 optional metrics, and another for the information required for the MVP. If the metrics load slower than initial information, a loading indicator is displayed in place.

---

## Tech Stack

| Concern    | Choice                                        | Reason                                                                                                         |
| ---------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router) + TypeScript          | Single project for UI + API proxy; zero-config Vercel deploy                                                   |
| Styling    | Tailwind CSS v4                               | Fast, colocated, no component library needed at this scope                                                     |
| Data layer | Next.js Route Handler (server-side CMS proxy) | Sidesteps CORS; normalizes the messy all-string CMS response before the client sees it                         |
| PDF        | `@react-pdf/renderer`                         | Real vector PDF with selectable text and a true clickable `<Link>`: unlike the html2canvas screenshot approach |
| Database   | None                                          | Stateless app; each report is generated fresh from API + form input. Nothing to persist for the MVP.           |
| Auth       | None                                          | Internal single-purpose tool; out of scope for the MVP.                                                        |
| Deployment | Vercel + GitHub                               | Natural fit for Next.js; easy to deploy.                                                                       |

---

## Future Options (not built)

- **Saved report history:** Vercel Postgres or SQLite would be the natural starting point. Problem of stale information comes into picture.
- **Access control:** SSO gate if this became a real internal deployment.
