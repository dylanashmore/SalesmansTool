import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useZip } from "../context/zipContext";
import { vehicles } from "../data/vehicles";
import { styles } from "../styles";

export default function ElectricScreen() {
  const { zip } = useZip();
  const router = useRouter();

  // Pull electric vehicles
  const electricVehicles = useMemo(
    () => vehicles.filter((v) => v.type === "electric"),
    []
  );

  // Build model cards (one per model)
  const modelCards = useMemo(() => {
    const map = new Map<
      string,
      { model: string; make: string; minPrice: number; trimsCount: number }
    >();

    for (const v of electricVehicles) {
      const key = v.model;
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          model: v.model,
          make: v.make,
          minPrice:
            typeof v.price === "number"
              ? v.price
              : Number.MAX_SAFE_INTEGER,
          trimsCount: 1,
        });
      } else {
        existing.trimsCount += 1;
        if (typeof v.price === "number")
          existing.minPrice = Math.min(existing.minPrice, v.price);
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.model.localeCompare(b.model)
    );
  }, [electricVehicles]);

  return (
    <View style={{ ...styles.container, backgroundColor: "#ffffff" }}>
      <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center" }}>
        Electric Vehicles
      </Text>

      {/* ZIP pill */}
      <View
        style={{
          alignSelf: "center",
          backgroundColor: "#F3F4F6",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          marginTop: 10,
          marginBottom: 18,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#444" }}>
          ZIP {zip}
        </Text>
      </View>

      <FlatList
        data={modelCards}
        keyExtractor={(item) => item.model}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/model-trims",
                params: {
                  model: item.model,
                  type: "electric",
                },
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
            {/* Top row: model name wraps + price */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>
                  {item.make} {item.model}
                </Text>
              </View>

              <Text
                style={{ fontSize: 16, fontWeight: "800", color: "#111" }}
                numberOfLines={1}
              >
                From ${item.minPrice.toLocaleString()}
              </Text>
            </View>

            <Text style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
              {item.trimsCount} trims available
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}