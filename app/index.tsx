import { Text, View } from "react-native";
import { useZip } from "../context/zipContext";


export default function Index() {
  const { zip } = useZip();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Current Zip: {zip}</Text>
    </View>
  );
}
