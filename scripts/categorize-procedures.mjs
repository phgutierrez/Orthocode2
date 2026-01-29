#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Categorização por tipo de procedimento
const TYPE_PATTERNS = {
  cirurgico: [
    /cirurg/i,
    /operatório/i,
    /artroscopi/i,
    /artroplasti/i,
    /osteotomi/i,
    /fixaç[ãa]o/i,
    /implante/i,
    /prótese/i,
    /enxerto/i,
    /redução/i,
    /amputaç[ãa]o/i,
    /ressecç[ãa]o/i,
    /artrodese/i,
    /meniscectomi/i,
    /laminectomi/i,
    /discectomi/i,
    /reconstrução/i,
    /transplante/i,
    /sutura/i,
    /reparo/i,
    /exérese/i,
    /drenagem cirúrgica/i,
    /biópsia cirúrgica/i,
    /coleta de enxerto/i,
    /descolamento/i,
    /retirada cirúrgica/i,
  ],
  diagnostico: [
    /radiografi/i,
    /tomografi/i,
    /ressonância/i,
    /ultrassom/i,
    /ultrassonografi/i,
    /raio.?x/i,
    /doppler/i,
    /cintilografi/i,
    /densitometri/i,
    /ecocardiogram/i,
    /eletrocardiogram/i,
    /eletroencefalo/i,
    /endoscopi/i,
    /colonoscopi/i,
    /broncoscopi/i,
    /laringoscopi/i,
    /exame/i,
    /diagnóstico/i,
    /avaliação/i,
    /análise/i,
    /teste/i,
    /screening/i,
    /monitorização/i,
    /holter/i,
    /mapa/i,
    /biópsia percutânea/i,
    /punção/i,
    /cultura/i,
    /antibiograma/i,
  ],
  ambulatorial: [
    /consulta/i,
    /retorno/i,
    /visita/i,
    /atendimento/i,
    /curativos?/i,
    /infiltração/i,
    /aplicação/i,
    /injeção/i,
    /medicação/i,
    /imobilização/i,
    /gesso/i,
    /tala/i,
    /fisioterapi/i,
    /reabilitação/i,
    /orientação/i,
    /acompanhamento/i,
    /remoção de pontos/i,
    /remoção de dreno/i,
    /pequena cirurgia/i,
    /procedimento ambulatorial/i,
  ],
};

// Categorização por região anatômica (ortopedia)
const REGION_PATTERNS = {
  coluna: [
    /coluna/i,
    /vertebr/i,
    /cervical/i,
    /dorsal/i,
    /lombar/i,
    /sacral/i,
    /espinhal/i,
    /disco intervertebral/i,
    /laminectomi/i,
    /discectomi/i,
    /artrodese vertebral/i,
    /escoliose/i,
    /cifose/i,
    /lordose/i,
  ],
  ombro: [
    /ombro/i,
    /clavícula/i,
    /escapul/i,
    /acrômio/i,
    /glenoumeral/i,
    /manguito rotador/i,
    /supraespinhal/i,
    /infraespinhal/i,
    /subescapular/i,
    /bíceps braquial/i,
    /acromioclavicular/i,
    /esternoclavicular/i,
  ],
  cotovelo: [
    /cotovelo/i,
    /úmero distal/i,
    /radio proximal/i,
    /ulna proximal/i,
    /olécrano/i,
    /epicôndilo/i,
    /epitróclea/i,
    /radioulnar proximal/i,
  ],
  'mao-punho': [
    /mão/i,
    /punho/i,
    /carpo/i,
    /metacarpo/i,
    /falange/i,
    /dedo/i,
    /polegar/i,
    /rádio distal/i,
    /ulna distal/i,
    /escafoide/i,
    /semilunar/i,
    /piramidal/i,
    /trapézio/i,
    /trapezoide/i,
    /capitato/i,
    /hamato/i,
    /radioulnar distal/i,
    /radiocárpica/i,
  ],
  quadril: [
    /quadril/i,
    /coxofemoral/i,
    /acetábulo/i,
    /fêmur proximal/i,
    /colo femoral/i,
    /cabeça femoral/i,
    /trocanter/i,
    /pelve/i,
    /pélvic/i,
    /ilíaco/i,
    /ísquio/i,
    /púbis/i,
    /sínfise púbica/i,
    /sacroilíaca/i,
  ],
  joelho: [
    /joelho/i,
    /fêmur distal/i,
    /tíbia proximal/i,
    /patela/i,
    /menisco/i,
    /ligamento cruzado/i,
    /ligamento colateral/i,
    /femoropatelar/i,
    /femorotibial/i,
    /tibiofibular proximal/i,
  ],
  'tornozelo-pe': [
    /tornozelo/i,
    /pé/i,
    /tíbia distal/i,
    /fíbula distal/i,
    /talo/i,
    /calcâneo/i,
    /navicular/i,
    /cuboide/i,
    /cuneiforme/i,
    /metatarso/i,
    /hálux/i,
    /artelho/i,
    /tendão de aquiles/i,
    /tibiotársica/i,
    /subtalar/i,
  ],
  'membros-inferiores': [
    /fêmur(?! proximal| distal)/i,
    /tíbia(?! proximal| distal)/i,
    /fíbula(?! proximal| distal)/i,
    /coxa/i,
    /perna/i,
    /membro inferior/i,
  ],
  'membros-superiores': [
    /úmero(?! proximal| distal)/i,
    /antebraço/i,
    /rádio(?! proximal| distal)/i,
    /ulna(?! proximal| distal)/i,
    /braço/i,
    /membro superior/i,
  ],
};

function categorizeType(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  
  // Cirúrgico tem prioridade se houver palavras-chave específicas
  for (const pattern of TYPE_PATTERNS.cirurgico) {
    if (pattern.test(text)) {
      return 'cirurgico';
    }
  }
  
  // Depois diagnóstico
  for (const pattern of TYPE_PATTERNS.diagnostico) {
    if (pattern.test(text)) {
      return 'diagnostico';
    }
  }
  
  // Por fim ambulatorial
  for (const pattern of TYPE_PATTERNS.ambulatorial) {
    if (pattern.test(text)) {
      return 'ambulatorial';
    }
  }
  
  // Default: ambulatorial (consultas, atendimentos gerais)
  return 'ambulatorial';
}

function categorizeRegion(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  
  // Priorizar regiões mais específicas primeiro
  // Verificar joelho antes de membros inferiores
  if (REGION_PATTERNS.joelho.some(p => p.test(text))) {
    return 'joelho';
  }
  
  // Verificar ombro antes de membros superiores
  if (REGION_PATTERNS.ombro.some(p => p.test(text))) {
    return 'ombro';
  }
  
  // Verificar cotovelo
  if (REGION_PATTERNS.cotovelo.some(p => p.test(text))) {
    return 'cotovelo';
  }
  
  // Verificar mão-punho
  if (REGION_PATTERNS['mao-punho'].some(p => p.test(text))) {
    return 'mao-punho';
  }
  
  // Verificar quadril
  if (REGION_PATTERNS.quadril.some(p => p.test(text))) {
    return 'quadril';
  }
  
  // Verificar tornozelo-pé
  if (REGION_PATTERNS['tornozelo-pe'].some(p => p.test(text))) {
    return 'tornozelo-pe';
  }
  
  // Verificar coluna
  if (REGION_PATTERNS.coluna.some(p => p.test(text))) {
    return 'coluna';
  }
  
  // Verificar membros inferiores genéricos
  if (REGION_PATTERNS['membros-inferiores'].some(p => p.test(text))) {
    return 'membros-inferiores';
  }
  
  // Verificar membros superiores genéricos
  if (REGION_PATTERNS['membros-superiores'].some(p => p.test(text))) {
    return 'membros-superiores';
  }
  
  // Default: outros
  return 'outros';
}

async function main() {
  console.log('🔍 Analisando procedimentos...\n');
  
  const inputPath = path.join(__dirname, '../public/data/procedures.json');
  const outputPath = path.join(__dirname, '../public/data/procedures.json');
  
  // Ler arquivo
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`📊 Total de procedimentos: ${data.length}\n`);
  
  // Estatísticas
  const stats = {
    type: {
      cirurgico: 0,
      ambulatorial: 0,
      diagnostico: 0,
    },
    region: {
      coluna: 0,
      ombro: 0,
      cotovelo: 0,
      'mao-punho': 0,
      quadril: 0,
      joelho: 0,
      'tornozelo-pe': 0,
      'membros-inferiores': 0,
      'membros-superiores': 0,
      outros: 0,
    },
  };
  
  // Categorizar cada procedimento
  const categorized = data.map((proc, index) => {
    const newType = categorizeType(proc.name, proc.description || '');
    const newRegion = categorizeRegion(proc.name, proc.description || '');
    
    stats.type[newType]++;
    stats.region[newRegion]++;
    
    // Mostrar progresso
    if ((index + 1) % 1000 === 0) {
      console.log(`✅ Processados ${index + 1} / ${data.length}`);
    }
    
    return {
      ...proc,
      type: newType,
      region: newRegion,
    };
  });
  
  console.log('\n✅ Categorização concluída!\n');
  
  // Mostrar estatísticas
  console.log('📊 ESTATÍSTICAS POR TIPO:');
  console.log('─'.repeat(40));
  for (const [type, count] of Object.entries(stats.type)) {
    const percentage = ((count / data.length) * 100).toFixed(1);
    console.log(`  ${type.padEnd(15)}: ${count.toString().padStart(5)} (${percentage}%)`);
  }
  
  console.log('\n📊 ESTATÍSTICAS POR REGIÃO:');
  console.log('─'.repeat(40));
  for (const [region, count] of Object.entries(stats.region)) {
    const percentage = ((count / data.length) * 100).toFixed(1);
    console.log(`  ${region.padEnd(20)}: ${count.toString().padStart(5)} (${percentage}%)`);
  }
  
  // Salvar arquivo
  fs.writeFileSync(outputPath, JSON.stringify(categorized, null, 2));
  console.log(`\n💾 Arquivo salvo em: ${outputPath}`);
  
  // Mostrar exemplos
  console.log('\n📋 EXEMPLOS DE CATEGORIZAÇÕES:');
  console.log('─'.repeat(60));
  
  const cirurgicos = categorized.filter(p => p.type === 'cirurgico').slice(0, 3);
  console.log('\n🔪 CIRÚRGICOS:');
  cirurgicos.forEach(p => {
    console.log(`  • ${p.name.substring(0, 50)}...`);
    console.log(`    Região: ${p.region}`);
  });
  
  const diagnosticos = categorized.filter(p => p.type === 'diagnostico').slice(0, 3);
  console.log('\n🔬 DIAGNÓSTICOS:');
  diagnosticos.forEach(p => {
    console.log(`  • ${p.name.substring(0, 50)}...`);
    console.log(`    Região: ${p.region}`);
  });
  
  const ambulatoriais = categorized.filter(p => p.type === 'ambulatorial').slice(0, 3);
  console.log('\n🏥 AMBULATORIAIS:');
  ambulatoriais.forEach(p => {
    console.log(`  • ${p.name.substring(0, 50)}...`);
    console.log(`    Região: ${p.region}`);
  });
  
  console.log('\n✨ Processo concluído com sucesso!\n');
}

main().catch(console.error);
