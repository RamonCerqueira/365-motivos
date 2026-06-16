
const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extractTextFromPDF(pdfPath) {
  const dataBuffer = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data: dataBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

async function main() {
  const pdfFiles = [
    { file: '00000015-365-motivos para te amar- Homem entregar para Mulher.pdf', key: 'h-m' },
    { file: '00000016-365-motivos para te amar- Mulher entregar para o Homem.pdf', key: 'm-h' },
    { file: '00000017-250-motivos amor proprio.pdf', key: 'amor-proprio' }
  ];

  const motivesData = {};

  for (const pdfFile of pdfFiles) {
    console.log(`Extracting: ${pdfFile.file}`);
    const fullPath = path.join(__dirname, 'public', pdfFile.file);
    const text = await extractTextFromPDF(fullPath);
    console.log(`Extracted ${text.length} characters!`);

    // Parse motives
    const motives = [];
    const lines = text.split(/\n|\r/).map(line => line.trim()).filter(line => line.length > 0);
    let currentMotivo = '';
    
    for (const line of lines) {
      // Check for numbered items (1., 2., etc.)
      const numMatch = line.match(/^(\d{1,3})[.\)]\s*(.*)/);
      if (numMatch) {
        if (currentMotivo) {
          motives.push(currentMotivo.replace(/\s+/g, ' ').trim());
        }
        currentMotivo = numMatch[2];
      } else if (line.startsWith('Porque') || line.startsWith('Eu te amo')) {
        if (currentMotivo) {
          motives.push(currentMotivo.replace(/\s+/g, ' ').trim());
        }
        currentMotivo = line;
      } else if (currentMotivo) {
        currentMotivo += ' ' + line;
      }
    }
    
    if (currentMotivo) {
      motives.push(currentMotivo.replace(/\s+/g, ' ').trim());
    }
    
    motivesData[pdfFile.key] = motives;
    console.log(`Found ${motives.length} motives for ${pdfFile.key}`);
  }
  
  // Save to file
  fs.writeFileSync(path.join(__dirname, 'lib', 'motives.json'), JSON.stringify(motivesData, null, 2));
  console.log(`\n✅ Saved to lib/motives.json!`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
