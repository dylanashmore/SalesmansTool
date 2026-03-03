import { Redirect, Stack, useSegments } from "expo-router";
import { CompareProvider } from "../context/CompareContext";
import { ZipProvider, useZip } from "../context/zipContext";

function RootGate() {
  const { zip } = useZip();
  const segments = useSegments();

  const onZipScreen = segments[0] === "zip";

  if (!zip && !onZipScreen) {
    return <Redirect href="/zip" />;
  }
return (
  <Stack
  screenOptions={{
    headerShown: true,
    headerTitle: "",
    headerShadowVisible: false,
    headerTransparent: true, // key: removes the “bar” feeling
  }}
/>
);
}

export default function RootLayout() {
  return (
    <CompareProvider>
      <ZipProvider>
        <RootGate />
      </ZipProvider>
    </CompareProvider>
  );
}