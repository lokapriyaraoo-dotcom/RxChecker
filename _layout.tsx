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
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.paper },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Rx/Check', headerShown: false }} />
        <Stack.Screen name="patient" options={{ title: 'Patient details' }} />
        <Stack.Screen name="prescription" options={{ title: 'Prescription entry' }} />
        <Stack.Screen name="analysis" options={{ title: 'AI analysis', headerBackVisible: false }} />
        <Stack.Screen name="results" options={{ title: 'Findings' }} />
        <Stack.Screen name="alternatives" options={{ title: 'Alternatives' }} />
        <Stack.Screen name="report" options={{ title: 'Safety report' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
        <Stack.Screen name="camera" options={{ title: 'Scan prescription', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
