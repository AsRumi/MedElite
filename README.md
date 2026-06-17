# Facility Assessment Report Generator

**INFINITE - Managed by MEDELITE**

A lightweight web app that takes a CMS Certification Number (CCN), fetches public facility data from the CMS Provider Data Catalog API, merges it with manually entered operational fields, and produces a print-ready PDF report ("Facility Assessment Snapshot").

---

## Live URL

> [Link to Live Website](https://med-elite-eosin.vercel.app/)

## Repository

> [Link to Public Repository](https://github.com/AsRumi/MedElite)

---

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How It Works

1. User enters a 6-character CCN in the form.
2. The app calls `/api/facility?ccn=...` — a server-side proxy to the CMS Provider Data Catalog API (dataset `4pq5-n9py`). This avoids CORS issues and normalizes the raw string response.
3. The normalized `FacilityData` is merged with manual form inputs into a `ReportModel`.
4. The on-screen `SnapshotPreview` renders the report live.
5. "Download PDF" triggers `@react-pdf/renderer` in the browser, producing a vector PDF with a clickable Medicare Care Compare hyperlink.

---

## Assumptions

- **Current Census** is a manual input field (not pulled from `average_number_of_residents_per_day`), per the authoritative mapping table in the assignment brief. The CMS field may be shown as a convenience hint but the value remains user-editable.
- **Facility name** defaults to `provider_name` from the API (not `legal_business_name`), as this matches the displayed name on the reference snapshot. A manual override field takes precedence when filled.
- Any CMS column-name adjustments discovered during the Phase 2 data-layer verification will be noted here.

---

## Tech Stack

| Concern    | Choice                                        | Reason                                                                                                          |
| ---------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js (App Router) + TypeScript             | Single project for UI + API proxy; zero-config Vercel deploy                                                    |
| Styling    | Tailwind CSS                                  | Fast, colocated, no component lib needed for this scope                                                         |
| Data layer | Next.js Route Handler (server-side CMS proxy) | Sidesteps CORS; normalizes messy string response before the client sees it                                      |
| PDF        | `@react-pdf/renderer`                         | Real vector PDF with selectable text and a true clickable `<Link>` — unlike the html2canvas screenshot approach |
| Database   | None                                          | Stateless app; nothing to persist for the MVP                                                                   |
| Auth       | None                                          | Internal single-purpose tool; out of scope for MVP                                                              |
| Deployment | Vercel + GitHub                               | Natural fit; live URL from day one                                                                              |

---

## Future Options (not built)

- **Saved report history:** Vercel Postgres or SQLite.
- **Access control:** SSO gate if deployed as a real internal tool.
- **Bonus metrics:** 12 hospitalization/ED rows from the Medicare Claims Quality Measures dataset.
