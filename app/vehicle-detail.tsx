// vehicle-detail.tsx  —  drop-in replacement
//
// Visual changes vs before:
//  • Dark header with year/make/model + ZIP badge
//  • Price displayed large with red accent underline
//  • Stats in a 2-col pill grid instead of raw text lines
//  • Info boxes (About, Cost Comparison) styled consistently
//  • Compare button in header right slot, styled with red/outline
//  • Swipe dots use red active state

import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, StatusBar, Text, View, useWindowDimensions } from "react-native";
import { SearchButton } from "../components/SearchButton";
import { useCompare } from "../context/CompareContext";
import { useZip } from "../context/zipContext";
import { vehicles } from "../data/vehicles";
import { vehiclePicById } from "./images/vehiclePics/vehiclePicMap";
import { getGasApiUrl } from "./utils/gasApi";

const ANNUAL_MILES = 15000;
const HOME_KWH = 0.1431;
const PUBLIC_KWH = 0.3970;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// ── Compare button ────────────────────────────────────────────────────────────
function CompareBtn({ vehicle }: { vehicle: any }) {
  const { addToCompareCart, removeFromCompareCart, isInCompareCart, isCompareFull } = useCompare();
  const inCart = isInCompareCart(vehicle.id);
  const disabled = isCompareFull && !inCart;

  return (
    <Pressable
      onPress={() => inCart ? removeFromCompareCart(vehicle.id) : addToCompareCart(vehicle)}
      disabled={disabled}
      style={({ pressed }) => ({
        paddingVertical: 7, paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: inCart ? "#F0F0F0" : disabled ? "#E0E0E0" : "#CC0000",
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ fontSize: 12, fontWeight: "700", color: inCart ? "#444" : disabled ? "#AAA" : "#FFF" }}>
        {inCart ? "Remove" : disabled ? "Full" : "+ Compare"}
      </Text>
    </Pressable>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F4", borderRadius: 12, padding: 12, minWidth: 130 }}>
      <Text style={{ fontSize: 10, fontWeight: "700", color: "#999", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#0D0D0D" }}>{value}</Text>
    </View>
  );
}

// ── Info box ──────────────────────────────────────────────────────────────────
function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 14, backgroundColor: "#F4F4F4", borderRadius: 14, padding: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <View style={{ width: 3, height: 13, borderRadius: 2, backgroundColor: "#CC0000" }} />
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#0D0D0D", letterSpacing: 0.3 }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ── Cost comparison box ───────────────────────────────────────────────────────
function CostCompare({ base, other, computed, gasPrice }: any) {
  if (!other || other.id === base.id || !computed) return null;
  const { baseAnnual, otherAnnual, priceDiff, annualDiff } = computed;
  const saves = annualDiff >= 0;

  return (
    <InfoBox title="Cost Comparison">
      <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
        {base.model} {base.trim} vs. {other.model} {other.trim}
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
        <StatPill label="Price Diff" value={`${priceDiff >= 0 ? "+" : "-"}$${Math.abs(priceDiff).toLocaleString()}`} />
        <StatPill label="Annual Fuel" value={`$${Math.round(baseAnnual)}/yr`} />
      </View>
      <View style={{ backgroundColor: saves ? "#EDFAF3" : "#FFF5F5", borderRadius: 10, padding: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: saves ? "#1A6E3C" : "#CC0000" }}>
          {saves
            ? `Save $${Math.round(annualDiff)}/yr on fuel with ${other.model} ${other.trim}`
            : `Spend $${Math.abs(Math.round(annualDiff))}/yr more on fuel with ${other.model} ${other.trim}`}
        </Text>
      </View>
      <Text style={{ fontSize: 11, color: "#AAA", marginTop: 8 }}>
        Gas ${gasPrice.toFixed(2)}/gal · Home electricity ${HOME_KWH.toFixed(4)}/kWh
      </Text>
    </InfoBox>
  );
}

// ── Vehicle hero image ────────────────────────────────────────────────────────
function HeroImage({ vehicleId, containerWidth }: { vehicleId: string; containerWidth: number }) {
  const src = vehiclePicById[vehicleId];
  if (!src) return null;
  const w = Math.max(200, containerWidth - 36);
  const h = Math.min(Math.round(w * 0.6), 240);
  return (
    <View style={{ alignItems: "center", marginTop: 16 }}>
      <Image source={src} contentFit="contain" style={{ width: w, height: h }} />
    </View>
  );
}

// ── Per-vehicle card ──────────────────────────────────────────────────────────
function VehicleCard({ vehicle, zip, gasPrice, gasPriceStatus, base, computed, pw, ph }: any) {
  const isElectric = vehicle.type === "electric";
  const isPHEV = vehicle.type === "plug-in-hybrid";
  const isGasLike = vehicle.type === "gas" || vehicle.type === "hybrid";
  const hasGasPrice = typeof gasPrice === "number" && gasPrice > 0;

  const milesPerKwh = (vehicle.rangeElectric && vehicle.batteryKwh) ? vehicle.rangeElectric / vehicle.batteryKwh : 0;
  const milesHomePerDollar = hasGasPrice ? milesPerKwh * (gasPrice / HOME_KWH) : 0;
  const milesPublicPerDollar = hasGasPrice ? milesPerKwh * (gasPrice / PUBLIC_KWH) : 0;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 90 }}
      style={{ width: pw, minHeight: ph }}
    >
      {/* Trim + compare */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#888", letterSpacing: 0.5 }}>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>
        <CompareBtn vehicle={vehicle} />
      </View>
      <Text style={{ fontSize: 22, fontWeight: "800", color: "#0D0D0D", marginBottom: 2 }}>{vehicle.trim}</Text>

      {/* Price */}
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2, marginTop: 6, marginBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#0D0D0D" }}>${vehicle.price.toLocaleString()}</Text>
        <Text style={{ fontSize: 13, color: "#888", marginLeft: 4 }}>MSRP</Text>
      </View>
      <View style={{ height: 2, width: 40, backgroundColor: "#CC0000", borderRadius: 2, marginBottom: 18 }} />

      {/* Stat pills */}
      {isGasLike && (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
          <StatPill label="City / Hwy" value={`${vehicle.mpgCity} / ${vehicle.mpgHwy} MPG`} />
          <StatPill label="Combined" value={`${vehicle.mpgCombined} MPG`} />
        </View>
      )}
      {(isElectric || isPHEV) && (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
          {vehicle.rangeElectric && <StatPill label="Electric Range" value={`${vehicle.rangeElectric} mi`} />}
          {vehicle.batteryKwh && <StatPill label="Battery" value={`${vehicle.batteryKwh} kWh`} />}
        </View>
      )}
      {isPHEV && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 4 }}>
          <StatPill label="Gas MPG" value={`${vehicle.mpgCombined} combined`} />
        </View>
      )}

      {/* Fuel breakdown */}
      <InfoBox title={`Fuel Breakdown — ZIP ${zip}`}>
        {gasPriceStatus === "loading" ? (
          <Text style={{ fontSize: 13, color: "#555", lineHeight: 20 }}>
            Loading local gas prices for this ZIP...
          </Text>
        ) : hasGasPrice ? (
          <Text style={{ fontSize: 13, color: "#555", lineHeight: 20 }}>
            Local gas price: <Text style={{ fontWeight: "700", color: "#0D0D0D" }}>${gasPrice.toFixed(2)}/gal</Text>
          </Text>
        ) : (
          <Text style={{ fontSize: 13, color: "#555", lineHeight: 20 }}>
            Local gas price is unavailable for this ZIP right now.
          </Text>
        )}
        {isGasLike && hasGasPrice && (
          <Text style={{ fontSize: 13, color: "#555", marginTop: 4, lineHeight: 20 }}>
            For ${gasPrice.toFixed(2)} you get <Text style={{ fontWeight: "700", color: "#0D0D0D" }}>{vehicle.mpgCombined} miles</Text> with this vehicle.
          </Text>
        )}
        {(isElectric || isPHEV) && hasGasPrice && milesPerKwh > 0 && (
          <>
            <Text style={{ fontSize: 13, color: "#555", marginTop: 4, lineHeight: 20 }}>
              Charging at home: <Text style={{ fontWeight: "700", color: "#0D0D0D" }}>{milesHomePerDollar.toFixed(1)} mi</Text> per dollar
            </Text>
            <Text style={{ fontSize: 13, color: "#555", marginTop: 2, lineHeight: 20 }}>
              Public charger: <Text style={{ fontWeight: "700", color: "#0D0D0D" }}>{milesPublicPerDollar.toFixed(1)} mi</Text> per dollar
            </Text>
          </>
        )}
        {isPHEV && hasGasPrice && (
          <Text style={{ fontSize: 13, color: "#555", marginTop: 2, lineHeight: 20 }}>
            Gas mode: <Text style={{ fontWeight: "700", color: "#0D0D0D" }}>{vehicle.mpgCombined} miles</Text> per ${gasPrice.toFixed(2)}
          </Text>
        )}
      </InfoBox>

      <CostCompare base={base} other={vehicle} computed={computed} gasPrice={gasPrice} />

      {vehicle?.extra && (
        <InfoBox title="About">
          <Text style={{ fontSize: 13, color: "#555", lineHeight: 20 }}>{vehicle.extra}</Text>
        </InfoBox>
      )}

      <HeroImage vehicleId={vehicle.id} containerWidth={pw} />
    </ScrollView>
  );
}

// ── Dots ──────────────────────────────────────────────────────────────────────
function Dots({ count, index }: { count: number; index: number }) {
  return (
    <View style={{ position: "absolute", bottom: 18, alignSelf: "center", flexDirection: "row", gap: 7 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ width: i === index ? 18 : 7, height: 7, borderRadius: 4, backgroundColor: i === index ? "#CC0000" : "#DDDDDD" }} />
      ))}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
function getCPM(v: any, gasPrice: number) {
  if (v.type === "gas" || v.type === "hybrid" || v.type === "plug-in-hybrid") {
    if (gasPrice <= 0) return null;
    if (!v.mpgCombined || v.mpgCombined <= 0) return null;
    return gasPrice / v.mpgCombined;
  }
  if (v.type === "electric") {
    if (!v.batteryKwh || !v.rangeElectric) return null;
    return (v.batteryKwh / v.rangeElectric) * HOME_KWH;
  }
  return null;
}

export default function VehicleDetailScreen() {
  const { vehicleId } = useLocalSearchParams();
  const { zip } = useZip();
  const { compareCart } = useCompare();
  const { width: pw, height: ph } = useWindowDimensions();

  const [gasPrice, setGasPrice] = useState<number>(0);
  const [gasPriceStatus, setGasPriceStatus] = useState<"idle" | "loading" | "error">("idle");
  const id = Array.isArray(vehicleId) ? vehicleId[0] : vehicleId;
  const base = vehicles.find((v) => v.id === id);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    let isActive = true;

    async function loadGasPrice() {
      if (!zip) {
        if (isActive) {
          setGasPrice(0);
          setGasPriceStatus("idle");
        }
        return;
      }

      try {
        setGasPriceStatus("loading");

        const response = await fetch(getGasApiUrl(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ zipCode: zip }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(typeof data?.error === "string" ? data.error : "Failed to fetch gas prices.");
        }

        const nextPrice = Number(data?.cheapestRegular?.regularPrice ?? 0);
        if (!isActive) return;

        setGasPrice(Number.isFinite(nextPrice) ? nextPrice : 0);
        setGasPriceStatus("idle");
      } catch {
        if (!isActive) return;
        setGasPrice(0);
        setGasPriceStatus("error");
      }
    }

    loadGasPrice();

    return () => {
      isActive = false;
    };
  }, [zip]);

  if (!base) return <View style={{ flex: 1, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" }}><Text>Vehicle not found</Text></View>;

  const cards = useMemo(() => [base, ...compareCart.filter((c) => c.id !== base.id)], [compareCart, base]);

  const compMap = useMemo(() => {
    const m = new Map<string, any>();
    const baseCpm = getCPM(base, gasPrice);
    const baseAnnual = baseCpm == null ? null : baseCpm * ANNUAL_MILES;
    for (const v of cards) {
      if (v.id === base.id || baseAnnual == null) continue;
      const cpm = getCPM(v, gasPrice);
      if (cpm == null) continue;
      const otherAnnual = cpm * ANNUAL_MILES;
      m.set(v.id, { baseAnnual, otherAnnual, priceDiff: v.price - base.price, annualDiff: baseAnnual - otherAnnual });
    }
    return m;
  }, [cards, base, gasPrice]);

  return (
    <View style={{ flex: 1, backgroundColor: "#1C1C1E" }}>
      <StatusBar barStyle="light-content" />

      {/* Dark header strip */}
      <View style={{ paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>
              {base.year} · {base.make}
            </Text>
            <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "800", letterSpacing: -0.4 }}>{base.model}</Text>
          </View>
          <SearchButton />
        </View>
        <View style={{ marginTop: 12, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 18, flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: "#CC0000" }} />
          <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>ZIP {zip}</Text>
        </View>
      </View>

      {/* White paged area */}
      <View style={{ flex: 1, backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" }}>
        <FlatList
          ref={listRef}
          data={cards}
          keyExtractor={(item, i) => String(item?.id ?? i)}
          horizontal pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onScroll={(e) => { const x = e.nativeEvent.contentOffset.x; setIndex(clamp(Math.round(x / pw), 0, cards.length - 1)); }}
          onMomentumScrollEnd={(e) => { setIndex(clamp(Math.round(e.nativeEvent.contentOffset.x / pw), 0, cards.length - 1)); }}
          renderItem={({ item }) => (
            <View style={{ width: pw, minHeight: ph }}>
              <VehicleCard vehicle={item} zip={zip} gasPrice={gasPrice} gasPriceStatus={gasPriceStatus} base={base} computed={compMap.get(item.id)} pw={pw} ph={ph} />
            </View>
          )}
        />
        {cards.length > 1 && <Dots count={cards.length} index={index} />}
      </View>
    </View>
  );
}
