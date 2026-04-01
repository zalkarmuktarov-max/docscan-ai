export interface Party {
  role: string;
  name: string;
}

export interface KeyTerm {
  label: string;
  value: string;
}

export interface Obligation {
  party: string;
  color: "blue" | "green";
  text: string;
}

export interface Risk {
  text: string;
  severity: "high" | "medium" | "low";
  details: string;
  clause: string;
}

export type TrafficLight = "green" | "yellow" | "red";

export interface AnalysisResult {
  document_type: string;
  traffic_light: TrafficLight;
  traffic_label: string;
  parties: Party[];
  key_terms: KeyTerm[];
  obligations: Obligation[];
  risks: Risk[];
  summary: string;
}

export interface Analysis {
  id: string;
  filename: string;
  file_text?: string;
  result?: AnalysisResult;
  status: "pending" | "processing" | "done" | "error";
  created_at: string;
}
