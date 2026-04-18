import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Pressable, StatusBar, Text, TextInput, View,
} from "react-native";
import { useZip } from "../context/zipContext";

export default function ZipScreen() {
  const router = useRouter();
  const { setZip } = useZip();
  const zipInputRef = useRef<TextInput>(null);
  const [zip, setZipLocal] = useState("");
  const [focused, setFocused] = useState(false);
  const isReady = zip.replace(/\D/g, "").length === 5;

  const submit = () => {
    const cleaned = zip.replace(/\D/g, "");
    if (cleaned.length !== 5) { Alert.alert("Invalid ZIP", "Please enter a valid 5-digit ZIP code."); return; }
    setZip(cleaned);
    router.push("/selection");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1C1C1E" }}>
      <StatusBar barStyle="light-content" />

      {/* Brand header */}
      <View style={{ paddingTop: 80, paddingBottom: 52, paddingHorizontal: 28, alignItems: "center" }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: "#CC0000", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "900" }}>T</Text>
          </View>
        </View>
        <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700", letterSpacing: 4, textTransform: "uppercase", opacity: 0.4, marginBottom: 8 }}>Toyota</Text>
        <Text style={{ color: "#FFF", fontSize: 26, fontWeight: "800", letterSpacing: -0.5, textAlign: "center" }}>Sales Advisor</Text>
        <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, marginTop: 6, textAlign: "center" }}>Vehicle comparison & fuel cost analysis</Text>
      </View>

      {/* Sheet */}
      <View style={{ flex: 1, backgroundColor: "#FFF", borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 26, paddingTop: 34, paddingBottom: 44 }}>
        <View>
          <Text style={{ fontSize: 21, fontWeight: "800", color: "#0D0D0D", letterSpacing: -0.4, marginBottom: 5 }}>Customer Location</Text>
          <Text style={{ fontSize: 13, color: "#888", lineHeight: 19, marginBottom: 26 }}>
            Enter the customer's ZIP code to pull real-time local gas prices and calculate accurate fuel costs.
          </Text>

          {/* Input */}
          <Pressable onPress={() => zipInputRef.current?.focus()}>
            <View style={{ borderWidth: focused ? 2 : 1.5, borderColor: focused ? "#CC0000" : "#E2E2E2", borderRadius: 14, backgroundColor: focused ? "#FFF9F9" : "#F5F5F5", paddingHorizontal: 18, paddingTop: 10, paddingBottom: 12, marginBottom: 10 }}>
              <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1.8, color: focused ? "#CC0000" : "#999", textTransform: "uppercase", marginBottom: 3 }}>ZIP Code</Text>
              <TextInput
                ref={zipInputRef}
                value={zip}
                onChangeText={setZipLocal}
                placeholder="_ _ _ _ _"
                placeholderTextColor="#CCC"
                keyboardType="number-pad"
                maxLength={5}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                returnKeyType="done"
                onSubmitEditing={submit}
                style={{ fontSize: 30, fontWeight: "700", color: "#0D0D0D", letterSpacing: 8, paddingVertical: 0 }}
              />
            </View>
          </Pressable>
          <Text style={{ fontSize: 12, color: "#BBBBBB", marginBottom: 30, marginLeft: 2 }}>5-digit US ZIP code</Text>

          {/* CTA */}
          <Pressable
            onPress={submit}
            style={({ pressed }) => ({
              backgroundColor: isReady ? "#CC0000" : "#EBEBEB",
              paddingVertical: 17, borderRadius: 13,
              alignItems: "center",
              opacity: pressed ? 0.87 : 1,
              transform: [{ scale: pressed ? 0.987 : 1 }],
            })}
          >
            <Text style={{ color: isReady ? "#FFF" : "#AAAAAA", fontSize: 15, fontWeight: "700", letterSpacing: 0.2 }}>
              {isReady ? "Continue to Vehicles →" : "Enter ZIP to Continue"}
            </Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 11, color: "#D0D0D0", textAlign: "center", marginTop: 18 }}>
          For authorized Toyota sales representatives only
        </Text>
      </View>
    </View>
  );
}
