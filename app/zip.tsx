import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useZip } from "../context/zipContext";
import { styles } from "../styles";

export default function ZipScreen() {
  const router = useRouter();
  const { setZip } = useZip();

  const [zipInput, setZipInput] = useState("");

  const submitZip = () => {
    const cleaned = zipInput.replace(/\D/g, "");

    if (cleaned.length !== 5) {
      Alert.alert("Invalid ZIP", "Enter a 5-digit ZIP code.");
      return;
    }

    setZip(cleaned);
    router.replace("/selection");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter customer ZIP</Text>

      <TextInput
        value={zipInput}
        onChangeText={setZipInput}
        placeholder="e.g. 32816"
        keyboardType="number-pad"
        maxLength={5}
        autoFocus
        style={styles.input}
      />

      <Pressable onPress={submitZip} style={styles.buttonPrimary}>
        <Text style={styles.buttonPrimaryText}>Continue</Text>
      </Pressable>
    </View>
  );
}