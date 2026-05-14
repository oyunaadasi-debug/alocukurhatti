// Ortak UI bileşenleri — DESIGN.md token sistemine göre
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { C, R, S, elevation, statusColor, statusLabel } from '../theme';

// ── Pill Butonu ──────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'success' | 'soft' | 'ghost';

interface PillBtnProps {
  label: string;
  onPress: () => void;
  variant?: BtnVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<BtnVariant, { bg: string; text: string; elev: 0|1|2|4|6 }> = {
  primary:   { bg: C.primary,      text: C.onPrimary,   elev: 4 },
  secondary: { bg: C.secondary,    text: C.onSecondary, elev: 2 },
  success:   { bg: C.success,      text: C.onSuccess,   elev: 2 },
  soft:      { bg: C.canvasSoft,   text: C.ink,         elev: 0 },
  ghost:     { bg: 'transparent',  text: C.primary,     elev: 0 },
};

export function PillBtn({ label, onPress, variant = 'primary', icon, loading, disabled, fullWidth }: PillBtnProps) {
  const v = VARIANT_STYLES[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.pillBtn,
        { backgroundColor: v.bg, opacity: disabled ? 0.55 : 1, alignSelf: fullWidth ? 'stretch' : 'center' },
        elevation(v.elev),
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.pillBtnText, { color: v.text, marginLeft: icon ? S.xs : 0 }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ── Durum Badge (pill) ───────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const { bg, text } = statusColor(status);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{statusLabel(status)}</Text>
    </View>
  );
}

// ── Bölücü çizgi ────────────────────────────────────────────────
export function Divider({ mx = 0 }: { mx?: number }) {
  return <View style={{ height: 1, backgroundColor: C.canvasSofter, marginHorizontal: mx }} />;
}

// ── Bölüm başlığı ───────────────────────────────────────────────
export function SectionTitle({ text }: { text: string }) {
  return <Text style={styles.sectionTitle}>{text}</Text>;
}

// ── Meta satırı (ikon + metin) ───────────────────────────────────
export function MetaRow({ icon, text, color = C.body }: { icon: React.ReactNode; text: string; color?: string }) {
  return (
    <View style={styles.metaRow}>
      {icon}
      <Text style={[styles.metaText, { color }]} numberOfLines={2}>{text}</Text>
    </View>
  );
}

// ── Boş durum ───────────────────────────────────────────────────
export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.pill,
    paddingVertical: S.lg,
    paddingHorizontal: S.xl2,
    minHeight: 48,
  },
  pillBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  badge: {
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
    marginBottom: S.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: S.xs,
    marginBottom: S.xs,
  },
  metaText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: S.xl3,
  },
  emptyText: {
    fontSize: 14,
    color: C.mute,
    textAlign: 'center',
    lineHeight: 22,
  },
});
