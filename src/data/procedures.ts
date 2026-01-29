import { Procedure } from '@/types/procedure';

export const procedures: Procedure[] = [
  {
    id: '1',
    name: 'Artroscopia de Joelho - Meniscectomia',
    codes: {
      cbhpm: '3.04.01.01-6',
      tuss: '30401016',
      sus: '0408050012',
    },
    values: {
      cbhpm: 1850.00,
      tuss: 1750.00,
      sus: 580.00,
    },
    region: 'joelho',
    type: 'cirurgico',
    anestheticPort: '7C',
    uco: 5,
    surgicalTime: 60,
    description: 'Ressecção artroscópica de menisco (parcial ou total), incluindo desbridamento de lesões condrais quando presente.',
    cids: ['M23.2', 'S83.2', 'M23.3'],
    keywords: ['artroscopia', 'menisco', 'joelho', 'meniscectomia', 'lesão meniscal'],
  },
  {
    id: '2',
    name: 'Artroplastia Total de Quadril',
    codes: {
      cbhpm: '3.04.02.03-2',
      tuss: '30402032',
      sus: '0408050039',
    },
    values: {
      cbhpm: 4200.00,
      tuss: 4000.00,
      sus: 1200.00,
    },
    region: 'quadril',
    type: 'cirurgico',
    anestheticPort: '10C',
    uco: 12,
    surgicalTime: 150,
    description: 'Substituição total da articulação do quadril por prótese, incluindo componentes acetabular e femoral.',
    cids: ['M16.0', 'M16.1', 'M87.0', 'S72.0'],
    keywords: ['artroplastia', 'quadril', 'prótese', 'total', 'ATQ', 'coxartrose'],
  },
  {
    id: '3',
    name: 'Tratamento Cirúrgico de Fratura de Fêmur Proximal',
    codes: {
      cbhpm: '3.04.03.10-1',
      tuss: '30403101',
      sus: '0408040041',
    },
    values: {
      cbhpm: 3500.00,
      tuss: 3300.00,
      sus: 950.00,
    },
    region: 'quadril',
    type: 'cirurgico',
    anestheticPort: '9C',
    uco: 10,
    surgicalTime: 120,
    description: 'Tratamento cirúrgico de fratura do fêmur proximal (transtrocantérica, subtrocantérica) com síntese por placa ou haste intramedular.',
    cids: ['S72.1', 'S72.2', 'S72.3'],
    keywords: ['fratura', 'fêmur', 'proximal', 'transtrocantérica', 'subtrocantérica', 'haste', 'placa'],
  },
  {
    id: '4',
    name: 'Artroscopia de Ombro - Reparo do Manguito Rotador',
    codes: {
      cbhpm: '3.04.05.02-4',
      tuss: '30405024',
      sus: '0408050055',
    },
    values: {
      cbhpm: 2800.00,
      tuss: 2600.00,
      sus: 720.00,
    },
    region: 'ombro',
    type: 'cirurgico',
    anestheticPort: '8C',
    uco: 7,
    surgicalTime: 90,
    description: 'Reparo artroscópico de lesão do manguito rotador (supraespinhal, infraespinhal, subescapular) com uso de âncoras.',
    cids: ['M75.1', 'S46.0', 'M75.2'],
    keywords: ['artroscopia', 'ombro', 'manguito', 'rotador', 'supraespinhal', 'âncora'],
  },
  {
    id: '5',
    name: 'Discectomia Lombar por Via Posterior',
    codes: {
      cbhpm: '3.01.02.08-5',
      tuss: '30102085',
      sus: '0408050080',
    },
    values: {
      cbhpm: 3200.00,
      tuss: 3000.00,
      sus: 850.00,
    },
    region: 'coluna',
    type: 'cirurgico',
    anestheticPort: '9C',
    uco: 8,
    surgicalTime: 90,
    description: 'Ressecção de hérnia discal lombar por via posterior com descompressão de raiz nervosa.',
    cids: ['M51.1', 'M51.2', 'G55.1'],
    keywords: ['discectomia', 'hérnia', 'disco', 'lombar', 'coluna', 'ciática'],
  },
  {
    id: '6',
    name: 'Reconstrução do Ligamento Cruzado Anterior',
    codes: {
      cbhpm: '3.04.01.05-9',
      tuss: '30401059',
      sus: '0408050098',
    },
    values: {
      cbhpm: 3500.00,
      tuss: 3300.00,
      sus: 900.00,
    },
    region: 'joelho',
    type: 'cirurgico',
    anestheticPort: '8C',
    uco: 7,
    surgicalTime: 120,
    description: 'Reconstrução artroscópica do ligamento cruzado anterior com enxerto (tendão patelar, isquiotibiais ou aloenxerto).',
    cids: ['S83.5', 'M23.5'],
    keywords: ['LCA', 'ligamento', 'cruzado', 'anterior', 'joelho', 'reconstrução', 'artroscopia'],
  },
  {
    id: '7',
    name: 'Infiltração Articular Guiada',
    codes: {
      cbhpm: '2.02.01.08-4',
      tuss: '20201084',
      sus: '0301010099',
    },
    values: {
      cbhpm: 180.00,
      tuss: 150.00,
      sus: 45.00,
    },
    region: 'joelho',
    type: 'ambulatorial',
    anestheticPort: '0',
    uco: 0,
    surgicalTime: null,
    description: 'Infiltração intra-articular com corticosteroide ou ácido hialurônico guiada por ultrassonografia.',
    cids: ['M17.0', 'M17.1', 'M25.5'],
    keywords: ['infiltração', 'articular', 'viscossuplementação', 'ácido hialurônico', 'corticoide'],
  },
  {
    id: '8',
    name: 'Tratamento Cirúrgico de Fratura de Tornozelo',
    codes: {
      cbhpm: '3.04.08.12-5',
      tuss: '30408125',
      sus: '0408040112',
    },
    values: {
      cbhpm: 2200.00,
      tuss: 2000.00,
      sus: 620.00,
    },
    region: 'pe',
    type: 'cirurgico',
    anestheticPort: '7C',
    uco: 5,
    surgicalTime: 90,
    description: 'Tratamento cirúrgico de fratura de tornozelo (bi ou trimaleolar) com redução aberta e fixação interna.',
    cids: ['S82.5', 'S82.6', 'S82.8'],
    keywords: ['fratura', 'tornozelo', 'maléolo', 'placa', 'parafuso', 'RAFI'],
  },
  {
    id: '9',
    name: 'Ressonância Magnética de Coluna Lombar',
    codes: {
      cbhpm: '4.08.06.11-4',
      tuss: '40806114',
      sus: '0207010017',
    },
    values: {
      cbhpm: 580.00,
      tuss: 520.00,
      sus: 268.00,
    },
    region: 'coluna',
    type: 'diagnostico',
    anestheticPort: '0',
    uco: 0,
    surgicalTime: null,
    description: 'Exame de ressonância magnética da coluna lombossacra para avaliação de discos, medula e estruturas adjacentes.',
    cids: ['M51.1', 'M54.5', 'M47.8'],
    keywords: ['ressonância', 'magnética', 'RM', 'coluna', 'lombar', 'hérnia'],
  },
  {
    id: '10',
    name: 'Osteossíntese de Fratura de Rádio Distal',
    codes: {
      cbhpm: '3.04.07.05-0',
      tuss: '30407050',
      sus: '0408040155',
    },
    values: {
      cbhpm: 1800.00,
      tuss: 1650.00,
      sus: 480.00,
    },
    region: 'mao',
    type: 'cirurgico',
    anestheticPort: '6C',
    uco: 4,
    surgicalTime: 75,
    description: 'Tratamento cirúrgico de fratura do rádio distal com redução e fixação por placa volar bloqueada.',
    cids: ['S52.5', 'S52.6'],
    keywords: ['fratura', 'rádio', 'distal', 'punho', 'placa', 'volar', 'Colles'],
  },
  {
    id: '11',
    name: 'Artrodese Cervical Anterior',
    codes: {
      cbhpm: '3.01.03.12-8',
      tuss: '30103128',
      sus: '0408050144',
    },
    values: {
      cbhpm: 4500.00,
      tuss: 4200.00,
      sus: 1100.00,
    },
    region: 'coluna',
    type: 'cirurgico',
    anestheticPort: '10C',
    uco: 10,
    surgicalTime: 150,
    description: 'Artrodese cervical anterior com discectomia e colocação de cage ou enxerto ósseo, com placa.',
    cids: ['M50.1', 'M50.2', 'M47.1'],
    keywords: ['artrodese', 'cervical', 'anterior', 'ACDF', 'cage', 'coluna'],
  },
  {
    id: '12',
    name: 'Artroplastia Total de Joelho',
    codes: {
      cbhpm: '3.04.01.08-3',
      tuss: '30401083',
      sus: '0408050161',
    },
    values: {
      cbhpm: 4000.00,
      tuss: 3800.00,
      sus: 1150.00,
    },
    region: 'joelho',
    type: 'cirurgico',
    anestheticPort: '10C',
    uco: 11,
    surgicalTime: 140,
    description: 'Substituição total da articulação do joelho por prótese, incluindo componentes femoral e tibial.',
    cids: ['M17.0', 'M17.1', 'M17.4'],
    keywords: ['artroplastia', 'joelho', 'prótese', 'total', 'ATJ', 'gonartrose'],
  },
  {
    id: '13',
    name: 'Liberação de Túnel do Carpo',
    codes: {
      cbhpm: '3.04.06.03-1',
      tuss: '30406031',
      sus: '0408050187',
    },
    values: {
      cbhpm: 950.00,
      tuss: 850.00,
      sus: 280.00,
    },
    region: 'mao',
    type: 'cirurgico',
    anestheticPort: '4C',
    uco: 2,
    surgicalTime: 30,
    description: 'Descompressão cirúrgica do nervo mediano no túnel do carpo por via aberta ou endoscópica.',
    cids: ['G56.0'],
    keywords: ['túnel', 'carpo', 'síndrome', 'mediano', 'mão', 'parestesia'],
  },
  {
    id: '14',
    name: 'Correção de Hálux Valgo',
    codes: {
      cbhpm: '3.04.08.18-4',
      tuss: '30408184',
      sus: '0408050209',
    },
    values: {
      cbhpm: 1600.00,
      tuss: 1450.00,
      sus: 420.00,
    },
    region: 'pe',
    type: 'cirurgico',
    anestheticPort: '5C',
    uco: 3,
    surgicalTime: 60,
    description: 'Correção cirúrgica de deformidade do hálux valgo (joanete) por osteotomia e realinhamento.',
    cids: ['M20.1'],
    keywords: ['hálux', 'valgo', 'joanete', 'pé', 'osteotomia', 'bunionectomia'],
  },
  {
    id: '15',
    name: 'Fixação Percutânea de Coluna',
    codes: {
      cbhpm: '3.01.03.25-0',
      tuss: '30103250',
      sus: '0408050225',
    },
    values: {
      cbhpm: 5500.00,
      tuss: 5200.00,
      sus: 1400.00,
    },
    region: 'coluna',
    type: 'cirurgico',
    anestheticPort: '11C',
    uco: 12,
    surgicalTime: 180,
    description: 'Fixação percutânea da coluna vertebral com parafusos pediculares para tratamento de fraturas ou instabilidade.',
    cids: ['S22.0', 'S32.0', 'M48.5'],
    keywords: ['fixação', 'percutânea', 'coluna', 'parafuso', 'pedicular', 'fratura'],
  },
];

export function searchProcedures(query: string, filters?: {
  table?: 'CBHPM' | 'TUSS' | 'SUS';
  region?: string;
  type?: string;
}): Procedure[] {
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return procedures.filter(procedure => {
    // Search in name, keywords, codes, and CIDs
    const searchableText = [
      procedure.name,
      ...procedure.keywords,
      procedure.codes.cbhpm,
      procedure.codes.tuss,
      procedure.codes.sus,
      ...procedure.cids,
      procedure.description,
    ].join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const matchesQuery = !query || searchableText.includes(normalizedQuery);

    // Apply filters
    const matchesRegion = !filters?.region || procedure.region === filters.region;
    const matchesType = !filters?.type || procedure.type === filters.type;

    return matchesQuery && matchesRegion && matchesType;
  });
}

export function getProcedureById(id: string): Procedure | undefined {
  return procedures.find(p => p.id === id);
}
