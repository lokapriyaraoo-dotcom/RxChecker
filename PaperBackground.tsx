import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme';

/** Subtle paper-grid clinical background */
export function PaperBackground({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.grid} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    // Approximate grid via repeating linear-ish effect using borders is limited in RN;
    // solid paper is fine; real grid can be SVG pattern in production.
    backgroundColor: colors.paper,
  },
});
