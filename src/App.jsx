import React, { useState, useMemo } from 'react';
import { Search, Atom, X, FlaskConical } from 'lucide-react';

// --- FULL ELEMENT DATASET ---
// Compressed structure for the example, expanded in logic
// x = group, y = period
const rawElements = [
  { n: 1, s: 'H', name: 'Hydrogen', m: 1.008, cat: 'diatomic nonmetal', x: 1, y: 1, summary: "Hydrogen is the lightest element. It is a colorless, odorless, tasteless, toxic, nonmetallic, highly combustible diatomic gas." },
  { n: 2, s: 'He', name: 'Helium', m: 4.0026, cat: 'noble gas', x: 18, y: 1, summary: "Helium is a colorless, odorless, tasteless, non-toxic, inert, monatomic gas, the first in the noble gas group in the periodic table." },
  { n: 3, s: 'Li', name: 'Lithium', m: 6.94, cat: 'alkali metal', x: 1, y: 2 },
  { n: 4, s: 'Be', name: 'Beryllium', m: 9.0122, cat: 'alkaline earth metal', x: 2, y: 2 },
  { n: 5, s: 'B', name: 'Boron', m: 10.81, cat: 'metalloid', x: 13, y: 2 },
  { n: 6, s: 'C', name: 'Carbon', m: 12.011, cat: 'polyatomic nonmetal', x: 14, y: 2 },
  { n: 7, s: 'N', name: 'Nitrogen', m: 14.007, cat: 'diatomic nonmetal', x: 15, y: 2 },
  { n: 8, s: 'O', name: 'Oxygen', m: 15.999, cat: 'diatomic nonmetal', x: 16, y: 2 },
  { n: 9, s: 'F', name: 'Fluorine', m: 18.998, cat: 'diatomic nonmetal', x: 17, y: 2 },
  { n: 10, s: 'Ne', name: 'Neon', m: 20.180, cat: 'noble gas', x: 18, y: 2 },
  { n: 11, s: 'Na', name: 'Sodium', m: 22.990, cat: 'alkali metal', x: 1, y: 3 },
  { n: 12, s: 'Mg', name: 'Magnesium', m: 24.305, cat: 'alkaline earth metal', x: 2, y: 3 },
  { n: 13, s: 'Al', name: 'Aluminium', m: 26.982, cat: 'post-transition metal', x: 13, y: 3 },
  { n: 14, s: 'Si', name: 'Silicon', m: 28.085, cat: 'metalloid', x: 14, y: 3 },
  { n: 15, s: 'P', name: 'Phosphorus', m: 30.974, cat: 'polyatomic nonmetal', x: 15, y: 3 },
  { n: 16, s: 'S', name: 'Sulfur', m: 32.06, cat: 'polyatomic nonmetal', x: 16, y: 3 },
  { n: 17, s: 'Cl', name: 'Chlorine', m: 35.45, cat: 'diatomic nonmetal', x: 17, y: 3 },
  { n: 18, s: 'Ar', name: 'Argon', m: 39.948, cat: 'noble gas', x: 18, y: 3 },
  { n: 19, s: 'K', name: 'Potassium', m: 39.098, cat: 'alkali metal', x: 1, y: 4 },
  { n: 20, s: 'Ca', name: 'Calcium', m: 40.078, cat: 'alkaline earth metal', x: 2, y: 4 },
  { n: 21, s: 'Sc', name: 'Scandium', m: 44.956, cat: 'transition metal', x: 3, y: 4 },
  { n: 22, s: 'Ti', name: 'Titanium', m: 47.867, cat: 'transition metal', x: 4, y: 4 },
  { n: 23, s: 'V', name: 'Vanadium', m: 50.942, cat: 'transition metal', x: 5, y: 4 },
  { n: 24, s: 'Cr', name: 'Chromium', m: 51.996, cat: 'transition metal', x: 6, y: 4 },
  { n: 25, s: 'Mn', name: 'Manganese', m: 54.938, cat: 'transition metal', x: 7, y: 4 },
  { n: 26, s: 'Fe', name: 'Iron', m: 55.845, cat: 'transition metal', x: 8, y: 4 },
  { n: 27, s: 'Co', name: 'Cobalt', m: 58.933, cat: 'transition metal', x: 9, y: 4 },
  { n: 28, s: 'Ni', name: 'Nickel', m: 58.693, cat: 'transition metal', x: 10, y: 4 },
  { n: 29, s: 'Cu', name: 'Copper', m: 63.546, cat: 'transition metal', x: 11, y: 4 },
  { n: 30, s: 'Zn', name: 'Zinc', m: 65.38, cat: 'transition metal', x: 12, y: 4 },
  { n: 31, s: 'Ga', name: 'Gallium', m: 69.723, cat: 'post-transition metal', x: 13, y: 4 },
  { n: 32, s: 'Ge', name: 'Germanium', m: 72.630, cat: 'metalloid', x: 14, y: 4 },
  { n: 33, s: 'As', name: 'Arsenic', m: 74.922, cat: 'metalloid', x: 15, y: 4 },
  { n: 34, s: 'Se', name: 'Selenium', m: 78.971, cat: 'polyatomic nonmetal', x: 16, y: 4 },
  { n: 35, s: 'Br', name: 'Bromine', m: 79.904, cat: 'diatomic nonmetal', x: 17, y: 4 },
  { n: 36, s: 'Kr', name: 'Krypton', m: 83.798, cat: 'noble gas', x: 18, y: 4 },
  { n: 37, s: 'Rb', name: 'Rubidium', m: 85.468, cat: 'alkali metal', x: 1, y: 5 },
  { n: 38, s: 'Sr', name: 'Strontium', m: 87.62, cat: 'alkaline earth metal', x: 2, y: 5 },
  { n: 39, s: 'Y', name: 'Yttrium', m: 88.906, cat: 'transition metal', x: 3, y: 5 },
  { n: 40, s: 'Zr', name: 'Zirconium', m: 91.224, cat: 'transition metal', x: 4, y: 5 },
  { n: 41, s: 'Nb', name: 'Niobium', m: 92.906, cat: 'transition metal', x: 5, y: 5 },
  { n: 42, s: 'Mo', name: 'Molybdenum', m: 95.95, cat: 'transition metal', x: 6, y: 5 },
  { n: 43, s: 'Tc', name: 'Technetium', m: 98, cat: 'transition metal', x: 7, y: 5 },
  { n: 44, s: 'Ru', name: 'Ruthenium', m: 101.07, cat: 'transition metal', x: 8, y: 5 },
  { n: 45, s: 'Rh', name: 'Rhodium', m: 102.91, cat: 'transition metal', x: 9, y: 5 },
  { n: 46, s: 'Pd', name: 'Palladium', m: 106.42, cat: 'transition metal', x: 10, y: 5 },
  { n: 47, s: 'Ag', name: 'Silver', m: 107.87, cat: 'transition metal', x: 11, y: 5 },
  { n: 48, s: 'Cd', name: 'Cadmium', m: 112.41, cat: 'transition metal', x: 12, y: 5 },
  { n: 49, s: 'In', name: 'Indium', m: 114.82, cat: 'post-transition metal', x: 13, y: 5 },
  { n: 50, s: 'Sn', name: 'Tin', m: 118.71, cat: 'post-transition metal', x: 14, y: 5 },
  { n: 51, s: 'Sb', name: 'Antimony', m: 121.76, cat: 'metalloid', x: 15, y: 5 },
  { n: 52, s: 'Te', name: 'Tellurium', m: 127.60, cat: 'metalloid', x: 16, y: 5 },
  { n: 53, s: 'I', name: 'Iodine', m: 126.90, cat: 'diatomic nonmetal', x: 17, y: 5 },
  { n: 54, s: 'Xe', name: 'Xenon', m: 131.29, cat: 'noble gas', x: 18, y: 5 },
  { n: 55, s: 'Cs', name: 'Cesium', m: 132.91, cat: 'alkali metal', x: 1, y: 6 },
  { n: 56, s: 'Ba', name: 'Barium', m: 137.33, cat: 'alkaline earth metal', x: 2, y: 6 },
  // Lanthanides (57-71) - separate block logic handles position
  { n: 57, s: 'La', name: 'Lanthanum', m: 138.91, cat: 'lanthanide', x: 3, y: 9 },
  { n: 58, s: 'Ce', name: 'Cerium', m: 140.12, cat: 'lanthanide', x: 4, y: 9 },
  { n: 59, s: 'Pr', name: 'Praseodymium', m: 140.91, cat: 'lanthanide', x: 5, y: 9 },
  { n: 60, s: 'Nd', name: 'Neodymium', m: 144.24, cat: 'lanthanide', x: 6, y: 9 },
  { n: 61, s: 'Pm', name: 'Promethium', m: 145, cat: 'lanthanide', x: 7, y: 9 },
  { n: 62, s: 'Sm', name: 'Samarium', m: 150.36, cat: 'lanthanide', x: 8, y: 9 },
  { n: 63, s: 'Eu', name: 'Europium', m: 151.96, cat: 'lanthanide', x: 9, y: 9 },
  { n: 64, s: 'Gd', name: 'Gadolinium', m: 157.25, cat: 'lanthanide', x: 10, y: 9 },
  { n: 65, s: 'Tb', name: 'Terbium', m: 158.93, cat: 'lanthanide', x: 11, y: 9 },
  { n: 66, s: 'Dy', name: 'Dysprosium', m: 162.50, cat: 'lanthanide', x: 12, y: 9 },
  { n: 67, s: 'Ho', name: 'Holmium', m: 164.93, cat: 'lanthanide', x: 13, y: 9 },
  { n: 68, s: 'Er', name: 'Erbium', m: 167.26, cat: 'lanthanide', x: 14, y: 9 },
  { n: 69, s: 'Tm', name: 'Thulium', m: 168.93, cat: 'lanthanide', x: 15, y: 9 },
  { n: 70, s: 'Yb', name: 'Ytterbium', m: 173.05, cat: 'lanthanide', x: 16, y: 9 },
  { n: 71, s: 'Lu', name: 'Lutetium', m: 174.97, cat: 'lanthanide', x: 17, y: 9 },
  
  { n: 72, s: 'Hf', name: 'Hafnium', m: 178.49, cat: 'transition metal', x: 4, y: 6 },
  { n: 73, s: 'Ta', name: 'Tantalum', m: 180.95, cat: 'transition metal', x: 5, y: 6 },
  { n: 74, s: 'W', name: 'Tungsten', m: 183.84, cat: 'transition metal', x: 6, y: 6 },
  { n: 75, s: 'Re', name: 'Rhenium', m: 186.21, cat: 'transition metal', x: 7, y: 6 },
  { n: 76, s: 'Os', name: 'Osmium', m: 190.23, cat: 'transition metal', x: 8, y: 6 },
  { n: 77, s: 'Ir', name: 'Iridium', m: 192.22, cat: 'transition metal', x: 9, y: 6 },
  { n: 78, s: 'Pt', name: 'Platinum', m: 195.08, cat: 'transition metal', x: 10, y: 6 },
  { n: 79, s: 'Au', name: 'Gold', m: 196.97, cat: 'transition metal', x: 11, y: 6 },
  { n: 80, s: 'Hg', name: 'Mercury', m: 200.59, cat: 'transition metal', x: 12, y: 6 },
  { n: 81, s: 'Tl', name: 'Thallium', m: 204.38, cat: 'post-transition metal', x: 13, y: 6 },
  { n: 82, s: 'Pb', name: 'Lead', m: 207.2, cat: 'post-transition metal', x: 14, y: 6 },
  { n: 83, s: 'Bi', name: 'Bismuth', m: 208.98, cat: 'post-transition metal', x: 15, y: 6 },
  { n: 84, s: 'Po', name: 'Polonium', m: 209, cat: 'post-transition metal', x: 16, y: 6 },
  { n: 85, s: 'At', name: 'Astatine', m: 210, cat: 'post-transition metal', x: 17, y: 6 },
  { n: 86, s: 'Rn', name: 'Radon', m: 222, cat: 'noble gas', x: 18, y: 6 },
  
  { n: 87, s: 'Fr', name: 'Francium', m: 223, cat: 'alkali metal', x: 1, y: 7 },
  { n: 88, s: 'Ra', name: 'Radium', m: 226, cat: 'alkaline earth metal', x: 2, y: 7 },
  // Actinides (89-103)
  { n: 89, s: 'Ac', name: 'Actinium', m: 227, cat: 'actinide', x: 3, y: 10 },
  { n: 90, s: 'Th', name: 'Thorium', m: 232.04, cat: 'actinide', x: 4, y: 10 },
  { n: 91, s: 'Pa', name: 'Protactinium', m: 231.04, cat: 'actinide', x: 5, y: 10 },
  { n: 92, s: 'U', name: 'Uranium', m: 238.03, cat: 'actinide', x: 6, y: 10 },
  { n: 93, s: 'Np', name: 'Neptunium', m: 237, cat: 'actinide', x: 7, y: 10 },
  { n: 94, s: 'Pu', name: 'Plutonium', m: 244, cat: 'actinide', x: 8, y: 10 },
  { n: 95, s: 'Am', name: 'Americium', m: 243, cat: 'actinide', x: 9, y: 10 },
  { n: 96, s: 'Cm', name: 'Curium', m: 247, cat: 'actinide', x: 10, y: 10 },
  { n: 97, s: 'Bk', name: 'Berkelium', m: 247, cat: 'actinide', x: 11, y: 10 },
  { n: 98, s: 'Cf', name: 'Californium', m: 251, cat: 'actinide', x: 12, y: 10 },
  { n: 99, s: 'Es', name: 'Einsteinium', m: 252, cat: 'actinide', x: 13, y: 10 },
  { n: 100, s: 'Fm', name: 'Fermium', m: 257, cat: 'actinide', x: 14, y: 10 },
  { n: 101, s: 'Md', name: 'Mendelevium', m: 258, cat: 'actinide', x: 15, y: 10 },
  { n: 102, s: 'No', name: 'Nobelium', m: 259, cat: 'actinide', x: 16, y: 10 },
  { n: 103, s: 'Lr', name: 'Lawrencium', m: 262, cat: 'actinide', x: 17, y: 10 },
  
  { n: 104, s: 'Rf', name: 'Rutherfordium', m: 267, cat: 'transition metal', x: 4, y: 7 },
  { n: 105, s: 'Db', name: 'Dubnium', m: 268, cat: 'transition metal', x: 5, y: 7 },
  { n: 106, s: 'Sg', name: 'Seaborgium', m: 271, cat: 'transition metal', x: 6, y: 7 },
  { n: 107, s: 'Bh', name: 'Bohrium', m: 272, cat: 'transition metal', x: 7, y: 7 },
  { n: 108, s: 'Hs', name: 'Hassium', m: 270, cat: 'transition metal', x: 8, y: 7 },
  { n: 109, s: 'Mt', name: 'Meitnerium', m: 276, cat: 'unknown', x: 9, y: 7 },
  { n: 110, s: 'Ds', name: 'Darmstadtium', m: 281, cat: 'unknown', x: 10, y: 7 },
  { n: 111, s: 'Rg', name: 'Roentgenium', m: 280, cat: 'unknown', x: 11, y: 7 },
  { n: 112, s: 'Cn', name: 'Copernicium', m: 285, cat: 'unknown', x: 12, y: 7 },
  { n: 113, s: 'Nh', name: 'Nihonium', m: 284, cat: 'unknown', x: 13, y: 7 },
  { n: 114, s: 'Fl', name: 'Flerovium', m: 289, cat: 'unknown', x: 14, y: 7 },
  { n: 115, s: 'Mc', name: 'Moscovium', m: 288, cat: 'unknown', x: 15, y: 7 },
  { n: 116, s: 'Lv', name: 'Livermorium', m: 293, cat: 'unknown', x: 16, y: 7 },
  { n: 117, s: 'Ts', name: 'Tennessine', m: 294, cat: 'unknown', x: 17, y: 7 },
  { n: 118, s: 'Og', name: 'Oganesson', m: 294, cat: 'unknown', x: 18, y: 7 },
];

// Color mapping for categories
const categoryColors = {
  'diatomic nonmetal': 'bg-green-200 text-green-900 border-green-400',
  'noble gas': 'bg-purple-200 text-purple-900 border-purple-400',
  'alkali metal': 'bg-red-200 text-red-900 border-red-400',
  'alkaline earth metal': 'bg-orange-200 text-orange-900 border-orange-400',
  'metalloid': 'bg-teal-200 text-teal-900 border-teal-400',
  'polyatomic nonmetal': 'bg-green-200 text-green-900 border-green-400',
  'nonmetal': 'bg-green-200 text-green-900 border-green-400', // Combined category uses green
  'post-transition metal': 'bg-gray-300 text-gray-800 border-gray-500',
  'transition metal': 'bg-yellow-100 text-yellow-900 border-yellow-400',
  'lanthanide': 'bg-pink-200 text-pink-900 border-pink-400',
  'actinide': 'bg-pink-300 text-pink-900 border-pink-500',
  'unknown': 'bg-gray-100 text-gray-500 border-gray-300',
};

const categoryLabels = {
  'diatomic nonmetal': 'Nonmetals',
  'noble gas': 'Nobel gases',
  'alkali metal': 'Alkali metals',
  'alkaline earth metal': 'Alkaline earth metals',
  'metalloid': 'Metalloid',
  'polyatomic nonmetal': 'Nonmetals',
  'nonmetal': 'Nonmetals', // Combined category
  'post-transition metal': 'Post-transition metals',
  'transition metal': 'Transition metals',
  'lanthanide': 'Lanthanoids',
  'actinide': 'Actinoids',
  'unknown': 'Unknown'
};

// Helper to extract just the background color class for use in small dots
const getCategoryBgClass = (cat) => {
  const classes = categoryColors[cat];
  if (!classes) return '';
  const bgClass = classes.split(' ').find(c => c.startsWith('bg-'));
  return bgClass || '';
};

const ElementCard = ({ element, onClick, isDimmed }) => {
  const colorClass = categoryColors[element.cat] || 'bg-gray-200';
  
  return (
    <div 
      onClick={() => onClick(element)}
      className={`
        relative p-1 flex flex-col items-center justify-between cursor-pointer 
        transition-all duration-200 border 
        ${colorClass} 
        ${isDimmed ? 'opacity-20 scale-95 grayscale' : 'opacity-100 hover:scale-110 hover:z-10 hover:shadow-lg'}
      `}
      style={{
        gridColumn: element.x,
        gridRow: element.y,
        aspectRatio: '1/1',
        minWidth: '0'
      }}
    >
      <span className="self-center sm:self-start text-[8px] sm:text-[10px] font-bold opacity-70 leading-none">
        {element.n}
      </span>
      <span className="text-sm sm:text-lg md:text-xl font-bold leading-none">{element.s}</span>
      <span className="text-[7px] sm:text-[9px] truncate w-full text-center leading-none opacity-80 hidden sm:block">
        {element.name}
      </span>
    </div>
  );
};

const DetailModal = ({ element, onClose }) => {
  if (!element) return null;

  const colorClass = categoryColors[element.cat] || 'bg-gray-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-3 sm:p-6 ${colorClass} flex justify-between items-start`}>
          <div>
            <div className="flex items-baseline space-x-2 sm:space-x-3">
              <h2 className="text-2xl sm:text-4xl font-bold">{element.s}</h2>
              <span className="text-base sm:text-xl opacity-75">#{element.n}</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-medium mt-1">{element.name}</h3>
            <p className="opacity-80 font-medium uppercase tracking-wider text-xs sm:text-sm mt-1 sm:mt-2">
              {categoryLabels[element.cat]}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors flex-shrink-0">
            <X size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="bg-gray-50 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100">
              <div className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">Atomic Mass</div>
              <div className="text-base sm:text-xl font-mono text-gray-800">{element.m} <span className="text-xs sm:text-sm text-gray-400">u</span></div>
            </div>
            <div className="bg-gray-50 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100">
              <div className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">State</div>
              <div className="text-base sm:text-xl text-gray-800 capitalize">
                {/* Simple state approximation based on category/temp */}
                {element.cat === 'noble gas' ? 'Gas' : (element.s === 'Hg' || element.s === 'Br' ? 'Liquid' : 'Solid')}
              </div>
            </div>
          </div>

          <div>
             <div className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 sm:mb-2">Description</div>
             <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
               {element.summary || `${element.name} is a chemical element with the symbol ${element.s} and atomic number ${element.n}. It is classified as a ${element.cat}.`}
             </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
            <FlaskConical size={16} />
            <span>Group {element.x}, Period {element.y === 9 || element.y === 10 ? (element.y === 9 ? '6 (Lanthanides)' : '7 (Actinides)') : element.y}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PeriodicTableApp() {
  const [elements] = useState(rawElements);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSeries, setActiveSeries] = useState(null); // 'lanthanides' or 'actinides'
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // Filter logic
  const filteredElements = useMemo(() => {
    if (!searchTerm) return elements;
    const lowerTerm = searchTerm.toLowerCase();
    return elements.filter(el => 
      el.name.toLowerCase().includes(lowerTerm) || 
      el.s.toLowerCase() === lowerTerm || // Exact match for symbol priority
      el.s.toLowerCase().includes(lowerTerm) ||
      el.n.toString().includes(lowerTerm)
    );
  }, [elements, searchTerm]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(elements.map(e => e.cat));
    const categoryList = Array.from(cats);
    // Group non-metals together
    const hasDiatomic = categoryList.includes('diatomic nonmetal');
    const hasPolyatomic = categoryList.includes('polyatomic nonmetal');
    let processedList;
    if (hasDiatomic && hasPolyatomic) {
      // Remove both and add a combined 'nonmetal' category
      processedList = categoryList
        .filter(cat => cat !== 'diatomic nonmetal' && cat !== 'polyatomic nonmetal')
        .concat(['nonmetal']);
    } else {
      processedList = categoryList;
    }

    // Define the desired order for "Filter by Group"
    // Alkali metals, Alkaline earth metals, Transition metals,
    // Post-transition metals, Metalloid, Reactive nonmetals,
    // Nobel gases, Lanthanoids, Actinoids, and Unknown
    const categoryOrder = [
      'alkali metal',
      'alkaline earth metal',
      'transition metal',
      'post-transition metal',
      'metalloid',
      'nonmetal',
      'noble gas',
      'lanthanide',
      'actinide',
      'unknown'
    ];

    // Sort categories according to the desired order
    const ordered = categoryOrder.filter(cat => processedList.includes(cat));
    // Add any remaining categories that weren't in the order list
    const remaining = processedList.filter(cat => !categoryOrder.includes(cat));

    return [...ordered, ...remaining];
  }, [elements]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 md:py-2 flex flex-wrap items-center justify-between gap-2">
          {/* Left: title + inline group dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Atom size={22} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
              Periodic Table
            </h1>
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-600">
              <div className="relative">
                {/* Trigger */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-2 py-0.5 text-[10px] md:text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setIsCategoryOpen((open) => !open)}
                >
                  <span
                    className={`
                      inline-block w-2.5 h-2.5 rounded-full border border-black/10
                      ${activeCategory ? getCategoryBgClass(activeCategory) : 'bg-gray-200'}
                    `}
                  />
                  <span className="truncate max-w-[6rem] md:max-w-[9rem]">
                    {activeCategory ? categoryLabels[activeCategory] : 'All groups'}
                  </span>
                </button>

                {/* Dropdown menu */}
                {isCategoryOpen && (
                  <div className="absolute z-50 mt-1 w-36 md:w-44 rounded-md border border-gray-200 bg-white shadow-lg py-0.5">
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 px-2 py-1 text-left text-[10px] md:text-xs text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setActiveCategory(null);
                        setActiveSeries(null);
                        setIsCategoryOpen(false);
                      }}
                    >
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-200 border border-black/10" />
                      <span>All groups</span>
                    </button>
                    <div className="h-px bg-gray-100 my-0.5" />
                    {uniqueCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`flex w-full items-center gap-1.5 px-2 py-1 text-left text-[10px] md:text-xs hover:bg-gray-50 ${
                          activeCategory === cat ? 'font-semibold text-gray-900' : 'text-gray-700'
                        }`}
                        onClick={() => {
                          setActiveCategory(cat);
                          setActiveSeries(null);
                          setIsCategoryOpen(false);
                        }}
                      >
                        <span
                          className={`
                            inline-block w-2.5 h-2.5 rounded-full border border-black/10
                            ${getCategoryBgClass(cat)}
                          `}
                        />
                        <span>{categoryLabels[cat]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: search box */}
          <div className="relative w-full [@media(min-width:460px)]:w-60 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search elements" 
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value) {
                  setActiveSeries(null); // Deselect series when searching
                  setActiveCategory(null); // Deselect category to avoid conflicting filters
                }
              }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-3 pt-2 pb-4 md:px-6 md:pt-3 md:pb-3 overflow-x-auto">
        <div className="w-full max-w-7xl mx-auto">

          {/* Group Number Labels - Top Row */}
          <div className="relative mb-1 periodic-grid" style={{ 
            display: 'grid', 
            gap: '0.25rem'
          }}>
            {/* Empty cell for top-left corner */}
            <div></div>
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(num => (
              <div 
                key={`g-${num}`} 
                className="flex items-center justify-center text-xs font-mono text-gray-400 font-bold"
                style={{ gridColumn: num + 1 }}
              >
                {num}
              </div>
            ))}
          </div>

          {/* THE GRID with Period Labels */}
          <div className="relative periodic-grid" style={{ 
            display: 'grid', 
            gap: '0.25rem' // tailwind gap-1
          }}>
            
            {/* Period Labels - Left Side */}
            {[1,2,3,4,5,6,7].map(num => (
              <div 
                key={`p-${num}`} 
                className="flex items-center justify-center text-xs font-mono text-gray-400 font-bold"
                style={{
                  gridColumn: 1,
                  gridRow: num
                }}
              >
                {num}
              </div>
            ))}
            
            {/* Main table elements (exclude lanthanides 57-71 and actinides 89-103) */}
            {elements.filter(el => (el.n < 57 || el.n > 71) && (el.n < 89 || el.n > 103)).map((element) => {
               // Check if filtered out by search
               const isSearched = filteredElements.includes(element);
               // Check if filtered by category
               const isCategoryMatch = !activeCategory || element.cat === activeCategory || 
                 (activeCategory === 'nonmetal' && (element.cat === 'diatomic nonmetal' || element.cat === 'polyatomic nonmetal'));
               
               // Logic: If we are searching, dim non-matches. 
               // If we are filtering category, dim non-matches.
               // If we are filtering by series, dim non-matches.
               // Search takes priority? Or intersection? Let's do intersection.
               const isDimmed = (searchTerm && !isSearched) || (activeCategory && !isCategoryMatch) || (activeSeries !== null);

               // Adjust gridColumn to account for the label column (column 1)
               const adjustedElement = {
                 ...element,
                 x: element.x + 1
               };

               return (
                <ElementCard 
                  key={element.n} 
                  element={adjustedElement} 
                  onClick={() => {
                    setSelectedElement(element);
                    setActiveSeries(null); // Clear series selection when clicking an element
                  }}
                  isDimmed={isDimmed}
                />
               );
            })}

            {/* Placeholder cell between Ba (56) and Hf (72) in row 6 */}
            <div 
              onClick={() => {
                if (activeCategory && activeCategory !== 'lanthanide') return; // Don't allow clicking when other category is active
                const newSeries = activeSeries === 'lanthanides' ? null : 'lanthanides';
                setActiveSeries(newSeries);
                if (newSeries) setActiveCategory(null); // Deselect category when series is selected
              }}
              className={`relative border border-pink-400 bg-pink-200 text-pink-900 flex flex-col items-center justify-between p-1 cursor-pointer transition-all duration-200 ${
                searchTerm || (activeCategory && activeCategory !== 'lanthanide') || activeSeries === 'actinides'
                  ? 'opacity-20 scale-95 grayscale cursor-not-allowed' 
                  : (activeSeries === 'lanthanides' || activeCategory === 'lanthanide')
                    ? 'ring-2 ring-offset-1 ring-pink-500 shadow-md transform scale-105 z-10' 
                    : 'hover:scale-110 hover:z-10 hover:shadow-lg'
              }`}
              style={{
                gridColumn: '4', // Column 3 in the 18-column grid (after Ba at column 2)
                gridRow: 6,
                aspectRatio: '1/1',
                minWidth: '0'
              }}
            >
              <span className="self-center sm:self-start text-[8px] sm:text-[10px] font-bold opacity-70 leading-none whitespace-nowrap">
                57-71
              </span>
              {/* Symbol-like short label, always visible */}
              <span className="text-sm sm:text-lg md:text-xl font-bold leading-none">
                Ln
              </span>
              {/* Full name, shown like element names (hidden on very small screens) */}
              <span className="text-[7px] sm:text-[9px] truncate w-full text-center leading-none opacity-80 hidden sm:block">
                Lanthanoids
              </span>
            </div>

            {/* Placeholder cell between Ra (88) and Rf (104) in row 7 */}
            <div 
              onClick={() => {
                if (activeCategory && activeCategory !== 'actinide') return; // Don't allow clicking when other category is active
                const newSeries = activeSeries === 'actinides' ? null : 'actinides';
                setActiveSeries(newSeries);
                if (newSeries) setActiveCategory(null); // Deselect category when series is selected
              }}
              className={`relative border border-pink-500 bg-pink-300 text-pink-900 flex flex-col items-center justify-between p-1 cursor-pointer transition-all duration-200 ${
                searchTerm || (activeCategory && activeCategory !== 'actinide') || activeSeries === 'lanthanides'
                  ? 'opacity-20 scale-95 grayscale cursor-not-allowed' 
                  : (activeSeries === 'actinides' || activeCategory === 'actinide')
                    ? 'ring-2 ring-offset-1 ring-pink-500 shadow-md transform scale-105 z-10' 
                    : 'hover:scale-110 hover:z-10 hover:shadow-lg'
              }`}
              style={{
                gridColumn: '4', // Column 3 in the 18-column grid (after Ra at column 2)
                gridRow: 7,
                aspectRatio: '1/1',
                minWidth: '0'
              }}
            >
              <span className="self-center sm:self-start text-[8px] sm:text-[10px] font-bold opacity-70 leading-none whitespace-nowrap">
                89-103
              </span>
              {/* Symbol-like short label, always visible */}
              <span className="text-sm sm:text-lg md:text-xl font-bold leading-none">
                An
              </span>
              {/* Full name, shown like element names (hidden on very small screens) */}
              <span className="text-[7px] sm:text-[9px] truncate w-full text-center leading-none opacity-80 hidden sm:block">
                Actinoids
              </span>
            </div>
          </div>
          
          {/* Lanthanides Row (57-71) - positioned below row 6 */}
          <div className="mt-2 relative periodic-grid" style={{ 
            display: 'grid', 
            gap: '0.25rem'
          }}>
            {/* Empty label column */}
            <div></div>
            {/* Empty cells for columns 2-3 (groups 1-2) to align with main grid */}
            <div></div>
            <div></div>
            {elements.filter(el => el.n >= 57 && el.n <= 71).sort((a, b) => a.n - b.n).map((element) => {
              const isSearched = filteredElements.includes(element);
              const isCategoryMatch = !activeCategory || element.cat === activeCategory || 
                (activeCategory === 'nonmetal' && (element.cat === 'diatomic nonmetal' || element.cat === 'polyatomic nonmetal'));
              const isSeriesMatch = !activeSeries || activeSeries === 'lanthanides';
              const isDimmed = (searchTerm && !isSearched) || (activeCategory && !isCategoryMatch) || (activeSeries && activeSeries !== 'lanthanides');

              // Position lanthanides starting at column 4 (after label + 2 empty columns)
              const adjustedElement = {
                ...element,
                x: element.n - 56 + 3, // 57 -> 4, 58 -> 5, etc. (offset by 3: label + 2 groups)
                y: 1
              };

              return (
                <ElementCard 
                  key={element.n} 
                  element={adjustedElement} 
                  onClick={() => {
                    setSelectedElement(element);
                    setActiveSeries(null); // Clear series selection when clicking an element
                  }}
                  isDimmed={isDimmed}
                />
              );
            })}
          </div>

          {/* Actinides Row (89-103) - positioned below row 7 */}
          <div className="mt-1 relative periodic-grid" style={{ 
            display: 'grid', 
            gap: '0.25rem'
          }}>
            {/* Empty label column */}
            <div></div>
            {/* Empty cells for columns 2-3 (groups 1-2) to align with main grid */}
            <div></div>
            <div></div>
            {elements.filter(el => el.n >= 89 && el.n <= 103).sort((a, b) => a.n - b.n).map((element) => {
              const isSearched = filteredElements.includes(element);
              const isCategoryMatch = !activeCategory || element.cat === activeCategory || 
                (activeCategory === 'nonmetal' && (element.cat === 'diatomic nonmetal' || element.cat === 'polyatomic nonmetal'));
              const isSeriesMatch = !activeSeries || activeSeries === 'actinides';
              const isDimmed = (searchTerm && !isSearched) || (activeCategory && !isCategoryMatch) || (activeSeries && activeSeries !== 'actinides');

              // Position actinides starting at column 4 (after label + 2 empty columns)
              const adjustedElement = {
                ...element,
                x: element.n - 88 + 3, // 89 -> 4, 90 -> 5, etc. (offset by 3: label + 2 groups)
                y: 1
              };

              return (
                <ElementCard 
                  key={element.n} 
                  element={adjustedElement} 
                  onClick={() => {
                    setSelectedElement(element);
                    setActiveSeries(null); // Clear series selection when clicking an element
                  }}
                  isDimmed={isDimmed}
                />
              );
            })}
          </div>
          
        </div>
      </main>

      {/* Selected Element Modal */}
      <DetailModal 
        element={selectedElement} 
        onClose={() => setSelectedElement(null)} 
      />

      {/* Footer intentionally left empty per user request */}
    </div>
  );
}