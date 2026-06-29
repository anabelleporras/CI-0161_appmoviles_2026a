import { PaymentSheetError, useStripe } from "@stripe/stripe-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import IconButton from "@/components/ui/icon-button";
import { Radius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatMoney } from "@/lib/currency";
import {
  confirmTicket,
  createPaymentIntent,
  getCatalog,
  type TicketProduct,
} from "@/services/payments";
import { useTicketsStore } from "@/store/tickets";

// Shown as the merchant in the Stripe Payment Sheet ("Pay <name>"). One place to
// rebrand — the wallet these passes land in is the "Trips" tab.
const MERCHANT_DISPLAY_NAME = "Trips";

// A Stripe client secret has the form `${paymentIntentId}_secret_${random}`, and
// /tickets/confirm needs just the id. Deriving it avoids a second round-trip.
const paymentIntentIdFromClientSecret = (clientSecret: string): string =>
  clientSecret.split("_secret")[0];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const addTicket = useTicketsStore((state) => state.addTicket);

  const { placeId, placeName, types } = useLocalSearchParams<{
    placeId: string;
    placeName: string;
    types: string;
  }>();

  const typeList = useMemo(
    () => (types ? types.split(",").filter(Boolean) : []),
    [types],
  );

  const [products, setProducts] = useState<TicketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getCatalog(typeList)
      .then((items) => active && setProducts(items))
      .catch((e: Error) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [typeList]);

  const handleSelect = async (product: TicketProduct) => {
    if (purchasingId) return;
    setPurchasingId(product.id);
    setError(null);
    try {
      const intent = await createPaymentIntent(placeId, placeName, product.id);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: MERCHANT_DISPLAY_NAME,
        paymentIntentClientSecret: intent.clientSecret,
      });
      if (initError) throw new Error(initError.message);

      const { error: sheetError } = await presentPaymentSheet();
      if (sheetError) {
        // Dismissing the sheet is a normal user choice, not an error to surface.
        if (sheetError.code !== PaymentSheetError.Canceled) {
          setError(sheetError.message);
        }
        return;
      }

      // Payment succeeded — mint (or re-fetch, idempotently) the ticket and cache it.
      const ticket = await confirmTicket(
        paymentIntentIdFromClientSecret(intent.clientSecret),
      );
      addTicket(ticket);
      router.replace(`/ticket/${ticket.id}`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please try again.",
      );
    } finally {
      setPurchasingId(null);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.background },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: Spacing.md,
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.lg,
        },
        headerText: { flex: 1, gap: Spacing.xxs },
        title: { ...Typography.subtitle, color: theme.text, fontWeight: "700" },
        subtitle: { ...Typography.body2, color: theme.textMuted },
        content: {
          paddingHorizontal: Spacing.xl,
          paddingBottom: 120,
          gap: Spacing.md,
        },
        centered: {
          paddingVertical: Spacing["4xl"],
          alignItems: "center",
          justifyContent: "center",
        },
        muted: { ...Typography.body2, color: theme.textMuted, textAlign: "center" },
        productRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: Spacing.md,
          backgroundColor: theme.surface,
          borderRadius: Radius.lg,
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.lg,
        },
        productRowDisabled: { opacity: 0.5 },
        productInfo: { flex: 1, gap: Spacing.xs },
        productLabel: { ...Typography.body1, color: theme.text, fontWeight: "600" },
        productPrice: { ...Typography.body2, color: theme.textMuted },
        buyPill: {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          borderRadius: Radius.pill,
          backgroundColor: theme.accent,
        },
        buyPillText: {
          ...Typography.body2,
          color: theme.textOnAccent,
          fontWeight: "700",
        },
        error: {
          ...Typography.body2,
          color: theme.accentStrong,
          textAlign: "center",
          marginTop: Spacing.sm,
        },
        hint: {
          ...Typography.caption,
          color: theme.textMuted,
          textAlign: "center",
          marginTop: Spacing.lg,
        },
      }),
    [theme],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Get a pass</Text>
          {placeName ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {placeName}
            </Text>
          ) : null}
        </View>
        <IconButton icon={X} onPress={() => router.back()} accessibilityLabel="Close" />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.text} />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.muted}>No passes are available for this place.</Text>
          </View>
        ) : (
          products.map((product) => {
            const busy = purchasingId === product.id;
            return (
              <Pressable
                key={product.id}
                style={[
                  styles.productRow,
                  purchasingId && !busy ? styles.productRowDisabled : null,
                ]}
                onPress={() => handleSelect(product)}
                disabled={!!purchasingId}
                accessibilityRole="button"
                accessibilityLabel={`Buy ${product.label} for ${formatMoney(
                  product.amountMinor,
                  product.currency,
                )}`}
              >
                <View style={styles.productInfo}>
                  <Text style={styles.productLabel}>{product.label}</Text>
                  <Text style={styles.productPrice}>
                    {formatMoney(product.amountMinor, product.currency)}
                  </Text>
                </View>
                {busy ? (
                  <ActivityIndicator color={theme.text} />
                ) : (
                  <View style={styles.buyPill}>
                    <Text style={styles.buyPillText}>Buy</Text>
                  </View>
                )}
              </Pressable>
            );
          })
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && products.length > 0 ? (
          <Text style={styles.hint}>
            Test mode · pay with card 4242 4242 4242 4242, any future date and CVC.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
