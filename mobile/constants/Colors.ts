/** Brain Bank brand tokens — aligned with boye.study css/styles.css */

const gold = '#FFB800';
const goldLight = '#FFCC33';
const goldDark = '#E09A00';

export const Brand = {
  bg: '#050505',
  bgElevated: '#0A0A0A',
  bgCard: '#121212',
  bgCardHover: '#1A1A1A',
  bgInput: '#0E0E0E',
  border: 'rgba(255, 255, 255, 0.14)',
  borderSubtle: 'rgba(255, 255, 255, 0.07)',
  text: '#F5F5F5',
  textMuted: '#B0B0B4',
  textDim: '#7A7A80',
  gold,
  goldLight,
  goldDark,
  goldInk: '#000000',
  crestRed: '#C62828',
  siteUrl: 'https://boye.study',
  parentBrand: 'ENGINEER WITH KB',
  appName: 'Brain Bank',
  fullName: "KB'S BRAIN BANK",
  tagline: 'Learn • Share • Succeed',
  splashCredit: 'by Korle Boye',
  closing: 'From him, FOR GESA.',
};

const tintColorLight = gold;
const tintColorDark = gold;

export default {
  light: {
    text: Brand.text,
    background: Brand.bg,
    tint: tintColorLight,
    tabIconDefault: Brand.textDim,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: Brand.text,
    background: Brand.bg,
    tint: tintColorDark,
    tabIconDefault: Brand.textDim,
    tabIconSelected: tintColorDark,
  },
};
