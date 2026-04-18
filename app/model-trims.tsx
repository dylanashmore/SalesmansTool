// ─────────────────────────────────────────────────────────────────────────────
// model-trims.tsx
// ─────────────────────────────────────────────────────────────────────────────
//
// Visual changes:
//  • Dark charcoal header with model name + back chevron
//  • Year badge instead of raw header text
//  • Trim cards: white bg, shadow, price in bold right-aligned, chips redesigned
//
// Replace your existing app/model-trims.tsx with this file.

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, StatusBar, Text, View } from "react-native";
import { SearchButton } from "../components/SearchButton";
import { useZip } from "../context/zipContext";
import { vehicles } from "../data/vehicles";

type Row = { kind: "header"; year: number; key: string } | { kind: "item"; key: string; vehicle: any };

export default function ModelTrimsScreen() {
  const { model, type } = useLocalSearchParams();
  const router = useRouter();
  const { zip } = useZip();
  const modelString = Array.isArray(model) ? model[0] : model;
  const typeString = Array.isArray(type) ? type[0] : type;
  const types = typeString ? typeString.split(",") : [];

  const modelVehicles = useMemo(() =>
    vehicles.filter((v) => v.model === modelString && types.includes(v.type)).sort((a, b) => (b.year ?? 0) - (a.year ?? 0)),
    [modelString, types.join(",")]
  );

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    let currentYear: number | null = null;
    for (const v of modelVehicles) {
      const y = v.year ?? 0;
      if (currentYear !== y) { currentYear = y; out.push({ kind: "header", year: y, key: `year-${y}` }); }
      out.push({ kind: "item", vehicle: v, key: v.id });
    }
    return out;
  }, [modelVehicles]);

  const typeLabel = (t: string) =>
    t === "electric" ? "Electric" : t === "plug-in-hybrid" ? "Plug-in Hybrid" : t === "hybrid" ? "Hybrid" : "Gas";

  return (
    <View style={{ flex: 1, backgroundColor: "#1C1C1E" }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ paddingTop: 60, paddingBottom: 22, paddingHorizontal: 22 }}>
        <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16, alignSelf: "flex-start" }}>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>‹</Text>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600" }}>Back</Text>
        </Pressable>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 4 }}>Select Trim</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Text style={{ color: "#FFF", fontSize: 22, fontWeight: "800", letterSpacing: -0.4, flex: 1 }}>{modelString}</Text>
          <SearchButton />
        </View>
        <View style={{ marginTop: 12, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: "#CC0000" }} />
          <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 }}>ZIP {zip}</Text>
        </View>
      </View>

      {/* List */}
      <View style={{ flex: 1, backgroundColor: "#F4F4F4", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <FlatList
          data={rows}
          keyExtractor={(row) => row.key}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 36 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.kind === "header") {
              return (
                <View style={{ marginTop: 18, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ backgroundColor: "#CC0000", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "800", letterSpacing: 0.5 }}>{item.year}</Text>
                  </View>
                  <View style={{ flex: 1, height: 1, backgroundColor: "#E0E0E0" }} />
                </View>
              );
            }

            const v = item.vehicle;
            const statLabel = v.type === "electric" ? `${v.rangeElectric} mi range` : `${v.mpgCombined} MPG combined`;

            return (
              <Pressable
                onPress={() => router.push({ pathname: "/vehicle-detail", params: { vehicleId: v.id } })}
                style={({ pressed }) => ({
                  backgroundColor: "#FFF",
                  borderRadius: 16,
                  marginBottom: 10,
                  padding: 16,
                  transform: [{ scale: pressed ? 0.984 : 1 }],
                  opacity: pressed ? 0.94 : 1,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                })}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#0D0D0D" }}>{v.trim}</Text>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#0D0D0D" }}>${v.price.toLocaleString()}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <View style={{ backgroundColor: "#F0F0F0", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#444" }}>{statLabel}</Text>
                  </View>
                  <View style={{ backgroundColor: "#F0F0F0", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#444" }}>{typeLabel(v.type)}</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}
