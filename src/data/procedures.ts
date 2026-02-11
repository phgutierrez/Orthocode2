import { Procedure } from '@/types/procedure';

let cachedProcedures: Procedure[] | null = null;
let cachedPromise: Promise<Procedure[]> | null = null;

export async function loadProcedures(): Promise<Procedure[]> {
  if (cachedProcedures) {
    return cachedProcedures;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    const response = await fetch('/data/procedures.json');
    if (!response.ok) {
      throw new Error(`Failed to load procedures: ${response.status}`);
    }
    const data = await response.json();
    cachedProcedures = Array.isArray(data) ? data : [];
    return cachedProcedures;
  })();

  try {
    return await cachedPromise;
  } finally {
    cachedPromise = null;
  }
}

export function searchProcedures(procedures: Procedure[], query: string, filters?: { region?: string; type?: string }) {
  let results = procedures;

  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter((proc) => {
      return (
        proc.name.toLowerCase().includes(q) ||
        proc.codes.tuss.toLowerCase().includes(q) ||
        proc.codes.cbhpm.toLowerCase().includes(q) ||
        proc.codes.sus.toLowerCase().includes(q) ||
        proc.keywords.some((kw) => kw.toLowerCase().includes(q))
      );
    });
  }

  if (filters?.region) {
    results = results.filter((proc) => proc.region === filters.region);
  }

  if (filters?.type) {
    results = results.filter((proc) => proc.type === filters.type);
  }

  return results;
}

export function getProcedureById(procedures: Procedure[], id: string): Procedure | undefined {
  return procedures.find((proc) => proc.id === id);
}
