import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useZip } from "../context/zipContext";
import { vehicles } from "../data/vehicles";
import { styles } from "../styles";

type GasCategory = "sedan" | "truck" | "sports" | "hatchback" | "suv";

const CATEGORY_ORDER: GasCategory[] = ["sedan", "truck", "sports", "hatchback", "suv"];

const CATEGORY_LABEL: Record<GasCategory, string> = {
  sedan: "Sedan",
  truck: "Truck",
  sports: "Sport",
  hatchback: "Hatch",
  suv: "SUV",
};

export default function GasScreen() {
  const { zip } = useZip();
  const router = useRouter();

  const listRef = useRef<FlatList<any>>(null);

  // Suppress "active tab" updates while jumping/settling (prevents flicker)
  const suppressActiveUpdatesUntil = useRef(0);

  // 1) Pull gas vehicles
  const gasVehicles = useMemo(() => vehicles.filter((v) => v.type === "gas"), []);

  // 2) Build "model cards" (one per model) with category + min price + trims count
  const modelCards = useMemo(() => {
    const map = new Map<
      string,
      { model: string; make: string; category: string; minPrice: number; trimsCount: number }
    >();

    for (const v of gasVehicles) {
      const key = v.model;
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          model: v.model,
          make: v.make,
          category: v.category,
          minPrice: typeof v.price === "number" ? v.price : Number.MAX_SAFE_INTEGER,
          trimsCount: 1,
        });
      } else {
        existing.trimsCount += 1;
        if (typeof v.price === "number") existing.minPrice = Math.min(existing.minPrice, v.price);
      }
    }

    return Array.from(map.values());
  }, [gasVehicles]);

  // 3) Group model cards by category
  const cardsByCategory = useMemo(() => {
    const grouped: Record<GasCategory, typeof modelCards> = {
      sedan: [],
      truck: [],
      sports: [],
      hatchback: [],
      suv: [],
    };

    for (const card of modelCards) {
      const cat = card.category as GasCategory;
      if (grouped[cat]) grouped[cat].push(card);
    }

    // Sort each category alphabetically
    for (const cat of CATEGORY_ORDER) {
      grouped[cat].sort((a, b) => a.model.localeCompare(b.model));
    }

    return grouped;
  }, [modelCards]);

  // 4) Flatten into one list with header rows + item rows
  const sectionData = useMemo(() => {
    const out: Array<
      | { kind: "header"; category: GasCategory; title: string }
      | {
          kind: "item";
          category: GasCategory;
          model: string;
          make: string;
          minPrice: number;
          trimsCount: number;
        }
    > = [];

    for (const cat of CATEGORY_ORDER) {
      const items = cardsByCategory[cat];
      if (!items || items.length === 0) continue;

      out.push({ kind: "header", category: cat, title: `${CATEGORY_LABEL[cat]}s` });

      for (const it of items) {
        out.push({
          kind: "item",
          category: cat,
          model: it.model,
          make: it.make,
          minPrice: it.minPrice,
          trimsCount: it.trimsCount,
        });
      }
    }

    return out;
  }, [cardsByCategory]);

  // 5) Map each category -> header index in the big list
  const headerIndexByCategory = useMemo(() => {
    const m = new Map<GasCategory, number>();
    sectionData.forEach((row, idx) => {
      if (row.kind === "header") m.set(row.category, idx);
    });
    return m;
  }, [sectionData]);

  const availableCats = useMemo(
    () => CATEGORY_ORDER.filter((c) => headerIndexByCategory.has(c)),
    [headerIndexByCategory]
  );

  const [activeCat, setActiveCat] = useState<GasCategory>(availableCats[0] ?? "sedan");

  // Precompute header indices sorted ascending (for stable “which section am I in?”)
  const sortedHeaderIndices = useMemo(() => {
    const arr: Array<{ cat: GasCategory; idx: number }> = [];
    headerIndexByCategory.forEach((idx, cat) => arr.push({ cat, idx }));
    arr.sort((a, b) => a.idx - b.idx);
    return arr;
  }, [headerIndexByCategory]);

  const categoryForListIndex = (listIndex: number): GasCategory | null => {
    // Find the last header whose index <= listIndex
    let best: { cat: GasCategory; idx: number } | null = null;
    for (const h of sortedHeaderIndices) {
      if (h.idx <= listIndex) best = h;
      else break;
    }
    return best ? best.cat : null;
  };

  const jumpTo = (cat: GasCategory) => {
    const idx = headerIndexByCategory.get(cat);
    if (idx == null) return;

    // Immediately reflect selection
    if (cat !== activeCat) setActiveCat(cat);

    // Suppress scroll-driven updates while the list animates/settles
    suppressActiveUpdatesUntil.current = Date.now() + 700;

    listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
  };

  // Track which section is visible while scrolling (without flicker)
  const viewabilityConfig = useRef({
    // Make it less sensitive so short sections don’t “bounce” active tab
    viewAreaCoveragePercentThreshold: 25,
    minimumViewTime: 120,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (Date.now() < suppressActiveUpdatesUntil.current) return;

    // Pick the topmost visible row by index (most stable)
    const topMost = [...viewableItems]
      .filter((vi: any) => typeof vi.index === "number")
      .sort((a: any, b: any) => a.index - b.index)[0];

    if (!topMost) return;

    const cat = categoryForListIndex(topMost.index);
    if (cat && cat !== activeCat) setActiveCat(cat);
  }).current;

  const SegmentedControl = () => {
    const cats = availableCats;
    if (cats.length <= 1) return null;

    return (
      <View style={{ marginTop: 12, marginBottom: 10, alignSelf: "center", width: "100%" }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#F2F2F7",
            borderRadius: 12,
            padding: 3,
            borderWidth: 1,
            borderColor: "#E5E5EA",
          }}
        >
          {cats.map((cat) => {
            const selected = cat === activeCat;

            return (
              <Pressable
                key={cat}
                onPress={() => jumpTo(cat)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 8,
                    borderRadius: 9,
                    backgroundColor: selected ? "#FFFFFF" : "transparent",
                    opacity: pressed ? 0.7 : 1,
                    shadowColor: selected ? "#000" : "transparent",
                    shadowOpacity: selected ? 0.08 : 0,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: selected ? 2 : 0,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: selected ? "#111" : "#6B7280",
                  }}
                  numberOfLines={1}
                >
                  {CATEGORY_LABEL[cat]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={{ ...styles.container, backgroundColor: "#ffffff" }}>
      <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center" }}>Gas Vehicles</Text>

      {/* ZIP pill */}
      <View
        style={{
          alignSelf: "center",
          backgroundColor: "#F3F4F6",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          marginTop: 10,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#444" }}>ZIP {zip}</Text>
      </View>

      {/* Apple-style segmented control */}
      <SegmentedControl />

      <FlatList
        ref={listRef}
        data={sectionData}
        keyExtractor={(row, idx) =>
          row.kind === "header" ? `h-${row.category}-${idx}` : `i-${row.model}-${idx}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        onScrollToIndexFailed={() => {
          // If layout isn't measured yet, ignore; user can tap again.
        }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }) => {
          if (item.kind === "header") {
            return (
              <Text
                style={{
                  marginTop: 4,
                  marginBottom: 10,
                  fontSize: 18,
                  fontWeight: "900",
                  color: "#111",
                }}
              >
                {item.title}
              </Text>
            );
          }

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/model-trims",
                  params: { model: item.model, type: "gas" },
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
              {/* Top row: model name (wraps) + price (stays right) */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: "800", color: "#111" }}>
                    {item.make} {item.model}
                  </Text>
                </View>

                <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }} numberOfLines={1}>
                  From ${item.minPrice.toLocaleString()}
                </Text>
              </View>

              <Text style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
                {item.trimsCount} trims available
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}