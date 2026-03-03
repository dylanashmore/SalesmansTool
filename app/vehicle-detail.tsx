import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";

import { useCompare } from "../context/CompareContext";
import { useZip } from "../context/zipContext";
import { gasPrices } from "../data/gasPrices";
import { vehicles } from "../data/vehicles";
import zipToCounty from "../data/zipCodesAndCounties";
import { styles } from "../styles";

const ANNUAL_MILES = 15000;
const HOME_ELECTRICITY_PRICE = 0.1431;

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
      <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
        Clear
      </Text>
    </Pressable>
  );
}

function getCostPerMile(
  vehicle: any,
  gasPricePerGallon: number,
  electricityPricePerKwh: number
) {
  if (
    vehicle.type === "gas" ||
    vehicle.type === "hybrid" ||
    vehicle.type === "plug-in-hybrid"
  ) {
    if (!vehicle.mpgCombined) return null;
    return gasPricePerGallon / vehicle.mpgCombined;
  }

  if (vehicle.type === "electric") {
    if (!vehicle.batteryKwh || !vehicle.rangeElectric) return null;
    const kwhPerMile = vehicle.batteryKwh / vehicle.rangeElectric;
    return kwhPerMile * electricityPricePerKwh;
  }

  return null;
}

function AboutSection({ vehicle }: { vehicle: any }) {
  if (!vehicle?.extra) return null;

  return (
    <View
      style={{
        marginTop: 14,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#f3f0ec",
      }}
    >
      <Text style={{ fontWeight: "800", marginBottom: 6 }}>About</Text>
      <Text style={{ color: "#333", lineHeight: 20 }}>{vehicle.extra}</Text>
    </View>
  );
}

function VehicleCard({
  vehicle,
  zip,
  gasPriceValue,
  baseVehicle,
  computedCompare,
}: any) {
  const HeaderRow = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700" }}>
        {vehicle.trim}
      </Text>
      <CompareButtonInline vehicle={vehicle} />
    </View>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        ...styles.container,
        backgroundColor: "#ffffff",
        flexGrow: 1,
      }}
    >
      <Text style={styles.title}>
        {vehicle.year} {vehicle.make} {vehicle.model}
      </Text>

      <HeaderRow />

      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          ${vehicle.price.toLocaleString()}
        </Text>
      </View>

      <AboutSection vehicle={vehicle} />
    </ScrollView>
  );
}

export default function VehicleDetailScreen() {
  const { vehicleId } = useLocalSearchParams();
  const { zip } = useZip();
  const { compareCart } = useCompare();

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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        ref={listRef}
        data={cards}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const pageWidth = e.nativeEvent.layoutMeasurement.width;
          const newIndex = Math.round(
            e.nativeEvent.contentOffset.x / pageWidth
          );
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={{ width: "100%" }}>
            <VehicleCard
              vehicle={item}
              zip={zip}
              gasPriceValue={gasPriceValue}
              baseVehicle={baseVehicle}
            />
          </View>
        )}
      />

      {cards.length > 1 && <Dots count={cards.length} index={index} />}
    </View>
  );
}