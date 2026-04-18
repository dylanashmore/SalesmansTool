import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StatusBar, Text, TextInput, View } from "react-native";
import { vehicles } from "../data/vehicles";

type SearchResult = {
	key: string;
	make: string;
	model: string;
	minPrice: number;
	trimsCount: number;
	types: string[];
	matchedTrims: string[];
	searchIndex: string;
};

const typeLabel = (type: string) =>
	type === "electric"
		? "Electric"
		: type === "plug-in-hybrid"
			? "Plug-in Hybrid"
			: type === "hybrid"
				? "Hybrid"
				: "Gas";

export default function SearchScreen() {
	const router = useRouter();
	const [query, setQuery] = useState("");

	const results = useMemo(() => {
		const grouped = new Map<string, SearchResult>();

		for (const vehicle of vehicles) {
			const key = vehicle.model;
			const existing = grouped.get(key);
			const vehicleSearch = `${vehicle.make} ${vehicle.model} ${vehicle.trim} ${vehicle.year} ${typeLabel(vehicle.type)}`.toLowerCase();

			if (!existing) {
				grouped.set(key, {
					key,
					make: vehicle.make,
					model: vehicle.model,
					minPrice: typeof vehicle.price === "number" ? vehicle.price : Number.MAX_SAFE_INTEGER,
					trimsCount: 1,
					types: [vehicle.type],
					matchedTrims: [vehicle.trim],
					searchIndex: vehicleSearch,
				});
				continue;
			}

			existing.trimsCount += 1;
			existing.minPrice = Math.min(existing.minPrice, typeof vehicle.price === "number" ? vehicle.price : Number.MAX_SAFE_INTEGER);
			if (!existing.types.includes(vehicle.type)) existing.types.push(vehicle.type);
			if (!existing.matchedTrims.includes(vehicle.trim)) existing.matchedTrims.push(vehicle.trim);
			existing.searchIndex += ` ${vehicleSearch}`;
		}

		const normalized = query.trim().toLowerCase();
		const filtered = Array.from(grouped.values()).filter((result) => !normalized || result.searchIndex.includes(normalized));

		return filtered.sort((left, right) => {
			if (!normalized) return left.model.localeCompare(right.model);

			const leftExact = left.model.toLowerCase() === normalized ? 0 : left.model.toLowerCase().startsWith(normalized) ? 1 : 2;
			const rightExact = right.model.toLowerCase() === normalized ? 0 : right.model.toLowerCase().startsWith(normalized) ? 1 : 2;

			if (leftExact !== rightExact) return leftExact - rightExact;
			return left.model.localeCompare(right.model);
		});
	}, [query]);

	return (
		<View style={{ flex: 1, backgroundColor: "#1C1C1E" }}>
			<StatusBar barStyle="light-content" />

			<View style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 22 }}>
				<Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16, alignSelf: "flex-start" }}>
					<Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>‹</Text>
					<Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600" }}>Back</Text>
				</Pressable>

				<Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 4 }}>
					Search Vehicles
				</Text>
				<Text style={{ color: "#FFF", fontSize: 22, fontWeight: "800", letterSpacing: -0.4, marginBottom: 14 }}>
					Find A Toyota
				</Text>

				<View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}>
					<Feather name="search" size={18} color="rgba(255,255,255,0.55)" />
					<TextInput
						value={query}
						onChangeText={setQuery}
						placeholder="Model, trim, year, or fuel type"
						placeholderTextColor="rgba(255,255,255,0.35)"
						autoCapitalize="words"
						autoCorrect={false}
						returnKeyType="search"
						style={{ flex: 1, color: "#FFF", fontSize: 15, fontWeight: "600", paddingVertical: 0 }}
					/>
				</View>
			</View>

			<View style={{ flex: 1, backgroundColor: "#F4F4F4", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
				<FlatList
					data={results}
					keyExtractor={(item) => item.key}
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36, gap: 10 }}
					ListEmptyComponent={
						<View style={{ backgroundColor: "#FFF", borderRadius: 16, padding: 18 }}>
							<Text style={{ color: "#0D0D0D", fontSize: 15, fontWeight: "700", marginBottom: 4 }}>No matches found</Text>
							<Text style={{ color: "#777", fontSize: 13, lineHeight: 18 }}>Try a model like Camry, Prius, RAV4, or a trim name like XLE.</Text>
						</View>
					}
					renderItem={({ item }) => (
						<Pressable
							onPress={() =>
								router.push({
									pathname: "/model-trims",
									params: { model: item.model, type: item.types.join(",") },
								})
							}
							style={({ pressed }) => ({
								backgroundColor: "#FFF",
								borderRadius: 16,
								padding: 16,
								opacity: pressed ? 0.92 : 1,
								transform: [{ scale: pressed ? 0.986 : 1 }],
								shadowColor: "#000",
								shadowOpacity: 0.05,
								shadowRadius: 8,
								shadowOffset: { width: 0, height: 2 },
								elevation: 2,
							})}
						>
							<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 16, fontWeight: "800", color: "#0D0D0D", marginBottom: 3 }}>
										{item.make} {item.model}
									</Text>
									<Text style={{ fontSize: 12, color: "#777" }}>
										{item.trimsCount} trims available
									</Text>
								</View>
								<View style={{ alignItems: "flex-end", gap: 4 }}>
									<Text style={{ fontSize: 15, fontWeight: "700", color: "#0D0D0D" }}>
										From ${item.minPrice.toLocaleString()}
									</Text>
									<Text style={{ fontSize: 11, color: "#CC0000", fontWeight: "600" }}>View →</Text>
								</View>
							</View>

							<View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
								{item.types.map((type) => (
									<View key={type} style={{ backgroundColor: "#F0F0F0", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 }}>
										<Text style={{ fontSize: 12, fontWeight: "600", color: "#444" }}>{typeLabel(type)}</Text>
									</View>
								))}
							</View>

							<Text style={{ marginTop: 10, fontSize: 12, color: "#777" }} numberOfLines={1}>
								Trims: {item.matchedTrims.join(", ")}
							</Text>
						</Pressable>
					)}
				/>
			</View>
		</View>
	);
}
