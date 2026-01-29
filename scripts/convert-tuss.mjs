import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the Excel file
const workbook = XLSX.readFile(path.join(__dirname, '../tuss-data.xls'));
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

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

  return {
    id: `tuss-${index}`,
    name: nome,
    codes: {
      cbhpm: '', // Will be empty for now
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
    anestheticPort: '0',
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

// Write to TypeScript file
const output = `import { Procedure } from '@/types/procedure';

export const procedures: Procedure[] = ${JSON.stringify(procedures, null, 2)};

export function searchProcedures(query: string, filters?: { region?: string; type?: string }) {
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

export function getProcedureById(id: string): Procedure | undefined {
  return procedures.find((proc) => proc.id === id);
}
`;

fs.writeFileSync(
  path.join(__dirname, '../src/data/procedures.ts'),
  output,
  'utf-8'
);

console.log(`✓ Converted ${procedures.length} procedures from TUSS Excel file`);
console.log('✓ Saved to src/data/procedures.ts');
