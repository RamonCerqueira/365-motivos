
const fs = require('fs');
const path = require('path');

async function main() {
  const pdfParse = require('pdf-parse');
  const pdfFiles = [
    '00000015-365-motivos para te amar- Homem entregar para Mulher.pdf',
    '00000016-365-motivos para te amar- Mulher entregar para o Homem.pdf',
    '00000017-250-motivos amor proprio.pdf'
  ];

  for (const pdfFile of pdfFiles) {
    const dataBuffer = fs.readFileSync(path.join(__dirname, 'public', pdfFile));
    const data = await pdfParse(dataBuffer);
    console.log(`\n=== ${pdfFile} ===`);
    console.log(`Total pages: ${data.numpages}`);
    console.log(`Text length: ${data.text.length}`);
    console.log('First 1000 characters:');
    console.log(data.text.substring(0, 1000));
  }
}

main().catch(err => console.error('Error:', err));
