import { Pressable, Text, View } from "react-native";
import { styles } from "../../styles";
import { useCompare } from "../CompareContext";

// ── ZIP pill ──────────────────────────────────────────────────────────────
export function ZipPill({ zip }: { zip: string }) {
  return (
    <View style={styles.zipPill}>
      <View style={styles.zipPillDot} />
      <Text style={styles.zipPillText}>ZIP {zip}</Text>
    </View>
  );
}

// ── Vehicle list card ─────────────────────────────────────────────────────
export function VehicleListCard({
  make,
  model,
  minPrice,
  trimsCount,
  onPress,
}: {
  make: string;
  model: string;
  minPrice: number;
  trimsCount: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.vehicleCard,
        pressed && styles.vehicleCardPressed,
        { transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <View style={styles.vehicleCardRow}>
        <Text style={styles.vehicleCardName}>{make} {model}</Text>
        <Text style={styles.vehicleCardPrice}>
          From ${minPrice.toLocaleString()}
        </Text>
      </View>
      <Text style={styles.vehicleCardMeta}>{trimsCount} trims available</Text>
    </Pressable>
  );
}

// ── Compare add/remove button ─────────────────────────────────────────────
export function CompareButtonInline({ vehicle }: { vehicle: any }) {
  const { addToCompareCart, removeFromCompareCart, isInCompareCart, isCompareFull } =
    useCompare();

  const inCart = isInCompareCart(vehicle.id);
  const disabled = isCompareFull && !inCart;

  if (inCart) {
    return (
      <Pressable
        onPress={() => removeFromCompareCart(vehicle.id)}
        style={[styles.compareBtn, styles.compareBtnActive]}
      >
        <Text style={styles.compareBtnTextActive}>Remove</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => addToCompareCart(vehicle)}
      disabled={disabled}
      style={[styles.compareBtn, disabled && styles.compareBtnDisabled]}
    >
      <Text style={styles.compareBtnText}>{disabled ? "Full" : "+ Compare"}</Text>
    </Pressable>
  );
}

// ── Info box (About / Cost comparison) ───────────────────────────────────
export function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoBoxTitle}>{title}</Text>
      <Text style={styles.infoBoxBody}>{children}</Text>
    </View>
  );
}

// ── Segmented control ─────────────────────────────────────────────────────
export function SegmentedControl<T extends string>({
  categories,
  labels,
  active,
  onPress,
}: {
  categories: T[];
  labels: Record<T, string>;
  active: T;
  onPress: (cat: T) => void;
}) {
  if (categories.length <= 1) return null;

  return (
    <View style={styles.segmentedWrap}>
      {categories.map((cat) => {
        const selected = cat === active;
        return (
          <Pressable
            key={cat}
            onPress={() => onPress(cat)}
            style={({ pressed }) => [
              styles.segmentItem,
              selected && styles.segmentItemActive,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text
              style={[styles.segmentText, selected && styles.segmentTextActive]}
              numberOfLines={1}
            >
              {labels[cat]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
