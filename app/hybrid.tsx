import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useZip } from "../context/zipContext";
import { vehicles } from "../data/vehicles";
import { styles } from "../styles";

type HybridCategory = "sedan" | "truck" | "sports" | "hatchback" | "suv" | "minivan";

const CATEGORY_ORDER: HybridCategory[] = ["sedan", "truck", "sports", "hatchback", "suv", "minivan"];

const CATEGORY_LABEL: Record<HybridCategory, string> = {
  sedan: "Sedan",
  truck: "Truck",
  sports: "Sport",
  hatchback: "Hatch",
  suv: "SUV",
  minivan: "Minivan",
};

export default function HybridScreen() {
  const { zip } = useZip();
  const router = useRouter();

  const listRef = useRef<FlatList<any>>(null);
  const suppressActiveUpdatesUntil = useRef(0);

  // 1) Pull hybrids (includes plug-in-hybrid)
  const hybridVehicles = useMemo(
    () => vehicles.filter((v) => v.type === "hybrid" || v.type === "plug-in-hybrid"),
    []
  );

  // 2) Build model cards (one per model): category + min price + trims count
  const modelCards = useMemo(() => {
    const map = new Map<
      string,
      { model: string; make: string; category: string; minPrice: number; trimsCount: number }
    >();

    for (const v of hybridVehicles) {
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
  }, [hybridVehicles]);

  // 3) Group by category
  const cardsByCategory = useMemo(() => {
    const grouped: Record<HybridCategory, typeof modelCards> = {
      sedan: [],
      truck: [],
      sports: [],
      hatchback: [],
      suv: [],
      minivan: [],
    };

    for (const card of modelCards) {
      const cat = card.category as HybridCategory;
      if (grouped[cat]) grouped[cat].push(card);
    }

    for (const cat of CATEGORY_ORDER) {
      grouped[cat].sort((a, b) => a.model.localeCompare(b.model));
    }

    return grouped;
  }, [modelCards]);

  // Categories that actually exist on this page (in order)
  const presentCats = useMemo(
    () => CATEGORY_ORDER.filter((c) => (cardsByCategory[c] ?? []).length > 0),
    [cardsByCategory]
  );

  // If only one category, don’t show headers or segmented control
  const hideHeaders = presentCats.length <= 1;

  // 4) Flat list rows: optional headers + items
  const sectionData = useMemo(() => {
    const out: Array<
      | { kind: "header"; category: HybridCategory; title: string }
      | {
          kind: "item";
          category: HybridCategory;
          model: string;
          make: string;
          minPrice: number;
          trimsCount: number;
        }
    > = [];

    for (const cat of presentCats) {
      const items = cardsByCategory[cat];
      if (!items || items.length === 0) continue;

      if (!hideHeaders) {
        out.push({ kind: "header", category: cat, title: `${CATEGORY_LABEL[cat]}s` });
      }

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
  }, [cardsByCategory, presentCats, hideHeaders]);

  // 5) Header index map for jumping (only if headers exist)
  const headerIndexByCategory = useMemo(() => {
    const m = new Map<HybridCategory, number>();
    if (hideHeaders) return m;

    sectionData.forEach((row, idx) => {
      if (row.kind === "header") m.set(row.category, idx);
    });
    return m;
  }, [sectionData, hideHeaders]);

  const availableCats = useMemo(() => presentCats, [presentCats]);

  const [activeCat, setActiveCat] = useState<HybridCategory>(availableCats[0] ?? "suv");

  const sortedHeaderIndices = useMemo(() => {
    const arr: Array<{ cat: HybridCategory; idx: number }> = [];
    headerIndexByCategory.forEach((idx, cat) => arr.push({ cat, idx }));
    arr.sort((a, b) => a.idx - b.idx);
    return arr;
  }, [headerIndexByCategory]);

  const categoryForListIndex = (listIndex: number): HybridCategory | null => {
    let best: { cat: HybridCategory; idx: number } | null = null;
    for (const h of sortedHeaderIndices) {
      if (h.idx <= listIndex) best = h;
      else break;
    }
    return best ? best.cat : null;
  };

  const jumpTo = (cat: HybridCategory) => {
    if (hideHeaders) return;
    const idx = headerIndexByCategory.get(cat);
    if (idx == null) return;

    if (cat !== activeCat) setActiveCat(cat);
    suppressActiveUpdatesUntil.current = Date.now() + 700;

    listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
  };

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 25,
    minimumViewTime: 120,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (hideHeaders) return;
    if (Date.now() < suppressActiveUpdatesUntil.current) return;

    const topMost = [...viewableItems]
      .filter((vi: any) => typeof vi.index === "number")
      .sort((a: any, b: any) => a.index - b.index)[0];

    if (!topMost) return;

    const cat = categoryForListIndex(topMost.index);
    if (cat && cat !== activeCat) setActiveCat(cat);
  }).current;

  const SegmentedControl = () => {
    const cats = availableCats;

    // If only one category (or we removed headers), don’t show the control
    if (cats.length <= 1 || hideHeaders) return null;

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
      <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center" }}>Hybrid Vehicles</Text>

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

      <SegmentedControl />

      <FlatList
        ref={listRef}
        data={sectionData}
        keyExtractor={(row, idx) =>
          row.kind === "header" ? `h-${row.category}-${idx}` : `i-${row.model}-${idx}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        onScrollToIndexFailed={() => {}}
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
                  params: { model: item.model, type: "hybrid,plug-in-hybrid" },
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