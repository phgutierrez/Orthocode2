import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the Excel file (TUSS)
const workbook = XLSX.readFile(path.join(__dirname, '../docs/setup/tuss-data.xls'));
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Read as array format to preserve indices
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

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

// Map procedure type based on which context columns have values
function mapProcedureType(row) {
  // Indices: 8=AMB, 9=HCO, 10=HSO, 11=PAC, 12=D.UT
  const amb = String(row?.[8] || '').trim();
  const hco = String(row?.[9] || '').trim();
  const hso = String(row?.[10] || '').trim();
  const pac = String(row?.[11] || '').trim();
  const dut = String(row?.[12] || '').trim();

  // Priority: if D.UT has value → diagnóstico
  if (dut) return 'diagnostico';
  
  // If HCO, HSO, PAC → cirurgico
  if (hco || hso || pac) return 'cirurgico';
  
  // If AMB → ambulatorial
  if (amb) return 'ambulatorial';
  
  // Default
  return 'ambulatorial';
}

function mapRegion(nome) {
  const n = nome.toLowerCase();
  
  // === COLUNA VERTEBRAL ===
  if (n.includes('coluna') || n.includes('vertebral') || n.includes('vértebra') || 
      n.includes('disco') || n.includes('espinha') || n.includes('dorsal') ||
      n.includes('cervical') || n.includes('torácica') || n.includes('lombar') ||
      n.includes('sacra') || n.includes('coccígea') || n.includes('medula espinhal')) {
    return 'coluna';
  }

  // === QUADRIL ===
  // Fêmur proximal, pelve, articulação coxofemoral
  // DEVE VIR ANTES de outras buscas para evitar falsos positivos
  if (n.includes('quadril') || n.includes('pelve') || n.includes('pélvis') ||
      (n.includes('fêmur') && (n.includes('proximal') || n.includes('cabeça') || n.includes('colo'))) ||
      (n.includes('femur') && (n.includes('proximal') || n.includes('cabeça') || n.includes('colo'))) ||
      n.includes('articulação coxofemoral') || n.includes('coxa') ||
      n.includes('ísquio') || n.includes('isquio') || n.includes('púbis') || n.includes('pubis') ||
      n.includes('ilíaco') || n.includes('iliaco')) {
    return 'quadril';
  }

  // === OMBRO ===
  // Úmero proximal, articulação do ombro, clavícula proximal
  if (n.includes('ombro') || n.includes('articulação do ombro') ||
      (n.includes('úmero') && (n.includes('proximal') || n.includes('cabeça') || n.includes('tuberosidade'))) ||
      (n.includes('umero') && (n.includes('proximal') || n.includes('cabeça') || n.includes('tuberosidade'))) ||
      (n.includes('clavícula') && (n.includes('proximal') || n.includes('articul'))) ||
      (n.includes('clavicula') && (n.includes('proximal') || n.includes('articul'))) ||
      n.includes('escapula') || n.includes('escápula') || n.includes('articulação acromioclavicular')) {
    return 'ombro';
  }

  // === COTOVELO ===
  // Úmero distal, rádio proximal, ulna proximal, articulação do cotovelo
  if (n.includes('cotovelo') || n.includes('articulação do cotovelo') ||
      (n.includes('úmero') && (n.includes('distal') || n.includes('epicôndilo'))) ||
      (n.includes('umero') && (n.includes('distal') || n.includes('epicondilo'))) ||
      (n.includes('rádio') && n.includes('proximal')) ||
      (n.includes('radio') && n.includes('proximal')) ||
      (n.includes('ulna') && n.includes('proximal')) ||
      n.includes('radioulnar') || n.includes('radioulnares') ||
      n.includes('antebraço') || n.includes('antebraco')) {
    return 'cotovelo';
  }

  // === MÃO E PUNHO ===
  // Rádio distal, ulna distal, carpo, metacarpos, falanges
  if ((n.includes('mão') || n.includes('mao ')) && !n.includes('pele') ||
      (n.includes('punho') && !n.includes('repouso')) ||
      (n.includes('rádio') && n.includes('distal')) ||
      (n.includes('radio') && n.includes('distal')) ||
      (n.includes('ulna') && n.includes('distal')) ||
      n.includes('carpo') || n.includes('carpiana') ||
      n.includes('metacarpo') || n.includes('falange') ||
      (n.includes('dedos') || n.includes('dedo')) && !n.includes('pé') && !n.includes('pe ') ||
      n.includes('escafoide') || n.includes('semilunar') || n.includes('piramidal') ||
      n.includes('pisiforme') || n.includes('trapézio') || n.includes('trapezoide') ||
      n.includes('trapezio') || n.includes('capitato') || n.includes('hamato')) {
    return 'mao-punho';
  }

  // === JOELHO ===
  // Fêmur distal, tíbia proximal, fíbula, rótula
  if (n.includes('joelho') || n.includes('articulação do joelho') ||
      (n.includes('fêmur') && (n.includes('distal') || n.includes('côndilo'))) ||
      (n.includes('femur') && (n.includes('distal') || n.includes('condilo'))) ||
      (n.includes('tíbia') && (n.includes('proximal') || n.includes('platô') || n.includes('plato'))) ||
      (n.includes('tibia') && (n.includes('proximal') || n.includes('plato'))) ||
      n.includes('fíbula') || n.includes('fibula') ||
      n.includes('rótula') || n.includes('rotula') ||
      n.includes('menisco') || n.includes('ligamento cruzado') ||
      n.includes('ligamento colateral')) {
    return 'joelho';
  }

  // === TORNOZELO E PÉ ===
  // Tíbia distal, fíbula distal, tarso, metatarsos, falanges do pé
  if (n.includes('tornozelo') ||
      (n.includes('tíbia') && n.includes('distal')) ||
      (n.includes('tibia') && n.includes('distal')) ||
      (n.includes('fíbula') && n.includes('distal')) ||
      (n.includes('fibula') && n.includes('distal')) ||
      n.includes('tarso') || n.includes('calcâneo') || n.includes('calcaneo') ||
      n.includes('astrágalo') || n.includes('astragalo') ||
      n.includes('metatarso') || n.includes('metatarsal') ||
      n.includes('hálux') || n.includes('halux') ||
      (n.includes('pé ') || n.includes('pé-')) && !n.includes('pele')) {
    return 'tornozelo-pe';
  }

  // === MEMBROS SUPERIORES (genérico) ===
  if (n.includes('membro superior')) {
    return 'membros-superiores';
  }

  // === MEMBROS INFERIORES (genérico) ===
  if (n.includes('membro inferior')) {
    return 'membros-inferiores';
  }

  // Default
  return 'outros';
}

// Map columns based on the structure provided
// rawData is array format, starting from row 3 (skip headers)
const procedures = rawData.slice(3).map((row, index) => {
  const codigoTuss = String(row?.[0] || '').trim();
  const nome = String(row?.[1] || '').trim();
  const subgrupo = String(row?.[4] || '').trim();
  const grupo = String(row?.[5] || '').trim();

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
    region: mapRegion(nome),
    type: mapProcedureType(row),
    porte: cbhpmInfo?.porteIndex || '',
    anestheticPort: cbhpmInfo?.porteAnest || '0',
    uco: 0,
    surgicalTime: null,
    description: `${subgrupo} - ${grupo}`.trim(),
    cids: [],
    keywords: [codigoTuss, nome.toLowerCase(), grupo.toLowerCase(), subgrupo.toLowerCase()],
  };
}).filter(Boolean);

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
