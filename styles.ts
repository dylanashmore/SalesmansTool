import { StyleSheet } from "react-native";

export const tokens = {
  red: "#CC0000",
  redLight: "#FFF0F0",
  redDark: "#990000",
  bg: "#FFFFFF",
  surface: "#F5F5F5",
  surfaceDeep: "#EBEBEB",
  border: "#E0E0E0",
  text: "#111111",
  textMid: "#444444",
  textMuted: "#888888",
  success: "#1A7A4A",
  successBg: "#EDFAF3",
  radius: 14,
  radiusPill: 999,
  radiusSm: 8,
  pad: 20,
  padSm: 14,
} as const;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.bg,
    paddingHorizontal: tokens.pad,
    paddingTop: 20,
  },

  screenTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: tokens.text,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: tokens.text,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 14,
    color: tokens.textMuted,
    textAlign: "center",
  },

  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 10,
  },

  zipPill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: tokens.radiusPill,
    marginTop: 10,
    marginBottom: 20,
    gap: 4,
  },

  zipPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.red,
  },

  zipPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.textMid,
    letterSpacing: 0.3,
  },

  vehicleCard: {
    padding: 16,
    marginBottom: 10,
    borderRadius: tokens.radius,
    backgroundColor: tokens.surface,
    borderWidth: 0,
  },

  vehicleCardPressed: {
    backgroundColor: tokens.surfaceDeep,
  },

  vehicleCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  vehicleCardName: {
    fontSize: 16,
    fontWeight: "700",
    color: tokens.text,
    flex: 1,
  },

  vehicleCardPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.text,
  },

  vehicleCardMeta: {
    marginTop: 5,
    fontSize: 13,
    color: tokens.textMuted,
  },

  yearHeader: {
    fontSize: 20,
    fontWeight: "800",
    color: tokens.text,
    marginTop: 8,
    marginBottom: 8,
  },

  trimCard: {
    padding: 16,
    marginBottom: 10,
    borderRadius: tokens.radius,
    backgroundColor: tokens.surface,
  },

  trimCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  trimName: {
    fontSize: 17,
    fontWeight: "700",
    color: tokens.text,
  },

  trimPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: tokens.text,
  },

  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },

  chip: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: tokens.radiusPill,
    borderWidth: 0.5,
    borderColor: tokens.border,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.textMid,
  },

  detailPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.text,
    marginTop: 8,
  },

  detailStat: {
    fontSize: 15,
    color: tokens.textMid,
    marginTop: 8,
    lineHeight: 22,
  },

  detailLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.text,
    marginTop: 14,
  },

  infoBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: tokens.radius,
    backgroundColor: tokens.surface,
  },

  infoBoxTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: tokens.text,
    marginBottom: 6,
  },

  infoBoxBody: {
    color: tokens.textMid,
    lineHeight: 20,
    fontSize: 14,
  },

  compareBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: tokens.text,
    borderRadius: tokens.radiusSm,
  },

  compareBtnActive: {
    backgroundColor: tokens.surfaceDeep,
  },

  compareBtnDisabled: {
    backgroundColor: tokens.border,
  },

  compareBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  compareBtnTextActive: {
    color: tokens.textMid,
    fontSize: 12,
    fontWeight: "700",
  },

  typeCard: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: tokens.radius,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: tokens.surface,
    height: 180,
    overflow: "hidden",
  },

  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: tokens.border,
    borderRadius: tokens.radius,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: "600",
    color: tokens.text,
    backgroundColor: tokens.bg,
    textAlign: "center",
    letterSpacing: 4,
    marginTop: 24,
    marginBottom: 16,
  },

  inputFocused: {
    borderColor: tokens.red,
  },

  buttonPrimary: {
    backgroundColor: tokens.red,
    paddingVertical: 16,
    borderRadius: tokens.radius,
    alignItems: "center",
    marginTop: 8,
  },

  buttonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  buttonSecondary: {
    backgroundColor: tokens.surface,
    paddingVertical: 14,
    borderRadius: tokens.radius,
    alignItems: "center",
    marginTop: 8,
  },

  buttonSecondaryText: {
    color: tokens.text,
    fontSize: 16,
    fontWeight: "600",
  },

  segmentedWrap: {
    flexDirection: "row",
    backgroundColor: tokens.surface,
    borderRadius: 12,
    padding: 3,
    marginTop: 12,
    marginBottom: 10,
  },

  segmentItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 9,
  },

  segmentItemActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  segmentText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.textMuted,
  },

  segmentTextActive: {
    color: tokens.text,
  },
});