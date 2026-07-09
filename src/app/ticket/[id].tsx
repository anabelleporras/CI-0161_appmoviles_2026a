import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";

import IconButton from "@/components/ui/icon-button";
import { Palette, Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatMoney } from "@/lib/currency";
import { useTicketsStore } from "@/store/tickets";

const QR_SIZE = 200;

const formatPurchaseDate = (iso: string, locale?: string): string =>
  new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function TicketDetailScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ticket = useTicketsStore((state) =>
    state.tickets.find((t) => t.id === id),
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.background },
        header: {
          flexDirection: "row",
          alignItems: "center",
          gap: Spacing.md,
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.md,
        },
        headerTitle: {
          ...Typography.subtitle,
          color: theme.text,
          fontWeight: "700",
        },
        centered: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: Spacing.xl,
        },
        muted: { ...Typography.body2, color: theme.textMuted, textAlign: "center" },
        content: {
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing["4xl"],
          alignItems: "center",
          gap: Spacing.xl,
        },
        qrCard: {
          backgroundColor: Palette.white,
          borderRadius: Radius.xl,
          padding: Spacing.xl,
          alignItems: "center",
          gap: Spacing.md,
          ...Shadow.card,
        },
        qrCaption: { ...Typography.caption, color: Palette.grayscale.gray700 },
        details: { alignSelf: "stretch", gap: Spacing.xs, alignItems: "center" },
        place: {
          ...Typography.title4,
          color: theme.text,
          fontWeight: "700",
          textAlign: "center",
        },
        product: { ...Typography.body1, color: theme.textMuted },
        badge: {
          marginTop: Spacing.xs,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.xxs,
          borderRadius: Radius.pill,
          backgroundColor: theme.accent,
        },
        badgeText: {
          ...Typography.caption,
          color: theme.textOnAccent,
          fontWeight: "700",
          letterSpacing: 1,
        },
        rows: {
          alignSelf: "stretch",
          marginTop: Spacing.md,
          backgroundColor: theme.surface,
          borderRadius: Radius.lg,
          overflow: "hidden",
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        rowLast: { borderBottomWidth: 0 },
        rowLabel: { ...Typography.body2, color: theme.textMuted, flexShrink: 0 },
        rowValue: {
          ...Typography.body2,
          color: theme.text,
          fontWeight: "600",
          flex: 1,
          textAlign: "right",
          marginLeft: Spacing.md,
        },
      }),
    [theme],
  );

  const rows = ticket
    ? [
        { label: t("ticketDetail.price"), value: formatMoney(ticket.amountMinor, ticket.currency) },
        { label: t("ticketDetail.purchased"), value: formatPurchaseDate(ticket.purchasedAt, i18n.language) },
        // A full UUID overflows the row; a short prefix is enough to reference a pass.
        { label: t("ticketDetail.passId"), value: ticket.id.slice(0, 8).toUpperCase() },
      ]
    : [];

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <IconButton
          icon={ArrowLeft}
          onPress={() => router.back()}
          accessibilityLabel={t("common.back")}
        />
        <Text style={styles.headerTitle}>{t("ticketDetail.title")}</Text>
      </View>

      {!ticket ? (
        <View style={styles.centered}>
          <Text style={styles.muted}>{t("ticketDetail.notAvailable")}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* QR stays dark-on-white in both themes so it always scans. */}
          <View style={styles.qrCard}>
            <QRCode
              value={ticket.qrToken}
              size={QR_SIZE}
              color={Palette.black}
              backgroundColor={Palette.white}
            />
            <Text style={styles.qrCaption}>{t("ticketDetail.qrCaption")}</Text>
          </View>

          <View style={styles.details}>
            <Text style={styles.place}>{ticket.placeName}</Text>
            <Text style={styles.product}>{ticket.productLabel}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t("ticketDetail.valid")}</Text>
            </View>
          </View>

          <View style={styles.rows}>
            {rows.map((item, index) => (
              <View
                key={item.label}
                style={[styles.row, index === rows.length - 1 && styles.rowLast]}
              >
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text
                  style={styles.rowValue}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
