
const fs = require('fs');
const path = require('path');

// Read the files
const elementsDataPath = path.join(__dirname, '../elementsData.js');
const periodicTableJsonPath = path.join(__dirname, '../periodic_table_full.json');

const elementsDataContent = fs.readFileSync(elementsDataPath, 'utf8');
const periodicTableJson = JSON.parse(fs.readFileSync(periodicTableJsonPath, 'utf8'));

// Regular expression to match the "n": value
const nRegex = /"n":\s*(\d+)/;

let currentN = null;

// Split by line to process line by line
const lines = elementsDataContent.split('\n');
const newLines = lines.map(line => {

    const match = line.match(nRegex);
    if (match) {
        currentN = parseInt(match[1]);
    }

    if (currentN !== null && line.trim().startsWith('"summary":')) {
        const element = periodicTableJson.elements.find(e => e.number === currentN);
        if (element) {
            let summary = element.summary;
            if (element.named_by) {
                summary += ` Named by ${element.named_by}.`;
            }
            // Cleaning quotes - CRITICAL: escape quotes properly
            summary = summary.replace(/"/g, '\\"');
            // Also escape newlines if any
            summary = summary.replace(/\n/g, ' ');

            return `    "summary": "${summary}",`;
        }
    }
    return line;
});

// Write to a NEW file first to verify
const testPath = path.join(__dirname, '../elementsData_new.js');
fs.writeFileSync(testPath, newLines.join('\n'));
console.log('Done writing to elementsData_new.js');
