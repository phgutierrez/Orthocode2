export type AnatomicRegion = 
  | 'coluna'
  | 'ombro'
  | 'cotovelo'
  | 'mao-punho'
  | 'quadril'
  | 'joelho'
  | 'tornozelo-pe'
  | 'membros-inferiores'
  | 'membros-superiores'
  | 'outros';

export type ProcedureType = 
  | 'cirurgico'
  | 'ambulatorial'
  | 'diagnostico';

export type TableType = 'CBHPM' | 'TUSS' | 'SUS';

export interface ProcedureCode {
  cbhpm: string;
  tuss: string;
  sus: string;
}

export interface ProcedureValue {
  cbhpm: number;
  tuss: number;
  sus: number;
}

export interface Procedure {
  id: string;
  name: string;
  codes: ProcedureCode;
  values: ProcedureValue;
  region: AnatomicRegion;
  type: ProcedureType;
  anestheticPort: string;
  uco: number;
  surgicalTime: number | null; // in minutes
  description: string;
  cids: string[];
  keywords: string[];
}

export interface SearchFilters {
  table?: TableType;
  region?: AnatomicRegion;
  type?: ProcedureType;
}

export const regionLabels: Record<AnatomicRegion, string> = {
  coluna: 'Coluna',
  ombro: 'Ombro',
  cotovelo: 'Cotovelo',
  'mao-punho': 'Mão e Punho',
  quadril: 'Quadril',
  joelho: 'Joelho',
  'tornozelo-pe': 'Tornozelo e Pé',
  'membros-inferiores': 'Membros Inferiores',
  'membros-superiores': 'Membros Superiores',
  outros: 'Outros',
};

export const typeLabels: Record<ProcedureType, string> = {
  cirurgico: 'Cirúrgico',
  ambulatorial: 'Ambulatorial',
  diagnostico: 'Diagnóstico',
};

export const tableLabels: Record<TableType, string> = {
  CBHPM: 'CBHPM',
  TUSS: 'TUSS',
  SUS: 'SUS',
};
