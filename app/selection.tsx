import { type Href, useRouter } from "expo-router";
import { Image, Pressable, StatusBar, Text, View } from "react-native";
import { SearchButton } from "../components/SearchButton";
import { useZip } from "../context/zipContext";

const TYPES: Array<{
  label: string;
  sub: string;
  route: Href;
  image: number;
  tag: string;
  tagColor: string;
}> = [
  {
    label: "Gas",
    sub: "Traditional gasoline-powered",
    route: "/gas",
    image: require("./images/gas.png"),
    tag: "Most Popular",
    tagColor: "#CC0000",
  },
  {
    label: "Hybrid",
    sub: "Gas + electric efficiency",
    route: "/hybrid",
    image: require("./images/hybrid.png"),
    tag: "Best Value",
    tagColor: "#1A6E3C",
  },
  {
    label: "Electric",
    sub: "Zero-emission, fully electric",
    route: "/electric",
    image: require("./images/electric.png"),
    tag: "Future-Ready",
    tagColor: "#1A4FA8",
  },
];

export default function SelectionScreen() {
  const router = useRouter();
  const { zip } = useZip();

  return (
    <View style={{ flex: 1, backgroundColor: "#1C1C1E" }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ paddingTop: 64, paddingBottom: 28, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Toyota Sales</Text>
            <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "800", letterSpacing: -0.5 }}>Vehicle Type</Text>
          </View>
          <SearchButton />
        </View>
        <View style={{ marginTop: 12, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#CC0000" }} />
          <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 }}>ZIP {zip}</Text>
        </View>
      </View>

      {/* Cards */}
      <View style={{ flex: 1, backgroundColor: "#F4F4F4", borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20, gap: 12 }}>
        {TYPES.map((t) => (
          <Pressable
            key={t.label}
            onPress={() => router.push(t.route)}
            style={({ pressed }) => ({
              backgroundColor: "#FFF",
              borderRadius: 18,
              overflow: "hidden",
              height: 154,
              flexDirection: "row",
              alignItems: "center",
              opacity: pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.984 : 1 }],
              // Subtle shadow
              shadowColor: "#000",
              shadowOpacity: 0.07,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            })}
          >
            {/* Left text */}
            <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 20, justifyContent: "center" }}>
              {/* Tag */}
              <View style={{ alignSelf: "flex-start", backgroundColor: t.tagColor + "18", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: t.tagColor, letterSpacing: 0.5 }}>{t.tag}</Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#0D0D0D", letterSpacing: -0.5, marginBottom: 3 }}>{t.label}</Text>
              <Text style={{ fontSize: 12, color: "#888", lineHeight: 16 }}>{t.sub}</Text>
              {/* Arrow pill */}
              <View style={{ marginTop: 12, alignSelf: "flex-start", backgroundColor: "#F0F0F0", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#444" }}>Browse</Text>
                <Text style={{ fontSize: 11, color: "#888" }}>→</Text>
              </View>
            </View>

            {/* Right image */}
            <View style={{ width: 184, height: 154, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Image
                source={t.image}
                style={{ width: 182, height: 132 }}
                resizeMode="contain"
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
