
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse').default;

async function extractAndParsePDF(pdfName) {
  const pdfPath = path.join(__dirname, 'public', pdfName);
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;
  console.log(`\n📄 ${pdfName} - Texto extraído (${text.length} caracteres)`);
  
  // Parse motives - look for numbered items or "Porque" / "Eu te amo"
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const motivos = [];
  let current = '';
  let isMotivo = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if line starts with a number followed by . or )
    const numMatch = trimmed.match(/^(\d+)[\.\)]\s*(.*)/);
    if (numMatch) {
      if (current) {
        motivos.push(current.replace(/\s+/g, ' ').trim());
      }
      current = numMatch[2];
      isMotivo = true;
    } else if (trimmed.startsWith('Porque') || trimmed.startsWith('Eu te amo')) {
      if (current) {
        motivos.push(current.replace(/\s+/g, ' ').trim());
      }
      current = trimmed;
      isMotivo = true;
    } else if (isMotivo && trimmed.length > 0) {
      current += ' ' + trimmed;
    }
  }
  if (current) {
    motivos.push(current.replace(/\s+/g, ' ').trim());
  }
  
  console.log(`✅ ${motivos.length} motivos encontrados`);
  return motivos;
}

async function main() {
  console.log('🔍 Extraindo conteúdo dos PDFs...');
  
  const [homemMulher, mulherHomem, amorProprio] = await Promise.all([
    extractAndParsePDF('00000015-365-motivos para te amar- Homem entregar para Mulher.pdf'),
    extractAndParsePDF('00000016-365-motivos para te amar- Mulher entregar para o Homem.pdf'),
    extractAndParsePDF('00000017-250-motivos amor proprio.pdf'),
  ]);
  
  const result = {
    'h-m': homemMulher,
    'm-h': mulherHomem,
    'amor-proprio': amorProprio,
  };
  
  console.log('\n📊 Resumo:');
  console.log(`   Homem → Mulher: ${homemMulher.length} motivos`);
  console.log(`   Mulher → Homem: ${mulherHomem.length} motivos`);
  console.log(`   Amor Próprio: ${amorProprio.length} motivos`);
  
  // Save to JSON file
  fs.writeFileSync(
    path.join(__dirname, 'motivos-completos.json'),
    JSON.stringify(result, null, 2)
  );
  
  console.log('\n✅ Dados completos salvos em motivos-completos.json');
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
