import { router } from "expo-router";
import { Ticket as TicketIcon } from "lucide-react-native";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TicketCard from "@/components/ui/ticket-card";
import { BottomTabInset, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useTicketsStore } from "@/store/tickets";

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const tickets = useTicketsStore((state) => state.tickets);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.background },
        header: {
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.lg,
          gap: Spacing.xxs,
        },
        title: { ...Typography.title4, color: theme.text, fontWeight: "700" },
        subtitle: { ...Typography.body2, color: theme.textMuted },
        listContent: {
          paddingHorizontal: Spacing.xl,
          paddingBottom: BottomTabInset + Spacing.xl,
          flexGrow: 1,
        },
        separator: { height: Spacing.md },
        empty: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: Spacing.sm,
          paddingHorizontal: Spacing.xl,
        },
        emptyTitle: {
          ...Typography.subtitle,
          color: theme.text,
          fontWeight: "700",
          marginTop: Spacing.sm,
        },
        emptyText: {
          ...Typography.body2,
          color: theme.textMuted,
          textAlign: "center",
        },
      }),
    [theme],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Trips</Text>
        <Text style={styles.subtitle}>Your passes and tickets</Text>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(ticket) => ticket.id}
        renderItem={({ item }) => (
          <TicketCard
            ticket={item}
            onPress={() => router.push(`/ticket/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <TicketIcon size={48} color={theme.iconMuted} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No passes yet</Text>
            <Text style={styles.emptyText}>
              Find a park or attraction and tap “Get pass” to buy your first ticket.
            </Text>
          </View>
        }
      />
    </View>
  );
}
