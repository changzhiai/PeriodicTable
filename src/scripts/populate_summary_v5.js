
const fs = require('fs');
const path = require('path');

// Read the files
const elementsDataPath = path.join(__dirname, '../elementsData.js');
const periodicTableJsonPath = path.join(__dirname, '../periodic_table_full.json');

const elementsDataContent = fs.readFileSync(elementsDataPath, 'utf8');
const periodicTableJson = JSON.parse(fs.readFileSync(periodicTableJsonPath, 'utf8'));

// Splitting by lines
const lines = elementsDataContent.split('\n');
const newLines = [];
let nVal = null;

// Iterate and replace
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for Atomic Number "n": X
    const nMatch = line.match(/"n":\s*(\d+)/);
    if (nMatch) {
        nVal = parseInt(nMatch[1]);
    }

    // Explicitly check if the line contains "summary":
    // The previous regex might have been too strict or line handling weird
    if (line.includes('"summary":')) {
        const jsonEl = periodicTableJson.elements.find(e => e.number === nVal);
        if (jsonEl) {
            let summary = jsonEl.summary;

            // Add named_by info if exists
            if (jsonEl.named_by) {
                summary += ` Named by ${jsonEl.named_by}.`;
            }
            // Escape double quotes
            summary = summary.replace(/"/g, '\\"');
            // Remove newlines
            summary = summary.replace(/\r?\n|\r/g, ' ');

            newLines.push(`    "summary": "${summary}",`);
        } else {
            // If we can't find it in JSON, keep original
            newLines.push(line);
        }
    } else {
        newLines.push(line);
    }
}

const outputPath = path.join(__dirname, '../elementsData.js');
fs.writeFileSync(outputPath, newLines.join('\n'));
console.log('Successfully updated elementsData.js');
