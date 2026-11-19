/** Brain Bank v2 — light paper library (Notes / Goodnotes), one deep-blue accent.
 *  Not the boye.study black / gold web chrome.
 */

const accent = '#1A56A8';
const accentSoft = '#E8F0FA';
const accentPressed = '#154785';

/** Exam Drill–style locked category colors (dots / labels only). */
export const TypeColors = {
  slides: '#2F6FED',
  notes: '#0F9F6E',
  'past-questions': '#C47A0A',
  tutorials: '#6D4ACB',
  videos: '#C43C3C',
  shared: '#5B6B7C',
} as const;

export const Brand = {
  bg: '#F4F1EA',
  bgElevated: '#FFFCF7',
  bgCard: '#FFFFFF',
  bgInput: '#FFFFFF',
  bgWash: '#EDE9E1',
  border: 'rgba(26, 26, 26, 0.10)',
  borderSubtle: 'rgba(26, 26, 26, 0.06)',
  text: '#1A1A1A',
  textMuted: '#5A5A5A',
  textDim: '#8A8A8A',
  accent,
  accentSoft,
  accentPressed,
  accentInk: '#FFFFFF',
  siteUrl: 'https://boye.study',
  parentBrand: 'ENGINEER WITH KB',
  appName: 'Brain Bank',
  fullName: "KB'S BRAIN BANK",
  tagline: 'Learn • Share • Succeed',
  splashCredit: 'by Korle Boye',
  closing: 'From him, FOR GESA.',
};

export default {
  light: {
    text: Brand.text,
    background: Brand.bg,
    tint: accent,
    tabIconDefault: Brand.textDim,
    tabIconSelected: accent,
  },
  dark: {
    text: Brand.text,
    background: Brand.bg,
    tint: accent,
    tabIconDefault: Brand.textDim,
    tabIconSelected: accent,
  },
};
