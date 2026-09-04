/** Rx/Check clinical design tokens */
export const colors = {
  // Brand
  teal: '#0E6E63',
  tealDark: '#0A5249',
  tealLight: '#E6F3F1',

  // Paper / background
  paper: '#F4F6F2',
  paperGrid: '#E8EBE6',
  white: '#FFFFFF',
  surface: '#FAFBFO',

  // Severity
  error: '#B33A2E',
  errorBg: '#FDF2F1',
  warning: '#C47A1A',
  warningBg: '#FDF8F0',
  safe: '#2F6B3A',
  safeBg: '#F0F7F1',

  // Text
  textPrimary: '#1A1F1C',
  textSecondary: '#5A635C',
  textMuted: '#8A938C',
  textInverse: '#FFFFFF',

  // Borders / shadows
  border: '#D5DBD4',
  borderStrong: '#B8C0B6',
  shadow: 'rgba(14, 110, 99, 0.08)',
} as const;

export type Severity = 'error' | 'warning' | 'safe' | 'info';

export const severityColor = (s: Severity) => {
  switch (s) {
    case 'error': return colors.error;
    case 'warning': return colors.warning;
    case 'safe': return colors.safe;
    default: return colors.teal;
  }
};

export const severityBg = (s: Severity) => {
  switch (s) {
    case 'error': return colors.errorBg;
    case 'warning': return colors.warningBg;
    case 'safe': return colors.safeBg;
    default: return colors.tealLight;
  }
};
