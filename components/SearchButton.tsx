import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";

export function SearchButton() {
	const router = useRouter();

	return (
		<Pressable
			onPress={() => router.push("/search")}
			style={({ pressed }) => ({
				width: 42,
				height: 42,
				borderRadius: 13,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#CC0000",
				opacity: pressed ? 0.82 : 1,
				transform: [{ translateY: 4 }, { scale: pressed ? 0.97 : 1 }],
			})}
		>
			<Feather name="search" size={20} color="#FFFFFF" />
		</Pressable>
	);
}
