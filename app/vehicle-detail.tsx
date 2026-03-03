import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { useCompare } from "../context/CompareContext";
import { useZip } from "../context/zipContext";
import { gasPrices } from "../data/gasPrices";
import { vehicles } from "../data/vehicles";
import zipToCounty from "../data/zipCodesAndCounties";
import { styles } from "../styles";

const ANNUAL_MILES = 15000;
const HOME_ELECTRICITY_PRICE = 0.1431; // $/kWh
const [index, setIndex] = useState(0);

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

type ComputedCompare = {
  baseAnnual: number;
  otherAnnual: number;
  priceDiff: number;
  annualDiff: number;
};

function Dots({ count, index }: { count: number; index: number }) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 18,
        alignSelf: "center",
        flexDirection: "row",
        gap: 8,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            opacity: i === index ? 1 : 0.35,
            backgroundColor: "black",
          }}
        />
      ))}
    </View>
  );
}

function CompareButtonInline({ vehicle }: { vehicle: any }) {
  const { addToCompareCart, removeFromCompareCart, isInCompareCart, isCompareFull } =
    useCompare();

  const inCart = isInCompareCart(vehicle.id);
  const addDisabled = isCompareFull && !inCart;

  if (!inCart) {
    return (
      <Pressable
        onPress={() => addToCompareCart(vehicle)}
        disabled={addDisabled}
        style={{
          paddingVertical: 6,
          paddingHorizontal: 10,
          backgroundColor: addDisabled ? "#999" : "black",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
          {addDisabled ? "Full" : "Add"}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => removeFromCompareCart(vehicle.id)}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "#666",
        borderRadius: 8,
      }}
    >
      <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Clear</Text>
    </Pressable>
  );
}

function getCostPerMile(vehicle: any, gasPricePerGallon: number, electricityPricePerKwh: number) {
  // Gas / Hybrid / Plug-in Hybrid -> mpgCombined (gas mode)
  if (vehicle.type === "gas" || vehicle.type === "hybrid" || vehicle.type === "plug-in-hybrid") {
    const mpg = vehicle.mpgCombined;
    if (!mpg || mpg <= 0) return null;
    return gasPricePerGallon / mpg; // $/mile
  }

  // Electric -> batteryKwh / rangeElectric
  if (vehicle.type === "electric") {
    const batteryKwh = vehicle.batteryKwh;
    const range = vehicle.rangeElectric;
    if (!batteryKwh || !range || range <= 0) return null;

    const kwhPerMile = batteryKwh / range;
    return kwhPerMile * electricityPricePerKwh; // $/mile
  }

  return null;
}

function AboutSection({ vehicle }: { vehicle: any }) {
  if (!vehicle?.extra) return null;

  return (
    <View style={{ marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: "#f3f0ec" }}>
      <Text style={{ fontWeight: "800", marginBottom: 6 }}>About</Text>
      <Text style={{ color: "#333", lineHeight: 20 }}>{vehicle.extra}</Text>
    </View>
  );
}

function FuelCostComparisonBox({
  baseVehicle,
  otherVehicle,
  computed,
  gasPriceValue,
}: {
  baseVehicle: any;
  otherVehicle: any;
  computed?: ComputedCompare;
  gasPriceValue: number;
}) {
  // Never show on the base card itself
  if (!otherVehicle || otherVehicle.id === baseVehicle.id) return null;
  if (!computed) return null;

  const { baseAnnual, otherAnnual, priceDiff, annualDiff } = computed;

  return (
    <View style={{ marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: "#f3f0ec" }}>
      <Text style={{ fontWeight: "800", marginBottom: 0 }}>Cost Comparison</Text>

      <Text style={{ color: "#333" }}>
        {baseVehicle.model} {baseVehicle.trim} v.s {otherVehicle.model} {otherVehicle.trim}
      </Text>

      <Text style={{ marginTop: 10, color: "#333" }}>
        <Text style={{ fontWeight: "700" }}>Price difference: </Text>
        <Text>
          {priceDiff >= 0 ? "+" : "-"}${Math.abs(priceDiff).toLocaleString()}
        </Text>
      </Text>

      <Text style={{ marginTop: 10, fontWeight: "700" }}>
        Estimated annual fuel cost ({ANNUAL_MILES.toLocaleString()} mi/yr)
      </Text>

      <Text style={{ color: "#333", marginTop: 4 }}>
        {baseVehicle.model} {baseVehicle.trim}: ${baseAnnual.toFixed(0)}/yr
      </Text>
      <Text style={{ color: "#333", marginTop: 2 }}>
        {otherVehicle.model} {otherVehicle.trim}: ${otherAnnual.toFixed(0)}/yr
      </Text>

      <Text style={{ marginTop: 8, fontWeight: "800" }}>
        {annualDiff >= 0
          ? `Save $${annualDiff.toFixed(0)}/yr on fuel with the ${otherVehicle.model} ${otherVehicle.trim}`
          : `Spend $${Math.abs(annualDiff).toFixed(0)}/yr more on fuel with the ${otherVehicle.model} ${otherVehicle.trim}`}
      </Text>

      <Text style={{ marginTop: 6, color: "#666", fontSize: 12 }}>
        Gas ${gasPriceValue.toFixed(2)}/gal • Home electricity ${HOME_ELECTRICITY_PRICE.toFixed(3)}/kWh
      </Text>
    </View>
  );
}

function VehicleCard({
  vehicle,
  zip,
  gasPriceValue,
  baseVehicle,
  computedCompare,
  pageWidth,
  pageHeight,
}: {
  vehicle: any;
  zip: string;
  gasPriceValue: number;
  baseVehicle: any;
  computedCompare?: ComputedCompare;
  pageWidth: number;
  pageHeight: number;
}) {
  const homeElectricityPrice = HOME_ELECTRICITY_PRICE;
  const publicChargingPrice = 0.3970;

  const shellStyle = {
    ...styles.container,
    backgroundColor: "#ffffff",
    width: pageWidth,
    minHeight: pageHeight,
  };

  const HeaderRow = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{vehicle.trim}</Text>
      <CompareButtonInline vehicle={vehicle} />
    </View>
  );

  // Gas + hybrid
  if (vehicle.type === "gas" || vehicle.type === "hybrid") {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={shellStyle}>
        <Text style={styles.title}>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>

        <HeaderRow />

        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>${vehicle.price.toLocaleString()}</Text>

          <Text style={{ marginTop: 12, fontSize: 16 }}>
            MPG: {vehicle.mpgCity}/{vehicle.mpgHwy} (City/Highway)
          </Text>
          <Text style={{ fontSize: 16 }}>Combined: {vehicle.mpgCombined} MPG</Text>
          <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "bold" }}>Breakdown:</Text>

          <Text style={{ marginTop: 12, fontSize: 16 }}>
            The price of gas in {zip} is ${gasPriceValue.toFixed(2)} per gallon.
          </Text>
          <Text style={{ fontSize: 16, marginTop: 8 }}>
            For ${gasPriceValue.toFixed(2)}, you get {vehicle.mpgCombined} miles with this vehicle.
          </Text>
        </View>

        <FuelCostComparisonBox
          baseVehicle={baseVehicle}
          otherVehicle={vehicle}
          computed={computedCompare}
          gasPriceValue={gasPriceValue}
        />

        <AboutSection vehicle={vehicle} />
      </ScrollView>
    );
  }

  // Plug-in hybrid (NO MPGe used anywhere)
  if (vehicle.type === "plug-in-hybrid") {
    const rangeElectric = vehicle.rangeElectric;
    const batteryKwh = vehicle.batteryKwh;

    const milesPerKwh = rangeElectric && batteryKwh ? rangeElectric / batteryKwh : 0;

    const kwhFromHome = homeElectricityPrice > 0 ? gasPriceValue / homeElectricityPrice : 0;
    const kwhFromPublic = publicChargingPrice > 0 ? gasPriceValue / publicChargingPrice : 0;

    const milesFromHome = kwhFromHome * milesPerKwh;
    const milesFromPublic = kwhFromPublic * milesPerKwh;

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={shellStyle}>
        <Text style={styles.title}>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>

        <HeaderRow />

        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>${vehicle.price.toLocaleString()}</Text>

          {!!rangeElectric && (
            <Text style={{ marginTop: 12, fontSize: 16 }}>Electric Range: {rangeElectric} miles</Text>
          )}
          {!!batteryKwh && <Text style={{ fontSize: 16 }}>Battery: {batteryKwh} kWh</Text>}
          <Text style={{ fontSize: 16 }}>MPG (gas mode): {vehicle.mpgCombined}</Text>

          <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "bold" }}>Breakdown:</Text>
          <Text style={{ marginTop: 8, fontSize: 16 }}>
            The price of gas in {zip} is ${gasPriceValue.toFixed(2)} per gallon.
          </Text>

          <Text style={{ fontSize: 16, marginTop: 4 }}>For ${gasPriceValue.toFixed(2)}, you could get:</Text>

          {milesPerKwh > 0 ? (
            <>
              <Text style={{ fontSize: 16, marginTop: 4 }}>
                • {milesFromHome.toFixed(1)} miles charging at home (${homeElectricityPrice.toFixed(4)}/kWh)
              </Text>
              <Text style={{ fontSize: 16 }}>
                • {milesFromPublic.toFixed(1)} miles at public chargers (${publicChargingPrice.toFixed(4)}/kWh)
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: 16, marginTop: 4, color: "#666" }}>
              Electric efficiency not available (missing batteryKwh or rangeElectric).
            </Text>
          )}

          <Text style={{ fontSize: 16 }}>• {vehicle.mpgCombined} miles using gas</Text>
        </View>

        <FuelCostComparisonBox
          baseVehicle={baseVehicle}
          otherVehicle={vehicle}
          computed={computedCompare}
          gasPriceValue={gasPriceValue}
        />

        <AboutSection vehicle={vehicle} />
      </ScrollView>
    );
  }

  // Electric (NO MPGe used anywhere)
  if (vehicle.type === "electric") {
    const rangeElectric = vehicle.rangeElectric;
    const batteryKwh = vehicle.batteryKwh;

    const milesPerKwh = rangeElectric && batteryKwh ? rangeElectric / batteryKwh : 0;

    const kwhFromHome = homeElectricityPrice > 0 ? gasPriceValue / homeElectricityPrice : 0;
    const kwhFromPublic = publicChargingPrice > 0 ? gasPriceValue / publicChargingPrice : 0;

    const milesFromHome = kwhFromHome * milesPerKwh;
    const milesFromPublic = kwhFromPublic * milesPerKwh;

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={shellStyle}>
        <Text style={styles.title}>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>

        <HeaderRow />

        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>${vehicle.price.toLocaleString()}</Text>

          {!!rangeElectric && <Text style={{ marginTop: 12, fontSize: 16 }}>Range: {rangeElectric} miles</Text>}
          {!!batteryKwh && <Text style={{ fontSize: 16 }}>Battery: {batteryKwh} kWh</Text>}

          <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "bold" }}>Breakdown:</Text>
          <Text style={{ marginTop: 8, fontSize: 16 }}>
            The price of gas in {zip} is ${gasPriceValue.toFixed(2)} per gallon.
          </Text>
          <Text style={{ fontSize: 16, marginTop: 4 }}>For ${gasPriceValue.toFixed(2)}, you could get:</Text>

          {milesPerKwh > 0 ? (
            <>
              <Text style={{ fontSize: 16, marginTop: 4 }}>
                • {milesFromHome.toFixed(1)} miles charging at home (${homeElectricityPrice.toFixed(4)}/kWh)
              </Text>
              <Text style={{ fontSize: 16 }}>
                • {milesFromPublic.toFixed(1)} miles at public chargers (${publicChargingPrice.toFixed(4)}/kWh)
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: 16, marginTop: 4, color: "#666" }}>
              Electric efficiency not available (missing batteryKwh or rangeElectric).
            </Text>
          )}
        </View>

        <FuelCostComparisonBox
          baseVehicle={baseVehicle}
          otherVehicle={vehicle}
          computed={computedCompare}
          gasPriceValue={gasPriceValue}
        />

        <AboutSection vehicle={vehicle} />
      </ScrollView>
    );
  }

  // Fallback
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={shellStyle}>
      <Text style={styles.title}>
        {vehicle.year} {vehicle.make} {vehicle.model}
      </Text>

      <HeaderRow />

      <FuelCostComparisonBox
        baseVehicle={baseVehicle}
        otherVehicle={vehicle}
        computed={computedCompare}
        gasPriceValue={gasPriceValue}
      />

      <AboutSection vehicle={vehicle} />

      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>${vehicle.price.toLocaleString()}</Text>
      </View>
    </ScrollView>
  );
}

export default function VehicleDetailScreen() {
  const { vehicleId } = useLocalSearchParams();
  const { zip } = useZip();
  const { compareCart } = useCompare();

  // ✅ fix desktop/mobile width issues
  const { width: pageWidth, height: pageHeight } = useWindowDimensions();

  const county = zipToCounty[zip];
  const gasPrice = gasPrices.find((item) => item.county === county);
  const gasPriceValue = gasPrice?.price || 0;

  const id = Array.isArray(vehicleId) ? vehicleId[0] : vehicleId;
  const baseVehicle = vehicles.find((v) => v.id === id);

  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<any>>(null);

  if (!baseVehicle) {
    return (
      <View style={styles.container}>
        <Text>Vehicle not found</Text>
      </View>
    );
  }

  const cards = useMemo(() => {
    const rest = compareCart.filter((c) => c.id !== baseVehicle.id);
    return [baseVehicle, ...rest];
  }, [compareCart, baseVehicle]);

  const comparisonById = useMemo(() => {
    const map = new Map<string, ComputedCompare>();

    const baseCpm = getCostPerMile(baseVehicle, gasPriceValue, HOME_ELECTRICITY_PRICE);
    const baseAnnual = baseCpm == null ? null : baseCpm * ANNUAL_MILES;

    for (const v of cards) {
      if (v.id === baseVehicle.id) continue;
      if (baseAnnual == null) continue;

      const otherCpm = getCostPerMile(v, gasPriceValue, HOME_ELECTRICITY_PRICE);
      if (otherCpm == null) continue;

      const otherAnnual = otherCpm * ANNUAL_MILES;

      map.set(v.id, {
        baseAnnual,
        otherAnnual,
        priceDiff: v.price - baseVehicle.price,
        annualDiff: baseAnnual - otherAnnual,
      });
    }

    return map;
  }, [cards, baseVehicle, gasPriceValue]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
  ref={listRef}
  data={cards}
  keyExtractor={(item, i) => String(item?.id ?? i)}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  bounces={false}
  scrollEventThrottle={16}
  onScroll={(e) => {
    const x = e.nativeEvent.contentOffset.x;
    const raw = Math.round(x / pageWidth);
    const next = clamp(raw, 0, cards.length - 1);
    if (next !== index) setIndex(next);
  }}
  onMomentumScrollEnd={(e) => {
    // backup (mobile usually)
    const x = e.nativeEvent.contentOffset.x;
    const raw = Math.round(x / pageWidth);
    setIndex(clamp(raw, 0, cards.length - 1));
  }}
  renderItem={({ item }) => (
    <View style={{ width: pageWidth }}>
      <VehicleCard
        vehicle={item}
        zip={zip}
        gasPriceValue={gasPriceValue}
        baseVehicle={baseVehicle}
        computedCompare={comparisonById.get(item.id)}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
      />
    </View>
  )}
/>

      {cards.length > 1 ? <Dots count={cards.length} index={index} /> : null}
    </View>
  );
}