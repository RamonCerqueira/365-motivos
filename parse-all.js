
const fs = require('fs');
const path = require('path');

// Read each markdown file
const readAndParse = (filename) => {
    const content = fs.readFileSync(path.join(__dirname, 'public', filename), 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const motivos = [];
    let current = '';
    for (const line of lines) {
        if (line.startsWith('##')) continue;
        if (line.startsWith('Porque') || line.startsWith('Eu te amo')) {
            if (current) motivos.push(current.replace(/\s+/g, ' ').trim());
            current = line;
        } else if (line.length < 200 && current) {
            current += ' ' + line;
        }
    }
    if (current) motivos.push(current.replace(/\s+/g, ' ').trim());
    console.log(`\n${filename}: ${motivos.length} motivos`);
    return motivos;
};

const hM = readAndParse('365-motivos para te amar- Homem entregar para Mulher.md');
const mH = readAndParse('365-motivos para te amar- Mulher entregar para o Homem.md');
const amorProprio = readAndParse('365-motivos amor proprio.md');

console.log('\n---');
console.log('Total de h-m:', hM.length);
console.log('Total de m-h:', mH.length);
console.log('Total de amor-próprio:', amorProprio.length);

fs.writeFileSync(path.join(__dirname, 'parsed-motives.json'), JSON.stringify({
    'h-m': hM,
    'm-h': mH,
    'amor-proprio': amorProprio
}, null, 2));

console.log('\n✅ Parsed data saved to parsed-motives.json');
