
const fs = require('fs');
const path = require('path');

function parseMarkdownFile(filename) {
  const content = fs.readFileSync(path.join(__dirname, 'public', filename), 'utf8');
  const lines = content.split('\n').map(line => line.trim());
  const motivos = [];
  let currentMotivo = '';
  
  for (const line of lines) {
    if (line.startsWith('##') || line.length === 0) {
      if (currentMotivo) {
        motivos.push(currentMotivo.replace(/\s+/g, ' ').trim());
        currentMotivo = '';
      }
    } else if (line.startsWith('Porque') || line.startsWith('Eu te amo')) {
      if (currentMotivo) {
        motivos.push(currentMotivo.replace(/\s+/g, ' ').trim());
      }
      currentMotivo = line;
    } else {
      if (currentMotivo) {
        currentMotivo += ' ' + line;
      }
    }
  }
  
  if (currentMotivo) {
    motivos.push(currentMotivo.replace(/\s+/g, ' ').trim());
  }
  
  console.log(`✅ ${filename} -> ${motivos.length} motivos`);
  return motivos;
}

const homensMulheres = parseMarkdownFile('365-motivos para te amar- Homem entregar para Mulher.md');
const mulheresHomens = parseMarkdownFile('365-motivos para te amar- Mulher entregar para o Homem.md');
const amorProprio = parseMarkdownFile('365-motivos amor proprio.md');

const data = {
  'h-m': homensMulheres,
  'm-h': mulheresHomens,
  'amor-proprio': amorProprio,
};

fs.writeFileSync(
  path.join(__dirname, 'lib', 'motivos-completos.json'),
  JSON.stringify(data, null, 2)
);

console.log('\n✅ Arquivo salvo em lib/motivos-completos.json');
console.log('\nResumo final:');
console.log(`- Homem → Mulher: ${homensMulheres.length}`);
console.log(`- Mulher → Homem: ${mulheresHomens.length}`);
console.log(`- Amor Próprio: ${amorProprio.length}`);
