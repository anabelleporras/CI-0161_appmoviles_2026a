import { ChevronRight, Ticket as TicketIcon } from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";
import { formatMoney } from "@/lib/currency";
import type { Ticket } from "@/services/payments";

import { createTicketCardStyles } from "./ticket-card.styles";

export type TicketCardProps = {
  ticket: Ticket;
  onPress?: () => void;
};

const formatPurchaseDate = (iso: string, locale?: string): string =>
  new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const TicketCard = ({ ticket, onPress }: TicketCardProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const styles = useMemo(() => createTicketCardStyles(theme), [theme]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={t("trips.ticketAccessibility", {
        product: ticket.productLabel,
        place: ticket.placeName,
      })}
    >
      <View style={styles.iconWrap}>
        <TicketIcon size={22} color={theme.textOnAccent} strokeWidth={2} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {ticket.placeName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {ticket.productLabel} · {formatMoney(ticket.amountMinor, ticket.currency)}
        </Text>
        <Text style={styles.date}>{formatPurchaseDate(ticket.purchasedAt, i18n.language)}</Text>
      </View>
      <ChevronRight size={20} color={theme.iconMuted} />
    </TouchableOpacity>
  );
};

export default TicketCard;
