import React, { useEffect, useReducer } from 'react';
import { BackHandler, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { IBMPlexSans_400Regular, IBMPlexSans_500Medium, IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import { initialState, reducer } from './src/state/reducer';
import type { Screen } from './src/state/reducer';
import { loadHistory, saveHistory } from './src/state/storage';
import Home from './src/screens/Home';
import Patient from './src/screens/Patient';
import Prescription from './src/screens/Prescription';
import Analysis from './src/screens/Analysis';
import Results from './src/screens/Results';
import Alternatives from './src/screens/Alternatives';
import Report from './src/screens/Report';
import { C } from './src/ui/theme';

const BACK: Record<Screen, Screen | null> = {
  home: null,
  patient: 'home',
  meds: 'patient',
  analysis: 'meds',
  results: 'meds',
  alternatives: 'results',
  report: 'alternatives',
};

export default function App() {
  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular, IBMPlexSans_500Medium, IBMPlexSans_600SemiBold,
    IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold,
  });
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState());

  // load saved history once, then persist every change
  const [loaded, setLoaded] = React.useState(false);
  useEffect(() => {
    loadHistory().then((entries) => {
      dispatch({ type: 'HISTORY_LOADED', entries });
      setLoaded(true);
    });
  }, []);
  useEffect(() => {
    if (loaded) void saveHistory(state.history);
  }, [state.history, loaded]);

  // Android hardware back button follows the wizard
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const prev = BACK[state.screen];
      if (!prev) return false;
      dispatch({ type: 'GO', screen: prev });
      return true;
    });
    return () => sub.remove();
  }, [state.screen]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: C.paper }} />;

  const props = { state, dispatch };
  const screen = {
    home: <Home {...props} />,
    patient: <Patient {...props} />,
    meds: <Prescription {...props} />,
    analysis: <Analysis {...props} />,
    results: <Results {...props} />,
    alternatives: <Alternatives {...props} />,
    report: <Report {...props} />,
  }[state.screen];

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen}
    </SafeAreaProvider>
  );
}
