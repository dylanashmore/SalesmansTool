import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  /* ========== Layout ========== */

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
  },

  section: {
    marginTop: 24,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },

  /* ========== Typography ========== */

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#111111",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
  },

  body: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111111",
  },

  caption: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },

  /* ========== Cards ========== */

  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardSpacing: {
    marginBottom: 14,
  },

  /* ========== Inputs ========== */

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
  },

  /* ========== Buttons ========== */

  buttonPrimary: {
    backgroundColor: "#111111",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },

  buttonSecondary: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: "center",
  },

  buttonSecondaryText: {
    color: "#111111",
    fontWeight: "600",
    fontSize: 14,
  },
});