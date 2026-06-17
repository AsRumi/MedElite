export interface FacilityData {
  providerName: string;
  location: string;
  state: string;
  certifiedBeds: number | null;
  overallRating: number | null;
  healthInspectionRating: number | null;
  staffingRating: number | null;
  qmRating: number | null;
  ccn: string;
}

export interface ManualInputs {
  nameOverride: string;
  emr: string;
  currentCensus: string;
  typeOfPatient: string;
  previousCoverage: "Yes" | "No" | "";
  previousProviderPerformance: string;
  medicalCoverage: string;
}

export interface ReportModel {
  facility: FacilityData;
  manual: ManualInputs;
  displayName: string;
}
