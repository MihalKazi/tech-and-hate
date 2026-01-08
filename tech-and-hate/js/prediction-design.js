/**
 * Prediction Design Generator
 *
 * Generates deterministic design parameters (pattern, theme colors) from author + headline
 * Can be used in WordPress templates or standalone HTML
 *
 * Usage:
 *   const design = generatePredictionDesign("Author Name", "Headline Text");
 *   console.log(design);
 *   // { pattern: 'noisyring', theme: { bg: '#...' }, seed: 12345, ... }
 */

// ╔═══════════════════════════════════════════════════════════════╗
// ║                    CONFIGURATION SECTION                      ║
// ║           Edit these values to customize your designs         ║
// ╚═══════════════════════════════════════════════════════════════╝

// ========= PATTERN SELECTION =========
// Uncomment/comment patterns to enable/disable them
// Add new patterns by adding their names to this array (pattern must exist in pattern-renderer.js)
const CONFIG_PATTERNS = [
  'phyllo',
  'dotcloud',
  'flowfield',
  'arcs',
  'voronoi',
  'contourmap',
  'spiral',
  'ripples',
  'starburst',
  'network',
  'scribble',
  'bezweb',
  'lissajous',
  'orbits',
  'wavelattice',
  'chaoticorbit',
  'radiantwave',
  'manicspiral',
  // To disable a pattern, comment it out:
  // 'manicspiral',  // DISABLED
];

// ========= COLOR SYSTEM CONFIGURATION =========
// Choose one of the following color modes:
const COLOR_MODE = 'HEX_LIST'; // Options: 'OKLCH_GENERATED', 'HEX_LIST', 'OKLCH_PALETTE'

// --- MODE 1: OKLCH_GENERATED (default) ---
// Generates 8 shades from a single hue using OKLCH color space
const OKLCH_CONFIG = {
  hue: 255,  // 0-360 (255 = purple-pink, 35 = orange, 200 = blue, 140 = green)
  lightness: [0.18, 0.32, 0.42, 0.57, 0.72, 0.82, 0.92, 0.97],  // 8 lightness values (0-1)
  chroma: [0.15, 0.18, 0.16, 0.14, 0.10, 0.06, 0.03, 0.02]     // 8 chroma values (0-0.4)
};

// --- MODE 2: HEX_LIST ---
// Provide a specific list of hex colors (any number, 3+  recommended)
const HEX_COLORS = [
  '#F7EDDA','#F0531C','#09332C','#F7DFBA','#FFA74F','#2E4B3C'
  // '#2d1b3d', '#4a2d5c', '#6b4a7a', '#8d6b9a',
  // '#b098ba', '#c8b5d0', '#e0d5e5', '#f5f0f7',
  // Add more colors here:
  // '#ff0000', '#00ff00', '#0000ff'
];

// --- MODE 3: OKLCH_PALETTE ---
// Choose from predefined palettes: 'blue-purple', 'warm', 'cool', 'green', 'monochrome'
const OKLCH_PALETTE = 'blue-purple';

// ╔═══════════════════════════════════════════════════════════════╗
// ║                   END OF CONFIGURATION                        ║
// ║              Don't edit below unless you know what            ║
// ║                    you're doing!                              ║
// ╚═══════════════════════════════════════════════════════════════╝

// ========= PRNG =========
function mulberry32(a){
  return function(){
    let t=a+=0x6D2B79F5;
    t=Math.imul(t^t>>>15,t|1);
    t^=t+Math.imul(t^t>>>7,t|61);
    return((t^t>>>14)>>>0)/4294967296;
  };
}

// ========= Hashing =========
function hashStringToSeed(str){
  let hash=0;
  for(let i=0;i<str.length;i++){
    const char=str.charCodeAt(i);
    hash=((hash<<5)-hash)+char;
    hash|=0;
  }
  return Math.abs(hash);
}

// ========= Pattern Types =========
// Use CONFIG_PATTERNS from configuration section
const PATTERN_KEYS = CONFIG_PATTERNS;

// ========= Color System =========
function oklchToRgb(l,c,h){
  const a=c*Math.cos(h*Math.PI/180);
  const b=c*Math.sin(h*Math.PI/180);

  let L=l+0.3963377774*a+0.2158037573*b;
  let M=l-0.1055613458*a-0.0638541728*b;
  let S=l-0.0894841775*a-1.2914855480*b;

  L=L**3;
  M=M**3;
  S=S**3;

  let r=+4.0767416621*L-3.3077115913*M+0.2309699292*S;
  let g=-1.2684380046*L+2.6097574011*M-0.3413193965*S;
  let bl=-0.0041960863*L-0.7034186147*M+1.7076147010*S;

  const toSRGB=(x)=>{
    if(x<=0.0031308)return 12.92*x;
    return 1.055*Math.pow(x,1/2.4)-0.055;
  };

  r=Math.max(0,Math.min(1,toSRGB(r)));
  g=Math.max(0,Math.min(1,toSRGB(g)));
  bl=Math.max(0,Math.min(1,toSRGB(bl)));

  const rr=Math.round(r*255);
  const gg=Math.round(g*255);
  const bb=Math.round(bl*255);

  return `#${rr.toString(16).padStart(2,'0')}${gg.toString(16).padStart(2,'0')}${bb.toString(16).padStart(2,'0')}`;
}

function generateThemes(paletteKey='blue-purple'){
  // Check COLOR_MODE from config
  if(COLOR_MODE === 'HEX_LIST'){
    // Use custom hex colors from HEX_COLORS array
    return generateThemesFromHexList(HEX_COLORS);
  }else if(COLOR_MODE === 'OKLCH_GENERATED'){
    // Use OKLCH_CONFIG to generate single-hue palette
    return generateThemesFromOKLCH(OKLCH_CONFIG);
  }else{
    // Default: use OKLCH_PALETTE mode with predefined palettes
    const palettes={
      'blue-purple':{hue:255,lightness:[0.18,0.32,0.42,0.57,0.72,0.82,0.92,0.97],chroma:[0.15,0.18,0.16,0.14,0.10,0.06,0.03,0.02]},
      'warm':{hue:35,lightness:[0.20,0.35,0.45,0.60,0.75,0.85,0.93,0.97],chroma:[0.16,0.19,0.17,0.15,0.11,0.07,0.04,0.02]},
      'cool':{hue:200,lightness:[0.18,0.32,0.42,0.57,0.72,0.82,0.92,0.97],chroma:[0.15,0.18,0.16,0.14,0.10,0.06,0.03,0.02]},
      'green':{hue:140,lightness:[0.20,0.35,0.45,0.60,0.75,0.85,0.93,0.97],chroma:[0.16,0.19,0.17,0.15,0.11,0.07,0.04,0.02]},
      'monochrome':{hue:0,lightness:[0.15,0.30,0.40,0.55,0.70,0.80,0.90,0.95],chroma:[0.02,0.03,0.03,0.03,0.02,0.02,0.01,0.01]}
    };

    const palette=palettes[OKLCH_PALETTE]||palettes['blue-purple'];
    return generateThemesFromOKLCH(palette);
  }
}

function generateThemesFromOKLCH(config){
  const {hue,lightness,chroma}=config;

  const themes=[];
  for(let i=0;i<lightness.length;i++){
    const bg=oklchToRgb(lightness[i],chroma[i],hue);
    const isLight=lightness[i]>0.5;

    let strokeIndices;
    if(isLight){
      strokeIndices=[0,1,2,Math.min(3,lightness.length-1)];
    }else{
      strokeIndices=[Math.min(4,lightness.length-1),Math.min(5,lightness.length-1),Math.min(6,lightness.length-1),lightness.length-1];
    }

    const strokes=strokeIndices.map(idx=>oklchToRgb(lightness[idx],chroma[idx],hue));
    const textColor=isLight?'#1a1a1a':'#f5f5f5';

    themes.push({bg,strokes,text:textColor});
  }

  return themes;
}

function generateThemesFromHexList(hexColors){
  // Sort colors by perceived lightness
  const sortedColors=hexColors.slice().sort((a,b)=>{
    const getLightness=(hex)=>{
      const r=parseInt(hex.slice(1,3),16)/255;
      const g=parseInt(hex.slice(3,5),16)/255;
      const bl=parseInt(hex.slice(5,7),16)/255;
      return 0.299*r+0.587*g+0.114*bl;
    };
    return getLightness(a)-getLightness(b);
  });

  const themes=[];
  for(let i=0;i<sortedColors.length;i++){
    const bg=sortedColors[i];
    const lightness=(0.299*parseInt(bg.slice(1,3),16)+0.587*parseInt(bg.slice(3,5),16)+0.114*parseInt(bg.slice(5,7),16))/255;
    const isLight=lightness>0.5;

    // Pick stroke colors from the opposite end of the spectrum
    const strokes=isLight?
      sortedColors.slice(0,4):
      sortedColors.slice(-4);

    const textColor=isLight?'#1a1a1a':'#f5f5f5';

    themes.push({bg,strokes,text:textColor});
  }

  return themes;
}

// ========= Main Function =========
/**
 * Generate deterministic design parameters from author + headline
 * @param {string} author - Author name
 * @param {string} headline - Headline text
 * @param {string} palette - Color palette key (default: 'blue-purple')
 * @returns {object} Design parameters: { pattern, theme, seed, preseed, bg, text, strokes }
 */
function generatePredictionDesign(author, headline, palette='blue-purple'){
  // Generate seeds
  const preseed=hashStringToSeed(author + '|' + headline);
  const prerand=mulberry32(preseed);

  // Select pattern
  const patternIndex=Math.floor(prerand() * PATTERN_KEYS.length);
  const pattern=PATTERN_KEYS[patternIndex];

  // Generate full seed with pattern
  const seed=hashStringToSeed(author + '|' + headline + '|' + pattern);
  const rand=mulberry32(seed);

  // Generate themes and select one
  const themes=generateThemes(palette);
  const themeChooser=(function(){
    let last=-1;
    return function(){
      let idx;
      do{idx=Math.floor(rand()*themes.length);}while(idx===last && themes.length>1);
      last=idx;
      return themes[idx];
    };
  })();

  const theme=themeChooser();

  return {
    pattern,
    theme,
    seed,
    preseed,
    bg:theme.bg,
    text:theme.text,
    strokes:theme.strokes,
    author,
    headline
  };
}

// Export for different environments
if(typeof module!=='undefined' && module.exports){
  // Node.js / CommonJS
  module.exports={generatePredictionDesign, generateThemes, PATTERN_KEYS};
}else if(typeof window!=='undefined'){
  // Browser global
  window.PredictionDesign={generatePredictionDesign, generateThemes, PATTERN_KEYS};
}
