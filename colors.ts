/** Rx/Check — matched to rx-check-safe-scan.lovable.app */
export const colors = {
  // Brand
  teal: '#0E6E63',
  tealDark: '#0A5249',
  tealMuted: '#5A9A90',
  tealLight: '#E6F3F1',
  mint: '#D4EDE8',

  // Surfaces
  paper: '#F0F4EF',       // soft mint-paper page bg
  paperGrid: '#E4EAE3',
  white: '#FFFFFF',
  surface: '#FAFCFA',
  ink: '#0F1A17',         // near-black for dark cards
  inkSoft: '#1A2420',

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

  // Borders
  border: '#D8E0D6',
  borderStrong: '#B8C0B6',
  shadow: 'rgba(15, 26, 23, 0.06)',
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
