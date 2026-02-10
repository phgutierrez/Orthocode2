export interface ProcedurePackage {
  id: string;
  name: string;
  description?: string;
  procedureIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PrivatePackage {
  id: string;
  name: string;
  description?: string;
  procedureIds: string[];
  opmeIds: string[];
  surgeonValue: number;
  anesthetistValue: number;
  assistantValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface OpmeItem {
  id: string;
  name: string;
  description?: string;
  value: number;
  createdAt: string;
  updatedAt: string;
}
