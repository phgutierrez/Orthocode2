export type AnatomicRegion = 
  | 'coluna'
  | 'membros_superiores'
  | 'membros_inferiores'
  | 'pelve'
  | 'mao'
  | 'pe'
  | 'joelho'
  | 'ombro'
  | 'quadril';

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
  membros_superiores: 'Membros Superiores',
  membros_inferiores: 'Membros Inferiores',
  pelve: 'Pelve',
  mao: 'Mão',
  pe: 'Pé',
  joelho: 'Joelho',
  ombro: 'Ombro',
  quadril: 'Quadril',
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
