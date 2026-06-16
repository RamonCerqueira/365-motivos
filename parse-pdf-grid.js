const fs = require('fs');
const path = require('path');

async function parsePDF(pdfName) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.join('e:/PROJETOS/365/public', pdfName);
  const dataBuffer = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data: dataBuffer }).promise;
  
  const motives = new Map();
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Group items by grid cell
    // cell key: `${col}-${row}`
    const cells = {};
    
    for (const item of textContent.items) {
      const str = item.str.trim();
      // Skip empty strings
      if (!str) continue;
      
      const x = item.transform[4];
      const y = item.transform[5];
      
      // Classify column
      let col = -1;
      if (x < 250) col = 0;
      else if (x < 520) col = 1;
      else col = 2;
      
      // Classify row
      let row = -1;
      if (y >= 500) row = 0;
      else if (y >= 400) row = 1;
      else if (y >= 300) row = 2;
      else if (y >= 200) row = 3;
      else if (y >= 100) row = 4;
      else row = 5;
      
      const cellKey = `${col}-${row}`;
      if (!cells[cellKey]) {
        cells[cellKey] = [];
      }
      cells[cellKey].push({ str, x, y });
    }
    
    // Process each cell
    for (const cellKey in cells) {
      const items = cells[cellKey];
      // Find the card number in this cell
      let cardNum = null;
      const textParts = [];
      
      for (const item of items) {
        const cleanStr = item.str.replace(/\s+/g, '');
        if (/^\d+$/.test(cleanStr)) {
          cardNum = parseInt(cleanStr, 10);
        } else {
          textParts.push(item.str);
        }
      }
      
      // If we have a card number and text parts, concatenate the text
      if (cardNum !== null && textParts.length > 0) {
        // Concatenate text parts
        const fullText = textParts.join(' ').replace(/\s+/g, ' ').trim();
        
        // Skip header instructions if they somehow got in
        if (fullText.includes("Escolha uma opção e cole no seu potinho")) {
          continue;
        }
        
        motives.set(cardNum, fullText);
      }
    }
  }
  
  // Sort by card number
  const sortedKeys = Array.from(motives.keys()).sort((a, b) => a - b);
  const sortedMotives = sortedKeys.map(key => motives.get(key));
  
  console.log(`Parsed ${pdfName}: ${sortedMotives.length} motives (max number: ${sortedKeys[sortedKeys.length - 1]})`);
  return { motives: sortedMotives, keys: sortedKeys };
}

async function main() {
  const hm = await parsePDF('00000015-365-motivos para te amar- Homem entregar para Mulher.pdf');
  const mh = await parsePDF('00000016-365-motivos para te amar- Mulher entregar para o Homem.pdf');
  const ap = await parsePDF('00000017-250-motivos amor proprio.pdf');
  
  // Save to json
  const data = {
    'h-m': hm.motives,
    'm-h': mh.motives,
    'amor-proprio': ap.motives
  };
  
  fs.writeFileSync('e:/PROJETOS/365/lib/motivos-completos.json', JSON.stringify(data, null, 2));
  console.log('Saved to e:/PROJETOS/365/lib/motivos-completos.json');
}

main().catch(console.error);
