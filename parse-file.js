
// This will help us parse the file properly
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', '365-motivos para te amar- Homem entregar para Mulher.md');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n').map(line => line.trim()).filter(line => line);

const motivos = [];
let current = '';

for (const line of lines) {
    if (line.startsWith('##')) {
        continue;
    }
    if (line.startsWith('Porque')) {
        if (current) {
            motivos.push(current.replace(/\s+/g, ' ').trim());
        }
        current = line;
    } else {
        if (current) {
            current += ' ' + line;
        }
    }
}

if (current) {
    motivos.push(current.replace(/\s+/g, ' ').trim());
}

console.log('Found', motivos.length, 'motives');
console.log(motivos.slice(0, 5));

fs.writeFileSync(path.join(__dirname, 'lib', 'motivos-list.json'), JSON.stringify(motivos, null, 2));
