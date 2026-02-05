import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the Excel file (TUSS)
const workbook = XLSX.readFile(path.join(__dirname, '../docs/setup/tuss-data.xls'));
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

// Read CBHPM file for Porte information
const cbhpmWorkbook = XLSX.readFile(path.join(__dirname, '../docs/setup/tabela-cbhpm-5.xlsx'));
const cbhpmMap = buildCbhpmMap(cbhpmWorkbook);

function buildCbhpmMap(workbook) {
  const map = new Map();
  const sheetNames = workbook.SheetNames.slice(0, 2);

  sheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

    rows.forEach((row) => {
      const code = String(row?.[0] || '').trim();
      if (!/^[0-9]{6,10}$/.test(code)) return;

      const name = String(row?.[1] || '').trim();
      const porteIndex = String(row?.[4] || '').trim(); // Coluna E
      const porteAnest = String(row?.[9] || '').trim(); // Coluna J

      if (!porteIndex && !porteAnest) return;

      const existing = map.get(code) || {};
      map.set(code, {
        code,
        name: name || existing.name || '',
        porteIndex: porteIndex || existing.porteIndex || '',
        porteAnest: porteAnest || existing.porteAnest || '',
      });
    });
  });

  return map;
}

// Map columns based on the structure provided
const procedures = data.map((row, index) => {
  const codigoTuss = String(row['__EMPTY'] || '').trim();
  const nome = String(row['__EMPTY_1'] || '').trim();
  const subgrupo = String(row['__EMPTY_3'] || '').trim();
  const grupo = String(row['__EMPTY_4'] || '').trim();
  const capitulo = String(row['__EMPTY_5'] || '').trim();

  if (!codigoTuss || !nome || codigoTuss === 'Código Tab 22') {
    return null;
  }

  const cbhpmInfo = cbhpmMap.get(codigoTuss);

  return {
    id: `tuss-${index}`,
    name: nome,
    codes: {
      cbhpm: cbhpmInfo ? codigoTuss : '',
      tuss: codigoTuss,
      sus: '', // Will be empty for now
    },
    values: {
      cbhpm: 0,
      tuss: 0,
      sus: 0,
    },
    region: mapRegion(capitulo),
    type: 'cirurgico',
    porte: cbhpmInfo?.porteIndex || '',
    anestheticPort: cbhpmInfo?.porteAnest || '0',
    uco: 0,
    surgicalTime: null,
    description: `${subgrupo} - ${grupo}`.trim(),
    cids: [],
    keywords: [codigoTuss, nome.toLowerCase(), grupo.toLowerCase(), subgrupo.toLowerCase()],
  };
}).filter(Boolean);

function mapRegion(capitulo) {
  const cap = capitulo.toLowerCase();
  if (cap.includes('coluna') || cap.includes('vertebral')) return 'coluna';
  if (cap.includes('ombro')) return 'ombro';
  if (cap.includes('joelho') || cap.includes('fêmur')) return 'joelho';
  if (cap.includes('quadril') || cap.includes('pelve')) return 'quadril';
  if (cap.includes('tornozelo') || cap.includes('pé')) return 'pe';
  if (cap.includes('mão') || cap.includes('dedo') || cap.includes('pulso')) return 'mao';
  if (cap.includes('cotovelo') || cap.includes('antebraço')) return 'cotovelo';
  return 'outros';
}

// Write to JSON file for public folder
const jsonOutput = JSON.stringify(procedures, null, 2);
fs.writeFileSync(
  path.join(__dirname, '../public/data/procedures.json'),
  jsonOutput,
  'utf-8'
);

// Write minimal TypeScript file with only types and fetch logic
const tsOutput = `import { Procedure } from '@/types/procedure';

let cachedProcedures: Procedure[] | null = null;

export async function loadProcedures(): Promise<Procedure[]> {
  if (cachedProcedures) {
    return cachedProcedures;
  }
  
  const response = await fetch('/data/procedures.json');
  cachedProcedures = await response.json();
  return cachedProcedures;
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
`;

fs.writeFileSync(
  path.join(__dirname, '../src/data/procedures.ts'),
  tsOutput,
  'utf-8'
);

console.log(`✓ Converted ${procedures.length} procedures from TUSS Excel file`);
console.log('✓ Saved JSON to public/data/procedures.json');
console.log('✓ Saved TypeScript loader to src/data/procedures.ts');
