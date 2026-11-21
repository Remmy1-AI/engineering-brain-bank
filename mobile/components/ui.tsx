import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, TypeColors } from '@/constants/Colors';
import type { MaterialTypeId } from '@/data/mockCatalog';

export function Screen({
  children,
  style,
  padded = true,
}: {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 8, paddingBottom: 8 },
        padded && styles.padded,
        style,
      ]}>
      {children}
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function AccentLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.accentLabel}>{children}</Text>;
}

/** @deprecated use AccentLabel — kept so older imports don’t break mid-edit */
export const GoldLabel = AccentLabel;

export function TypeDot({ type }: { type: MaterialTypeId | string }) {
  const color =
    (TypeColors as Record<string, string>)[type] ?? Brand.textDim;
  return <View style={[styles.typeDot, { backgroundColor: color }]} />;
}

export function TypePill({
  type,
  label,
}: {
  type: MaterialTypeId | string;
  label: string;
}) {
  const color =
    (TypeColors as Record<string, string>)[type] ?? Brand.textDim;
  return (
    <View style={styles.typePill}>
      <View style={[styles.typeDot, { backgroundColor: color }]} />
      <Text style={styles.typePillText}>{label}</Text>
    </View>
  );
}

export function LetterMark({ letters }: { letters: string }) {
  return (
    <View style={styles.letterMark}>
      <Text style={styles.letterMarkText}>{letters.slice(0, 3).toUpperCase()}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryBtn,
        pressed && !disabled && { backgroundColor: Brand.accentPressed },
        (disabled || loading) && styles.btnDisabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={Brand.accentInk} />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondaryBtn,
        disabled && styles.btnDisabled,
        pressed && !disabled && { backgroundColor: Brand.bgWash },
      ]}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <Text style={styles.ghostBtnText}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={Brand.textDim}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

export function ListRow({
  title,
  subtitle,
  meta,
  onPress,
  right,
  leading,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  right?: ReactNode;
  leading?: ReactNode;
}) {
  const content = (
    <View style={styles.row}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
      </View>
      {right}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.72 }]}>
      {content}
    </Pressable>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {action ? <View style={{ marginTop: 16 }}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  padded: {
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 30,
    color: Brand.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: Brand.textMuted,
    marginTop: 6,
    lineHeight: 22,
  },
  muted: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Brand.textDim,
  },
  accentLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    color: Brand.accent,
    textTransform: 'uppercase',
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typePillText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: Brand.textMuted,
  },
  letterMark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Brand.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterMarkText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: Brand.accent,
    letterSpacing: 0.3,
  },
  primaryBtn: {
    backgroundColor: Brand.accent,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'DMSans_700Bold',
    color: Brand.accentInk,
    fontSize: 15,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: Brand.border,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Brand.bgCard,
  },
  secondaryBtnText: {
    fontFamily: 'DMSans_500Medium',
    color: Brand.text,
    fontSize: 14,
  },
  ghostBtnText: {
    fontFamily: 'DMSans_500Medium',
    color: Brand.accent,
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  input: {
    backgroundColor: Brand.bgInput,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: Brand.text,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.borderSubtle,
  },
  leading: {
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: Brand.text,
  },
  rowSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Brand.textMuted,
  },
  rowMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Brand.textDim,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: Brand.text,
  },
  empty: {
    paddingVertical: 56,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: Brand.text,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Brand.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
    maxWidth: 280,
  },
});
