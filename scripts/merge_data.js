import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import { rawElements } from './rawElements.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.resolve(__dirname, '../src/pTable.csv');
const csvFile = fs.readFileSync(csvPath, 'utf8');

Papa.parse(csvFile, {
    header: true,
    complete: (results) => {
        const csvData = results.data;

        const mergedElements = rawElements.map(el => {
            const csvRow = csvData.find(row => parseInt(row.atomic_number) === el.n);

            if (csvRow) {
                return {
                    ...el,
                    atomicMass: csvRow.atomic_mass ? parseFloat(csvRow.atomic_mass) : el.m,
                    boilingPoint: csvRow.boiling_point ? parseFloat(csvRow.boiling_point) : null,
                    density: csvRow['density/stp'] ? parseFloat(csvRow['density/stp']) : null,
                    meltingPoint: csvRow.melting_point ? parseFloat(csvRow.melting_point) : el.melt, // Use CSV melt if available, else existing
                    atomicRadius: csvRow['radius/empirical'] ? parseFloat(csvRow['radius/empirical']) : null,
                    covalentRadius: csvRow['radius/covalent'] ? parseFloat(csvRow['radius/covalent']) : null,
                    electronegativity: csvRow.electronegativity_pauling ? parseFloat(csvRow.electronegativity_pauling) : null,
                    ionizationEnergy: csvRow['ionization_energies/0'] ? parseFloat(csvRow['ionization_energies/0']) : null,
                    electronAffinity: csvRow.electron_affinity ? parseFloat(csvRow.electron_affinity) : null,
                    oxidationStates: csvRow.oxidation_states || null,
                    crystalStructure: csvRow.crystal_structure || null,
                    latticeConstants: csvRow.lattice_constants || null,
                    latticeAngles: csvRow.lattice_angles || null,
                    electronConfiguration: csvRow.electron_configuration || null,
                    electronConfigurationSemantic: csvRow.electron_configuration_semantic || null,
                    discoveredBy: csvRow['discovered/by'] || null,
                    discoveryYear: csvRow['discovered/year'] || null,
                    block: csvRow.block || null,
                    appearance: csvRow.appearance || null,
                    specificHeat: csvRow['heat/specific'] ? parseFloat(csvRow['heat/specific']) : null,
                    thermalConductivity: csvRow['conductivity/thermal'] ? parseFloat(csvRow['conductivity/thermal']) : null,
                };
            }
            return el;
        });

        const outputPath = path.resolve(__dirname, '../src/elementsData.js');
        const fileContent = `export const elements = ${JSON.stringify(mergedElements, null, 2)};`;

        fs.writeFileSync(outputPath, fileContent);
        console.log(`Successfully wrote to ${outputPath}`);
    },
    error: (err) => {
        console.error('Error parsing CSV:', err);
    }
});
