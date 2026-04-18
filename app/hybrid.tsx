import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StatusBar, Text, View } from "react-native";
import { SearchButton } from "../components/SearchButton";
import { useZip } from "../context/zipContext";
import { vehicles } from "../data/vehicles";

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

  const hybridVehicles = useMemo(
    () => vehicles.filter((v) => v.type === "hybrid" || v.type === "plug-in-hybrid"),
    []
  );

  const modelCards = useMemo(() => {
    const map = new Map<string, { model: string; make: string; category: string; minPrice: number; trimsCount: number }>();
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
    for (const cat of CATEGORY_ORDER) grouped[cat].sort((a, b) => a.model.localeCompare(b.model));
    return grouped;
  }, [modelCards]);

  const sectionData = useMemo(() => {
    const out: any[] = [];
    for (const cat of CATEGORY_ORDER) {
      const items = cardsByCategory[cat];
      if (!items || items.length === 0) continue;
      out.push({ kind: "header", category: cat, title: CATEGORY_LABEL[cat] + "s" });
      for (const it of items) out.push({ kind: "item", ...it });
    }
    return out;
  }, [cardsByCategory]);

  const headerIndexByCategory = useMemo(() => {
    const m = new Map<HybridCategory, number>();
    sectionData.forEach((row, idx) => {
      if (row.kind === "header") m.set(row.category, idx);
    });
    return m;
  }, [sectionData]);

  const availableCats = useMemo(() => CATEGORY_ORDER.filter((c) => headerIndexByCategory.has(c)), [headerIndexByCategory]);
  const [activeCat, setActiveCat] = useState<HybridCategory>(availableCats[0] ?? "suv");

  const sortedHeaderIndices = useMemo(() => {
    const arr: Array<{ cat: HybridCategory; idx: number }> = [];
    headerIndexByCategory.forEach((idx, cat) => arr.push({ cat, idx }));
    return arr.sort((a, b) => a.idx - b.idx);
  }, [headerIndexByCategory]);

  const categoryForListIndex = (i: number): HybridCategory | null => {
    let best: { cat: HybridCategory; idx: number } | null = null;
    for (const h of sortedHeaderIndices) {
      if (h.idx <= i) best = h;
      else break;
    }
    return best ? best.cat : null;
  };

  const jumpTo = (cat: HybridCategory) => {
    const idx = headerIndexByCategory.get(cat);
    if (idx == null) return;
    if (cat !== activeCat) setActiveCat(cat);
    suppressActiveUpdatesUntil.current = Date.now() + 700;
    listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
  };

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 25, minimumViewTime: 120 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (Date.now() < suppressActiveUpdatesUntil.current) return;
    const top = [...viewableItems].filter((vi: any) => typeof vi.index === "number").sort((a: any, b: any) => a.index - b.index)[0];
    if (!top) return;
    const cat = categoryForListIndex(top.index);
    if (cat && cat !== activeCat) setActiveCat(cat);
  }).current;

  return (
    <View style={{ flex: 1, backgroundColor: "#1C1C1E" }}>
      <StatusBar barStyle="light-content" />

      <View style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 22 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Text style={{ color: "#FFF", fontSize: 22, fontWeight: "800", letterSpacing: -0.4, flex: 1 }}>Hybrid Vehicles</Text>
          <SearchButton />
        </View>
        <View style={{ marginTop: 12, marginBottom: 14, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: "#CC0000" }} />
          <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 }}>ZIP {zip}</Text>
        </View>

        {availableCats.length > 1 && (
          <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 3, gap: 2 }}>
            {availableCats.map((cat) => {
              const sel = cat === activeCat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => jumpTo(cat)}
                  style={({ pressed }) => ({
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 8,
                    borderRadius: 9,
                    backgroundColor: sel ? "#CC0000" : "transparent",
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: sel ? "#FFF" : "rgba(255,255,255,0.5)", letterSpacing: 0.3 }}>
                    {CATEGORY_LABEL[cat]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={{ flex: 1, backgroundColor: "#F4F4F4", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 8 }}>
        <FlatList
          ref={listRef}
          data={sectionData}
          keyExtractor={(row, idx) => (row.kind === "header" ? `h-${row.category}-${idx}` : `i-${row.model}-${idx}`)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 36, paddingTop: 8 }}
          onScrollToIndexFailed={() => {}}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item }) => {
            if (item.kind === "header") {
              return (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18, marginBottom: 10 }}>
                  <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: "#CC0000" }} />
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#888", letterSpacing: 1.5, textTransform: "uppercase" }}>{item.title}</Text>
                </View>
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
                style={({ pressed }) => ({
                  backgroundColor: "#FFF",
                  borderRadius: 16,
                  marginBottom: 10,
                  padding: 16,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transform: [{ scale: pressed ? 0.984 : 1 }],
                  opacity: pressed ? 0.94 : 1,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#0D0D0D", marginBottom: 3 }}>{item.make} {item.model}</Text>
                  <Text style={{ fontSize: 12, color: "#999" }}>{item.trimsCount} trims available</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#0D0D0D" }}>From ${item.minPrice.toLocaleString()}</Text>
                  <Text style={{ fontSize: 11, color: "#CC0000", fontWeight: "600" }}>View →</Text>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}