export interface ClaimsMetrics {
  strHospitalization: number | null;
  strHospitalizationNational: number | null;
  strHospitalizationState: number | null;
  strEdVisit: number | null;
  strEdVisitNational: number | null;
  strEdVisitState: number | null;
  ltHospitalization: number | null;
  ltHospitalizationNational: number | null;
  ltHospitalizationState: number | null;
  ltEdVisit: number | null;
  ltEdVisitNational: number | null;
  ltEdVisitState: number | null;
}

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
  claims: ClaimsMetrics | null;
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
