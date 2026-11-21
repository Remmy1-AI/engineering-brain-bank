/** Brain Bank mobile — boye.study tokens + light paper body under black hero.
 *  Exact web tokens from css/styles.css; paper canvas kept for content under the sticky hero.
 */

const gold = '#FFB800';
const goldLight = '#FFCC33';
const goldDark = '#E09A00';
const goldInk = '#000000';
const crestRed = '#C62828';

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
  // Light paper body (under hero / main screens)
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

  // boye.study dark surfaces (sticky hero + dark chrome)
  heroBg: '#050505',
  bgDark: '#050505',
  bgElevatedDark: '#0A0A0A',
  bgCardDark: '#121212',
  textOnDark: '#F5F5F5',
  textMutedOnDark: '#B0B0B4',
  textDimOnDark: '#7A7A80',
  borderOnDark: 'rgba(255, 255, 255, 0.14)',
  borderSubtleOnDark: 'rgba(255, 255, 255, 0.07)',

  // Gold accents (CTA / active tab glide / links only)
  accent: gold,
  accentLight: goldLight,
  accentPressed: goldDark,
  accentSoft: 'rgba(255, 184, 0, 0.18)',
  accentInk: goldInk,

  crestRed,

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
    tint: gold,
    tabIconDefault: Brand.textDim,
    tabIconSelected: gold,
  },
  dark: {
    text: Brand.textOnDark,
    background: Brand.bgDark,
    tint: gold,
    tabIconDefault: Brand.textDimOnDark,
    tabIconSelected: gold,
  },
};
