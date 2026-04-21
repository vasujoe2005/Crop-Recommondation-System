import { Platform } from 'react-native';

const fontFamilies = {
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    web: 'Georgia, "Times New Roman", serif',
    default: 'serif',
  }),
  body: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif',
    web: '"Trebuchet MS", "Segoe UI", sans-serif',
    default: 'sans-serif',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    web: '"Courier New", monospace',
    default: 'monospace',
  }),
};

export const colors = {
  background: '#E9E0D2',
  surface: '#F6F0E5',
  surfaceMuted: '#E2D7C4',
  panel: '#D7C4A9',
  primary: '#304B38',
  primaryDark: '#1C2E22',
  primarySoft: '#BBC8B6',
  accent: '#8C5A32',
  accentSoft: '#DFC0A1',
  border: '#1D1A17',
  borderSoft: '#7B6D5D',
  text: '#181511',
  textMuted: '#5E554B',
  textOnDark: '#F7F1E7',
  danger: '#8E3124',
  success: '#31523A',
  warning: '#8A6221',
  info: '#364E67',
  shadow: '#120F0B',
};

export const typography = {
  display: {
    fontFamily: fontFamilies.display,
  },
  body: {
    fontFamily: fontFamilies.body,
  },
  mono: {
    fontFamily: fontFamilies.mono,
  },
};
