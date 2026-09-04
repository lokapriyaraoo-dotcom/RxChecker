import { TextStyle } from 'react-native';

/** IBM Plex family — load via expo-font in production */
export const fonts = {
  sans: 'IBMPlexSans',
  sansMedium: 'IBMPlexSans-Medium',
  sansSemi: 'IBMPlexSans-SemiBold',
  mono: 'IBMPlexMono',
  monoMedium: 'IBMPlexMono-Medium',
} as const;

export const typography = {
  hero: {
    fontFamily: fonts.sansSemi,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  } as TextStyle,
  h1: {
    fontFamily: fonts.sansSemi,
    fontSize: 22,
    lineHeight: 28,
  } as TextStyle,
  h2: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    lineHeight: 24,
  } as TextStyle,
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,
  bodySmall: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  } as TextStyle,
  mono: {
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
  caption: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,
} as const;
