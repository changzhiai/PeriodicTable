
const fs = require('fs');
const path = require('path');

// Read the files
const elementsDataPath = path.join(__dirname, '../elementsData.js');
const periodicTableJsonPath = path.join(__dirname, '../periodic_table_full.json');

const elementsDataContent = fs.readFileSync(elementsDataPath, 'utf8');
const periodicTableJson = JSON.parse(fs.readFileSync(periodicTableJsonPath, 'utf8'));

// Extract the elements array from elementsData.js
// This regex tries to capture the array content. It assumes the file structure matches "export const elements = [...]"
const elementsMatch = elementsDataContent.match(/export const elements = (\[[\s\S]*\])/);

if (!elementsMatch) {
    console.error('Could not find elements array in elementsData.js');
    process.exit(1);
}

let elementsArray;
try {
    // Use eval to safely parse the array string if it's valid JS simplified structure, 
    // or more robustly, since it's a JS file, we might need to be careful with eval.
    // Given it's a data file, let's treat it as JSON-like if possible, but keys aren't quoted.
    // We can just iterate the JSON and construct a replacement map.

    // Strategy: Don't parse the JS. Instead, iterate through the JSON elements, 
    // find the corresponding block in the JS file using regex, and replace the summary.

} catch (e) {
    console.error('Error parsing elements data');
}

let newFileContent = elementsDataContent;

periodicTableJson.elements.forEach(jsonElement => {
    // Find the element in the file content based on atomic number "n": X,
    // We look for a block that has `n: ${jsonElement.number},`
    const regex = new RegExp(`(\\s+"n":\\s*${jsonElement.number},[\\s\\S]*?"summary":\\s*")(.*?)(")`, 'g');

    if (newFileContent.match(regex)) {
        // Construct new summary
        let newSummary = jsonElement.summary;
        // Escape quotes
        newSummary = newSummary.replace(/"/g, '\\"');

        // Add naming info if available
        if (jsonElement.named_by) {
            newSummary += ` It was named by ${jsonElement.named_by}.`;
        }

        // Add discovery info if available (and not already in summary ideally, but simple append is safer)
        // Check if summary already mentions discovered by to avoid weird duplications
        // But the user specifically asked for "where the element was discovered" which often isn't in JSON...
        // Wait, the JSON has "discovered_by". The user asked for "where". The JSON doesn't provide "where" (location). 
        // It provides "discovered_by". I will assume "where" implies "by whom/context" or I'll just add the "named by".
        // The user request: "add where the element was discovered, and what the name comes from"
        // The JSON has "named_by". It does NOT have "name_origin" or "place_of_discovery".
        // HOWEVER, the summary often contains etymology ("Carbon (from Latin: carbo 'coal')...").

        // Let's just update the summary with the one from the JSON which is often richer, plus specific fields.

        newFileContent = newFileContent.replace(regex, `$1${newSummary}$3`);
    } else {
        // console.log(`Element ${jsonElement.name} not found or summary format mismatch.`);
    }
});

// Write structure back
// Note: This is an approximation. A robust AST transformation would be better but this is a script.
// Let's try to just write a new file fully if we can parse the original.
// Actually, let's just replace the specific field "summary" for each element.

// Improved Strategy:
// 1. Parse the text of elementsData.js element by element? No, too complex string parsing.
// 2. Just match the summary line for each element number.

// Let's loop through lines.
const lines = elementsDataContent.split('\n');
let currentElementNumber = 0;

const newLines = lines.map(line => {
    // Check if line indicates start of new element with atomic number
    const nMatch = line.match(/"n":\s*(\d+),/);
    if (nMatch) {
        currentElementNumber = parseInt(nMatch[1]);
        return line;
    }

    // Check if line is summary
    if (line.trim().startsWith('"summary":')) {
        const jsonEl = periodicTableJson.elements.find(e => e.number === currentElementNumber);
        if (jsonEl) {
            let summary = jsonEl.summary;

            // Check for Etymology in summary text itself usually...
            // Append named_by if exists
            if (jsonEl.named_by) {
                summary += ` Named by ${jsonEl.named_by}.`;
            }
            // User asked "where discovered" and "name comes from".
            // "Name comes from" is often in the summary start (e.g. "Hydrogen (from Greek...)").
            // "Where discovered" is not in this JSON. I can only provide "Discovered by".

            // Escape double quotes for JS string
            summary = summary.replace(/"/g, '\\"');

            return `    "summary": "${summary}",`;
        }
    }
    return line;
});

fs.writeFileSync(elementsDataPath, newLines.join('\n'));
console.log('Summaries updated.');
