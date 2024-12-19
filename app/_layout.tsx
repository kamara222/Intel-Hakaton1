import "@/i18n";
import { useFonts } from "expo-font";
import { Slot, Stack } from "expo-router";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="challenge1"
          options={{ animation: "ios_from_right" }}
        />
      </Stack>
    </PaperProvider>
  );
}
