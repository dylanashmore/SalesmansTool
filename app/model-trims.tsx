import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { vehicles } from "../data/vehicles";
import { styles } from "../styles";

type Row =
  | { kind: "header"; year: number; key: string }
  | { kind: "item"; key: string; vehicle: any };

export default function ModelTrimsScreen() {
  const { model, type } = useLocalSearchParams();
  const router = useRouter();

  const modelString = Array.isArray(model) ? model[0] : model;

  // Handle comma-separated types (for hybrid + plug-in-hybrid)
  const typeString = Array.isArray(type) ? type[0] : type;
  const types = typeString ? typeString.split(",") : [];

  // Filter vehicles by model and type(s), then sort newest year first
  const modelVehicles = useMemo(() => {
    return vehicles
      .filter((v) => v.model === modelString && types.includes(v.type))
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  }, [modelString, types.join(",")]);

  // Build a single FlatList dataset with YEAR HEADERS
  // Flow: 2026 header + trims, then 2025 header + trims (only if they exist)
  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    let currentYear: number | null = null;

    for (const v of modelVehicles) {
      const y = v.year ?? 0;
      if (currentYear !== y) {
        currentYear = y;
        out.push({ kind: "header", year: y, key: `year-${y}` });
      }
      out.push({ kind: "item", vehicle: v, key: v.id });
    }

    return out;
  }, [modelVehicles]);

  return (
    <View style={{ ...styles.container, backgroundColor: "#ffffff" }}>
      <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center" }}>
        {modelString} Trims
      </Text>
      <Text style={{ textAlign: "center", color: "#666", marginTop: 6, marginBottom: 8 }}>
        Tap a trim to view details
      </Text>

      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          if (item.kind === "header") {
            return (
              <View style={{marginBottom: 10 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "900",
                    color: "#111",
                    textAlign: "left",
                    marginBottom: 6,
                  }}
                >
                  {item.year}
                </Text>
              </View>
            );
          }

          const v = item.vehicle;

          const statLabel =
            v.type === "electric" ? `${v.rangeElectric} mi range` : `${v.mpgCombined} MPG combined`;

          const typeLabel =
            v.type === "electric"
              ? "Electric"
              : v.type === "plug-in-hybrid"
              ? "Plug-in Hybrid"
              : v.type === "hybrid"
              ? "Hybrid"
              : "Gas";

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/vehicle-detail",
                  params: { vehicleId: v.id },
                })
              }
              style={({ pressed }) => [
                {
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 18,
                  backgroundColor: "#e3ded9",
                  overflow: "hidden",
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                  opacity: pressed ? 0.96 : 1,
                },
              ]}
            >
              {/* Top row: trim + price */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>{v.trim}</Text>

                <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>
                  ${v.price.toLocaleString()}
                </Text>
              </View>

              {/* Chips row */}
              <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.65)",
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#333" }}>{statLabel}</Text>
                </View>

                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.65)",
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#333" }}>{typeLabel}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}