// Temporary script to parse the motives
import fs from 'fs';
import path from 'path';

// Read the file
const filePath = path.join(__dirname, 'public', '00000015-365-motivos para te amar- Homem entregar para Mulher.md');
const content = fs.readFileSync(filePath, 'utf-8');

// Extract lines that start with "Porque" (but not the ## lines)
const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('##') && !line.startsWith('_MConverter'));

// Let's find all the lines starting with "Porque"
const motivos: string[] = [];
let currentMotivo = '';

for (const line of lines) {
    if (line.startsWith('Porque')) {
        if (currentMotivo) {
            motivos.push(currentMotivo.trim());
        }
        currentMotivo = line;
    } else if (currentMotivo) {
        // If the line is not starting with "Porque" but we have a current one, check if it's continuation
        // Check if it's a short line (not a header etc.)
        if (line.length > 0 && line.length < 100 && !line.startsWith('Escolha')) {
            currentMotivo += ' ' + line;
        }
    }
}
if (currentMotivo) {
    motivos.push(currentMotivo.trim());
}

console.log('Found', motivos.length, 'motives');
console.log('First 5:', motivos.slice(0, 5));
console.log('Last 5:', motivos.slice(-5));

// Also, let's clean them up
const cleanedMotivos = motivos.map(m => m.replace(/\s+/g, ' ').trim());

console.log('Cleaned first 5:', cleanedMotivos.slice(0, 5));

// Write to a temp file
fs.writeFileSync(path.join(__dirname, 'public', 'h-m-motives.txt'), cleanedMotivos.join('\n\n'));
