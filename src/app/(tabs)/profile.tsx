import { router } from 'expo-router';
import { Bookmark, ChevronRight, LogOut, Settings } from 'lucide-react-native';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PlacePhoto from '@/components/ui/place-photo';
import { Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { useFavoritesStore, type FavoritePlace } from '@/store/favorites';

const FavoriteRow = ({ place }: { place: FavoritePlace }) => {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          paddingVertical: Spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        photo: {
          width: 52,
          height: 52,
          borderRadius: Radius.md,
        },
        info: { flex: 1, gap: 2 },
        name: {
          ...Typography.body2,
          color: theme.text,
          fontWeight: '600',
        },
        address: {
          ...Typography.body3,
          color: theme.textMuted,
        },
        chevron: { opacity: 0.4 },
      }),
    [theme],
  );

  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push(`/place/${place.placeId}`)}
    >
      <PlacePhoto
        photoName={place.photoName}
        style={styles.photo}
        maxWidthPx={120}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name ?? 'Unnamed place'}
        </Text>
        {place.address ? (
          <Text style={styles.address} numberOfLines={1}>
            {place.address}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={16} color={theme.icon} style={styles.chevron} />
    </Pressable>
  );
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, isLoading, logout } = useAuth();
  const favorites = useFavoritesStore((state) => state.favorites);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.background },
        scroll: { flex: 1 },
        scrollContent: { paddingBottom: 120 },

        // header
        header: {
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.xl,
          gap: Spacing.md,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        headerTitle: {
          ...Typography.subtitle,
          color: theme.text,
          fontWeight: '700',
        },
        settingsBtn: {
          width: 40,
          height: 40,
          borderRadius: Radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.border,
        },

        // user card
        userCard: {
          backgroundColor: theme.surface,
          borderRadius: Radius.lg,
          padding: Spacing.lg,
          gap: Spacing.xs,
          ...Shadow.card,
        },
        avatarRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
        },

        avatar: {
          width: 64,
          height: 64,
          borderRadius: Radius.pill,
        },

        avatarPlaceholder: {
          width: 64,
          height: 64,
          borderRadius: Radius.pill,
          backgroundColor: theme.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        },

        avatarText: {
          ...Typography.subtitle,
          color: theme.text,
          fontWeight: '700',
        },

        userInfo: {
          flex: 1,
        },
        userName: {
          ...Typography.title4,
          color: theme.text,
          fontWeight: '700',
        },
        userEmail: {
          ...Typography.body2,
          color: theme.textMuted,
        },
        userProvider: {
          ...Typography.body3,
          color: theme.textMuted,
          opacity: 0.6,
          textTransform: 'capitalize',
        },

        // sections
        section: {
          paddingHorizontal: Spacing.xl,
          gap: Spacing.sm,
        },
        sectionLabel: {
          ...Typography.footnote,
          color: theme.textMuted,
          letterSpacing: 1.5,
          fontWeight: '500',
          textTransform: 'uppercase',
        },
        sectionCard: {
          backgroundColor: theme.surface,
          borderRadius: Radius.lg,
          paddingHorizontal: Spacing.lg,
          ...Shadow.card,
        },

        // empty favorites
        emptyFavorites: {
          alignItems: 'center',
          paddingVertical: Spacing.xl,
          gap: Spacing.sm,
        },
        emptyText: {
          ...Typography.body2,
          color: theme.textMuted,
        },
        emptySubtext: {
          ...Typography.body3,
          color: theme.textMuted,
          opacity: 0.6,
        },

        // logout
        logoutBtn: {
          marginHorizontal: Spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          paddingVertical: Spacing.md,
          borderRadius: Radius.pill,
          borderWidth: 1.5,
          borderColor: theme.border,
        },
        logoutText: {
          ...Typography.body2,
          color: theme.text,
          fontWeight: '600',
        },

        // loading
        center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
      }),
    [theme],
  );

  if (isLoading) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.sm }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Pressable
              style={styles.settingsBtn}
              onPress={() => router.push('/settings')}
              accessibilityLabel="Settings"
            >
              <Settings size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* User card */}
          <View style={styles.userCard}>
            <View style={styles.avatarRow}>
              {user?.picture ? (
                <Image
                  source={{ uri: user.picture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {(user?.name?.[0] ?? 'T').toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user?.name ?? 'Traveller'}
                </Text>

                {user?.email ? (
                  <Text style={styles.userEmail}>
                    {user.email}
                  </Text>
                ) : null}

                <Text style={styles.userProvider}>
                  Signed in with {user?.provider ?? ''}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Favorites */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Saved places</Text>
          <View style={styles.sectionCard}>
            {favorites.length === 0 ? (
              <View style={styles.emptyFavorites}>
                <Bookmark size={28} color={theme.textMuted} strokeWidth={1.5} />
                <Text style={styles.emptyText}>No saved places yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap the bookmark icon on any place to save it here
                </Text>
              </View>
            ) : (
              favorites.map((place) => (
                <FavoriteRow
                  key={place.placeId}
                  place={place}
                />
              ))
            )}
          </View>
        </View>

        {/* Logout */}
        <Pressable
          style={[styles.logoutBtn, { marginTop: Spacing.xl }]}
          onPress={logout}
        >
          <LogOut size={18} color={theme.text} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}