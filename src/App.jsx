import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Atom, X, FlaskConical, Cuboid, Volume2, Maximize, Minimize } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { elements as rawElements } from './elementsData';
import BohrModel from './components/3d/BohrModel';
import CrystalStructure from './components/3d/CrystalStructure';
import MiniPeriodicTable from './components/MiniPeriodicTable';
import { aiSummaries } from './elementsInfo';

// --- FULL ELEMENT DATASET ---
// Compressed structure for the example, expanded in logic
// x = group, y = period
// Element data is now imported from elementsData.js
// const rawElements = ... (moved to separate file)

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
  'lanthanide': 'Lanthanides',
  'actinide': 'Actinides',
  'unknown': 'Unknown'
};

// Helper to extract just the background color class for use in small dots
const getCategoryBgClass = (cat) => {
  const classes = categoryColors[cat];
  if (!classes) return '';
  const bgClass = classes.split(' ').find(c => c.startsWith('bg-'));
  return bgClass || '';
};

const ElementCard = React.memo(({ element, onClick, isDimmed, isFullScreen }) => {
  const colorClass = categoryColors[element.cat] || 'bg-gray-200';

  return (
    <button
      type="button"
      onClick={() => onClick(element)}
      aria-label={`View details for ${element.name}`}
      className={`
        relative ${isFullScreen ? 'p-[1px] sm:p-0.5' : 'p-0.5 sm:p-1'} flex flex-col items-center justify-between cursor-pointer 
        transition-all duration-200 border 
        ${colorClass} 
        ${isDimmed ? 'opacity-20 scale-95 grayscale' : 'opacity-100 hover:scale-110 hover:z-10 hover:shadow-lg'}
      `}
      style={{
        gridColumn: element.x,
        gridRow: element.y,
        aspectRatio: isFullScreen ? '1.35/1' : '1/1', // Save vertical space in full screen
        minWidth: '0'
      }}
    >
      <span className="self-center sm:self-start text-[8px] sm:text-[10px] font-bold opacity-70 leading-none">
        {element.n}
      </span>
      <span className="text-sm sm:text-lg md:text-xl font-bold leading-none">{element.s}</span>
      {/* Hide name if Full Screen is active, otherwise show on larger screens */}
      {!isFullScreen && (
        <span className="text-[7px] sm:text-[9px] truncate w-full text-center leading-none opacity-80 hidden sm:block">
          {element.name}
        </span>
      )}
    </button>
  );
});

// Helper to format lattice angles (convert raw radians to multiples of π)
const formatLatticeAngles = (angles) => {
  if (!angles) return 'N/A';
  // If it already uses π symbol or pi, return as is (but maybe clean up spaces)
  if (angles.includes('π') || angles.toLowerCase().includes('pi')) return angles;

  // Otherwise, assume raw radian numbers and convert to multiples of π
  return angles.split(',').map(part => {
    const val = parseFloat(part);
    if (isNaN(val)) return part.trim();
    const piMultiple = val / Math.PI;
    // Format to 2 decimal places, e.g., 0.32π
    return `${piMultiple.toFixed(2)}π`;
  }).join(', ');
};

// Helper to format electron configuration with HTML superscripts for better compatibility
const formatElectronConfig = (config) => {
  if (!config) return 'N/A';

  const superscriptMap = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
  };

  const parts = config.split(/([⁰¹²³⁴⁵⁶⁷⁸⁹])/g);

  return parts.map((part, index) => {
    if (superscriptMap[part]) {
      return <sup key={index}>{superscriptMap[part]}</sup>;
    }
    return part;
  });
};

const DetailModal = ({ element, onClose, isLandscape }) => {
  // Handle status bar visibility for landscape/short screens
  useEffect(() => {
    const handleResize = async () => {
      if (Capacitor.isNativePlatform()) {
        const isLandscapePhone = window.innerHeight < 500;
        try {
          if (isLandscapePhone) {
            await StatusBar.hide();
          } else {
            await StatusBar.show();
          }
        } catch (e) {
          console.warn('Status bar error:', e);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener('resize', handleResize);
      // Ensure status bar is shown when modal closes
      if (Capacitor.isNativePlatform()) {
        StatusBar.show().catch(() => { });
      }
    };
  }, []);

  if (!element) return null;

  const colorClass = categoryColors[element.cat] || 'bg-gray-200';

  return (
    <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-0' : 'p-1 sm:p-4 safe-pt safe-pb safe-pl safe-pr'} [@media(max-height:500px)]:p-0`} onClick={onClose}>
      <div
        className={`relative bg-white shadow-2xl w-full max-w-lg md:max-w-2xl lg:max-w-6xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col [@media(max-height:500px)]:overflow-y-auto [@media(max-height:500px)]:rounded-none ${isLandscape ? 'h-full rounded-none' : 'rounded-xl sm:rounded-2xl h-full sm:h-[98vh]'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Full Width Header */}
        <div className={`py-1 px-4 sm:py-3 sm:px-6 ${colorClass} flex justify-between items-start shrink-0`}>
          <div>
            <div className="flex items-baseline space-x-2 sm:space-x-4">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">{element.s}</h2>
              <span className="text-lg sm:text-2xl opacity-75 font-mono">#{element.n}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-xl sm:text-3xl font-medium">{element.name}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Cancel any current speech
                  window.speechSynthesis.cancel();

                  const utterance = new SpeechSynthesisUtterance(element.name);
                  utterance.lang = 'en-US';

                  // Style adjustments
                  utterance.rate = 0.9; // Slightly slower for clarity
                  utterance.pitch = 1;  // Normal pitch

                  // Try to select a high-quality voice
                  const voices = window.speechSynthesis.getVoices();
                  const preferredVoice = voices.find(voice =>
                    voice.name === 'Google US English' ||
                    voice.name === 'Samantha' ||
                    (voice.lang === 'en-US' && voice.localService)
                  );

                  if (preferredVoice) {
                    utterance.voice = preferredVoice;
                  }

                  window.speechSynthesis.speak(utterance);
                }}
                className="p-1.5 hover:bg-black/5 rounded-full text-black/40 hover:text-black/80 transition-colors"
                title="Pronounce"
              >
                <Volume2 size={20} />
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm opacity-90 font-medium mt-1">
              <FlaskConical size={14} />
              <span>Group {element.x}, Period {element.y === 9 || element.y === 10 ? (element.y === 9 ? '6 (Lanthanides)' : '7 (Actinides)') : element.y}</span>
            </div>
          </div>

          <div className="flex items-start gap-4 sm:gap-6">
            <div className="hidden sm:block pt-1 opacity-80">
              <MiniPeriodicTable activeElement={element} />
            </div>
            <button onClick={onClose} aria-label="Close details" className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors flex-shrink-0">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto overflow-x-hidden min-h-0 [@media(max-height:500px)]:overflow-visible [@media(max-height:500px)]:flex-none">

          {/* Left Panel: Data & Info (Previously Right) */}
          <div className="w-full lg:w-7/12 flex flex-col">
            <div className="p-4 sm:p-6 space-y-6">



              {/* Properties Table */}
              <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm sm:text-base text-left">
                  <tbody>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500 w-1/3 sm:w-2/5">Full Electron Config</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800 font-mono break-all">{formatElectronConfig(element.electronConfiguration)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Electron Config</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800 font-mono">{formatElectronConfig(element.electronConfigurationSemantic)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Atomic Number</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">{element.n}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Atomic Mass</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">{element.atomicMass} u</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Category</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800 capitalize">{element.cat}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Appearance</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800 capitalize">{element.appearance || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Density (STP)</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">{element.density ? `${element.density} g/L` : 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Melting Point</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">{element.meltingPoint ? `${element.meltingPoint} K` : 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Boiling Point</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">{element.boilingPoint ? `${element.boilingPoint} K` : 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Molar Heat</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">{element.specificHeat ? `${element.specificHeat} J/(mol·K)` : 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Ionization Energy</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">{element.ionizationEnergy ? `${element.ionizationEnergy} kJ/mol` : 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Electron Affinity</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">{element.electronAffinity ? `${element.electronAffinity} kJ/mol` : 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Electronegativity</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">{element.electronegativity || 'N/A'} (Pauling)</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Atomic Radius</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">{element.atomicRadius ? `${element.atomicRadius} pm` : 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Covalent Radius</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">{element.covalentRadius ? `${element.covalentRadius} pm` : 'N/A'}</td>
                    </tr>

                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Crystal Structure</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800 capitalize">{element.crystalStructure || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Lattice Constants</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800 font-mono">{element.latticeConstants ? `${element.latticeConstants} pm` : 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Lattice Angles</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800 font-mono">{formatLatticeAngles(element.latticeAngles)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Oxidation States</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">
                        {element.oxidationStates ? element.oxidationStates.split(',').map(s => {
                          const val = parseFloat(s.replace(/[^0-9.-]/g, ''));
                          return !isNaN(val) && val > 0 ? `+${val}` : `${val}`;
                        }).join(', ') : 'N/A'}
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">Discovered By</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(element.discoveredBy + ' discovery of ' + element.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline hover:text-blue-800 transition-colors cursor-pointer"
                        >
                          {element.discoveredBy}
                        </a>
                        <span className="text-gray-500 ml-1">({element.discoveryYear})</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4 text-gray-500">More details</td>
                      <td className="py-2.5 px-3 sm:px-4 text-gray-800">
                        <a
                          href={`https://en.wikipedia.org/wiki/${element.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline hover:text-blue-800 transition-colors flex items-center gap-1 w-fit font-medium"
                        >
                          Wikipedia
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Description (Moved Below Table) */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Brief Introduction</h3>
                <div className="text-gray-700 text-sm sm:text-base leading-relaxed text-justify">
                  {aiSummaries[element.name] ? (
                    aiSummaries[element.name].split('\n').filter(line => line.trim() !== '').map((line, i) => {
                      const match = line.match(/^([a-zA-Z\s&/]+):(.*)/);
                      if (match && match[1].length < 50) {
                        return (
                          <div key={i} className="mb-2 flex items-start">
                            <span className="mr-2 text-gray-900 flex-shrink-0 font-bold mt-1 text-lg leading-none">•</span>
                            <div>
                              <span className="font-bold text-gray-900">{match[1]}:</span>{match[2]}
                            </div>
                          </div>
                        );
                      }
                      return <div key={i} className="mb-3">{line}</div>;
                    })
                  ) : (
                    <>
                      {element.summary} {element.appearance ? `It typically appears as a ${element.appearance}.` : ''} The element has the atomic symbol {element.s} and atomic number {element.n}. It is a member of group {element.x} in the periodic table. {element.density ? `At standard conditions, it has a density of ${element.density} g/L.` : ''} {element.meltingPoint ? `It has a melting point of ${element.meltingPoint} K` : ''}{element.boilingPoint ? ` and a boiling point of ${element.boilingPoint} K` : ''}. {element.discoveredBy ? `This element was discovered by ${element.discoveredBy} in ${element.discoveryYear}.` : ''}
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Right Panel: 3D Visuals (Previously Left) */}
          <div className="w-full lg:w-5/12 bg-gray-50 flex flex-col shrink-0">
            <div className="p-4 flex-1 bg-gray-50 border border-gray-200 border-t-0">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <Atom size={14} />
                Atomic Model (Bohr)
              </h4>
              <div className="aspect-square w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 bg-gray-900">
                <BohrModel element={element} />
              </div>
            </div>

            <div className="p-4 flex-1 bg-gray-50 border border-gray-200">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <Cuboid size={14} />
                Crystal Structure
              </h4>
              <div className="aspect-square w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 bg-gray-100">
                <CrystalStructure element={element} />
              </div>
            </div>
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
  const dropdownButtonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(orientation: landscape)').matches : false
  );

  // Listen for orientation changes
  // Listen for orientation changes and reset viewport
  useEffect(() => {
    const mql = window.matchMedia('(orientation: landscape)');

    const handleOrientationChange = (e) => {
      setIsLandscape(e.matches);

      // Force viewport reset on orientation change to fix layout issues on iOS/Android
      if (typeof document !== 'undefined') {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          // Slight delay to allow rotation animation to start/finish
          setTimeout(() => {
            // Briefly lock scale to 1.0 to force browser to reset zoom level
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');

            // Re-enable pinch-to-zoom after a short delay
            setTimeout(() => {
              viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover');
            }, 100);
          }, 100);
        }
      }
    };

    // Modern browsers use addEventListener
    mql.addEventListener('change', handleOrientationChange);
    return () => mql.removeEventListener('change', handleOrientationChange);
  }, []);

  // Auto-exit full screen when rotating to portrait
  useEffect(() => {
    if (isFullScreen && !isLandscape) {
      setIsFullScreen(false);
      if (Capacitor.isNativePlatform()) {
        ScreenOrientation.unlock().catch(() => { });
      }
    }
  }, [isLandscape, isFullScreen]);

  // SEO: Deep linking and Title management
  useEffect(() => {
    // 1. On mount, check URL for routing (Path based or Search based fallback)
    const params = new URLSearchParams(window.location.search);
    const pathSegments = window.location.pathname.split('/').filter(Boolean);

    // -- ELEMENT ROUTING --
    let elementSymbol = params.get('element');
    // Check path for /element/{Symbol}
    if (!elementSymbol && pathSegments[0] === 'element' && pathSegments[1]) {
      elementSymbol = pathSegments[1];
    }

    if (elementSymbol) {
      const el = elements.find(e => e.s.toLowerCase() === elementSymbol.toLowerCase());
      if (el) setSelectedElement(el);
    }

    // -- CATEGORY ROUTING --
    let categoryParam = params.get('category');
    // Check path for /category/{Category}
    if (!categoryParam && pathSegments[0] === 'category' && pathSegments[1]) {
      categoryParam = pathSegments[1];
    }

    if (categoryParam) {
      const internalCat = categoryParam.replace(/-/g, ' ');
      if (categoryLabels[internalCat]) {
        setActiveCategory(internalCat);
      } else if (categoryParam === 'nonmetal') {
        setActiveCategory('nonmetal');
      }
    }

    // -- SERIES ROUTING --
    let seriesParam = params.get('series');
    // Check path for /series/{Series}
    if (!seriesParam && pathSegments[0] === 'series' && pathSegments[1]) {
      seriesParam = pathSegments[1];
    }

    if (seriesParam === 'lanthanides' || seriesParam === 'actinides') {
      setActiveSeries(seriesParam);
    }
  }, [elements]);

  // 2. Update URL and Document Title when filters or selectedElement change
  useEffect(() => {
    let newPath = '/';

    if (selectedElement) {
      document.title = `${selectedElement.name} (${selectedElement.s}) - Periodic Table`;
      newPath = `/element/${selectedElement.s}`;
    } else {
      if (activeCategory) {
        document.title = `${categoryLabels[activeCategory] || 'Filter'} - Periodic Table`;
        newPath = `/category/${activeCategory.replace(/ /g, '-')}`;
      } else if (activeSeries) {
        document.title = `${activeSeries.charAt(0).toUpperCase() + activeSeries.slice(1)} - Periodic Table`;
        newPath = `/series/${activeSeries}`;
      } else {
        document.title = 'Interactive Periodic Table | Modern & Responsive';
        newPath = '/';
      }
    }

    // Use replaceState to update URL with clean paths
    window.history.replaceState({}, '', newPath);
  }, [selectedElement, activeCategory, activeSeries]);

  // Toggle Status Bar based on full screen state
  useEffect(() => {
    const updateStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          if (isFullScreen) {
            await StatusBar.hide();
          } else {
            await StatusBar.show();
          }
        } catch (e) {
          console.warn('Status bar toggle failed:', e);
        }
      }
    };
    updateStatusBar();
  }, [isFullScreen]);

  // Configure status bar - Fix overlap issues
  useEffect(() => {
    const configureStatusBar = async () => {
      // Basic check if running natively
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.setStyle({ style: Style.Light });

          // On Android, we generally want to avoid overlaying the status bar 
          // to prevent content from being hidden behind it.
          // On iOS, we want it transparent but safe areas handled.
          if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setOverlaysWebView({ overlay: false });
            await StatusBar.setBackgroundColor({ color: '#FFFFFF' }); // Match header
            document.body.classList.add('platform-android');
          }

          // Enable zoom on both iOS and Android
          if (Capacitor.isNativePlatform()) {
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            if (viewportMeta) {
              viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
            }
          }
        } catch (err) {
          console.warn('Status bar configuration failed:', err);
        }
      }
    };

    configureStatusBar();
  }, []);

  // Calculate dropdown position when it opens or window resizes/scrolls
  useEffect(() => {
    const updatePosition = () => {
      if (isCategoryOpen && dropdownButtonRef.current) {
        const rect = dropdownButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4, // 4px gap (mt-1 equivalent)
          left: rect.left,
          width: rect.width
        });
      }
    };

    if (isCategoryOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isCategoryOpen]);

  // Reset zoom level only (without scrolling or aggressive DOM manipulation)
  useEffect(() => {
    if (selectedElement) {
      // Only reset CSS zoom for desktop if needed, avoid scroll/viewport hacks
      if (typeof document !== 'undefined' && document.body.style.zoom) {
        document.body.style.zoom = '1';
      }
    }
  }, [selectedElement]);

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
    // Nobel gases, Lanthanides, Actinides, and Unknown
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
      {!isFullScreen && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm safe-pt">
          <div className="max-w-7xl mx-auto px-4 py-1 sm:py-2 md:py-2 flex flex-wrap items-center justify-between gap-2">
            {/* Left: title + inline group dropdown */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Atom size={22} />
              </div>
              <h1
                className="text-xl md:text-2xl font-bold tracking-tight text-gray-900"
                style={{
                  fontDisplay: 'swap',
                  contentVisibility: 'auto'
                }}
              >
                Periodic Table
              </h1>
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-600">
                <div className="relative">
                  {/* Trigger */}
                  <button
                    ref={dropdownButtonRef}
                    type="button"
                    aria-label={`Filter by group: ${activeCategory ? categoryLabels[activeCategory] : 'All groups'}`}
                    aria-haspopup="listbox"
                    aria-expanded={isCategoryOpen}
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

                  {/* Dropdown menu - rendered via portal */}
                  {isCategoryOpen && typeof document !== 'undefined' && createPortal(
                    <>
                      {/* Backdrop to close dropdown */}
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsCategoryOpen(false)}
                      />
                      {/* Dropdown */}
                      <div
                        className="fixed z-[101] w-36 md:w-44 rounded-md border border-gray-200 bg-white shadow-lg py-0.5"
                        style={{
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
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
                            className={`flex w-full items-center gap-1.5 px-2 py-1 text-left text-[10px] md:text-xs hover:bg-gray-50 ${activeCategory === cat ? 'font-semibold text-gray-900' : 'text-gray-700'
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
                    </>,
                    document.body
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
                aria-label="Search elements by name, symbol, or atomic number"
                className="w-full pl-10 pr-4 py-1 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
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
      )}

      {/* Main Content */}
      <main className={`flex-1 px-1 sm:px-3 md:px-6 overflow-x-auto ${isFullScreen ? 'pt-0 sm:pt-0.5 pb-[1px]' : 'pt-1 sm:pt-1 pb-2 sm:pb-3 md:pt-3 md:pb-3'}`}>
        <div className="w-full max-w-7xl mx-auto">

          {/* Group Number Labels - Top Row */}
          <div className="relative mb-0.5 sm:mb-1 periodic-grid" style={{
            display: 'grid',
            gap: 'clamp(0.125rem, 0.5vw, 0.25rem)'
          }}>
            {/* Empty cell for top-left corner */}
            <div></div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(num => (
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
            gap: 'clamp(0.125rem, 0.5vw, 0.25rem)' // Responsive gap: smaller on phones
          }}>

            {/* Period Labels - Left Side */}
            {[1, 2, 3, 4, 5, 6, 7].map(num => (
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
                  isFullScreen={isFullScreen}
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
            <button
              type="button"
              onClick={() => {
                if (activeCategory && activeCategory !== 'lanthanide') return;
                const newSeries = activeSeries === 'lanthanides' ? null : 'lanthanides';
                setActiveSeries(newSeries);
                if (newSeries) setActiveCategory(null);
              }}
              aria-label="Filter by Lanthanides series"
              className={`relative border border-pink-400 bg-pink-200 text-pink-900 flex flex-col items-center justify-between ${isFullScreen ? 'p-[1px] sm:p-0.5' : 'p-0.5 sm:p-1'} cursor-pointer transition-all duration-200 ${searchTerm || (activeCategory && activeCategory !== 'lanthanide') || activeSeries === 'actinides'
                ? 'opacity-20 scale-95 grayscale cursor-not-allowed'
                : (activeSeries === 'lanthanides' || activeCategory === 'lanthanide')
                  ? 'ring-2 ring-offset-1 ring-pink-500 shadow-md transform scale-105 z-10'
                  : 'hover:scale-110 hover:z-10 hover:shadow-lg'
                }`}
              style={{
                gridColumn: '4',
                gridRow: 6,
                aspectRatio: isFullScreen ? '1.35/1' : '1/1',
                minWidth: '0'
              }}
            >
              <span className="self-center sm:self-start text-[8px] sm:text-[10px] font-bold opacity-70 leading-none whitespace-nowrap">
                57-71
              </span>
              <span className="text-sm sm:text-lg md:text-xl font-bold leading-none">
                Ln
              </span>
              {!isFullScreen && (
                <span className="text-[7px] sm:text-[9px] truncate w-full text-center leading-none opacity-80 hidden sm:block">
                  Lanthanides
                </span>
              )}
            </button>

            {/* Placeholder cell between Ra (88) and Rf (104) in row 7 */}
            <button
              type="button"
              onClick={() => {
                if (activeCategory && activeCategory !== 'actinide') return;
                const newSeries = activeSeries === 'actinides' ? null : 'actinides';
                setActiveSeries(newSeries);
                if (newSeries) setActiveCategory(null);
              }}
              aria-label="Filter by Actinides series"
              className={`relative border border-pink-500 bg-pink-300 text-pink-900 flex flex-col items-center justify-between ${isFullScreen ? 'p-[1px] sm:p-0.5' : 'p-0.5 sm:p-1'} cursor-pointer transition-all duration-200 ${searchTerm || (activeCategory && activeCategory !== 'actinide') || activeSeries === 'lanthanides'
                ? 'opacity-20 scale-95 grayscale cursor-not-allowed'
                : (activeSeries === 'actinides' || activeCategory === 'actinide')
                  ? 'ring-2 ring-offset-1 ring-pink-500 shadow-md transform scale-105 z-10'
                  : 'hover:scale-110 hover:z-10 hover:shadow-lg'
                }`}
              style={{
                gridColumn: '4',
                gridRow: 7,
                aspectRatio: isFullScreen ? '1.35/1' : '1/1',
                minWidth: '0'
              }}
            >
              <span className="self-center sm:self-start text-[8px] sm:text-[10px] font-bold opacity-70 leading-none whitespace-nowrap">
                89-103
              </span>
              <span className="text-sm sm:text-lg md:text-xl font-bold leading-none">
                An
              </span>
              {!isFullScreen && (
                <span className="text-[7px] sm:text-[9px] truncate w-full text-center leading-none opacity-80 hidden sm:block">
                  Actinides
                </span>
              )}
            </button>
          </div>

          {/* Lanthanides Row (57-71) - positioned below row 6 */}
          <div className="mt-1 sm:mt-2 relative periodic-grid" style={{
            display: 'grid',
            gap: 'clamp(0.125rem, 0.5vw, 0.25rem)'
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
                  isFullScreen={isFullScreen}
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
          <div className="mt-0.5 sm:mt-1 relative periodic-grid" style={{
            display: 'grid',
            gap: 'clamp(0.125rem, 0.5vw, 0.25rem)'
          }}>
            {/* Empty label column */}
            <div></div>
            {/* Full Screen Toggle Button (Group 1 - Vertically aligned with Fr) */}
            <div
              style={{
                gridColumn: 2,
                gridRow: 1,
                zIndex: 20
              }}
              className="relative"
            >
              {/* Only show button if:
                  1. Native App in Landscape
                  2. Web/Laptop in Landscape AND small height (simulating phone)
              */}
              {(Capacitor.isNativePlatform() || window.innerHeight < 600) && isLandscape && (
                <button
                  onClick={async () => {
                    const newFullScreen = !isFullScreen;
                    setIsFullScreen(newFullScreen);

                    if (Capacitor.isNativePlatform()) {
                      try {
                        if (newFullScreen) {
                          await new Promise(resolve => setTimeout(resolve, 100));
                          await ScreenOrientation.lock({ orientation: 'landscape' });
                        } else {
                          await ScreenOrientation.unlock();
                        }
                      } catch (e) {
                        // Automatic rotation is not supported on this device/version.
                        // Fallback: Unlock orientation so the user can rotate manually.
                        await ScreenOrientation.unlock();
                      }
                    }
                  }}
                  className={`
                    w-full h-full ${isFullScreen ? 'min-h-0' : 'min-h-[30px] sm:min-h-[40px]'} flex flex-col items-center justify-center rounded-md transition-all shadow-sm border
                    ${isFullScreen
                      ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                      : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                    }
                  `}
                  title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullScreen ? <Minimize size={18} /> :
                    <Maximize size={18} />
                  }
                </button>
              )}
            </div>
            {/* Empty cell for column 3 (group 2) */}
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
                  isFullScreen={isFullScreen}
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
        isLandscape={isLandscape}
        onClose={() => setSelectedElement(null)}
      />

      {/* Footer intentionally left empty per user request */}
    </div>
  );
}