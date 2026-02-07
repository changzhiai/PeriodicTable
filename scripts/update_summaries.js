import { aiSummaries } from '../src/elementsInfo.js';
import { elements } from '../src/elementsData.js';
import fs from 'fs';

// Function to extract brief introduction (first sentence) from aiSummaries
function extractBriefIntro(fullSummary) {
    if (!fullSummary) return '';

    // Find the first period that ends a sentence (before "Key details")
    const keyDetailsIndex = fullSummary.indexOf('Key details');
    if (keyDetailsIndex === -1) return fullSummary;

    // Get everything before "Key details"
    const intro = fullSummary.substring(0, keyDetailsIndex).trim();

    // Return the introduction
    return intro;
}

// Update elements with brief introductions
const updatedElements = elements.map(element => {
    const elementName = element.name;
    const fullSummary = aiSummaries[elementName];

    if (fullSummary) {
        const briefIntro = extractBriefIntro(fullSummary);
        return {
            ...element,
            summary: briefIntro
        };
    }

    return element;
});

// Generate the output file content
const output = `export const elements = ${JSON.stringify(updatedElements, null, 2)};
`;

// Write to file
fs.writeFileSync('./src/elementsData.js', output, 'utf-8');

console.log('✅ Successfully updated elementsData.js with brief introductions from elementsInfo.js');
console.log(`Updated ${updatedElements.length} elements`);
