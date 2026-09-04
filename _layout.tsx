import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.paper },
          headerTintColor: colors.teal,
          headerTitleStyle: { fontWeight: '600', fontSize: 16 },
          contentStyle: { backgroundColor: colors.paper },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="patient" options={{ headerShown: false }} />
        <Stack.Screen name="prescription" options={{ title: 'Prescription' }} />
        <Stack.Screen name="analysis" options={{ title: 'AI scan', headerBackVisible: false }} />
        <Stack.Screen name="results" options={{ title: 'Findings' }} />
        <Stack.Screen name="alternatives" options={{ title: 'Alternatives' }} />
        <Stack.Screen name="report" options={{ title: 'Safety report' }} />
        <Stack.Screen name="history" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ title: 'Scan prescription', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
