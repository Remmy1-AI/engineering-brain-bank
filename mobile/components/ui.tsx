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

import { Brand } from '@/constants/Colors';

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

export function GoldLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.goldLabel}>{children}</Text>;
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
        (disabled || loading) && styles.btnDisabled,
        pressed && !disabled && { opacity: 0.88 },
      ]}>
      {loading ? (
        <ActivityIndicator color={Brand.goldInk} />
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
        pressed && !disabled && { opacity: 0.88 },
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
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  right?: ReactNode;
}) {
  const content = (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
      </View>
      {right}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
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
    fontFamily: 'Syne_700Bold',
    fontSize: 28,
    color: Brand.text,
    letterSpacing: 0.2,
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
  goldLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: Brand.gold,
    textTransform: 'uppercase',
  },
  primaryBtn: {
    backgroundColor: Brand.gold,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 4,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Syne_700Bold',
    color: Brand.goldInk,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: Brand.border,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 4,
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
    color: Brand.gold,
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  input: {
    backgroundColor: Brand.bgInput,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 4,
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
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
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
    marginTop: 22,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 16,
    color: Brand.text,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'Syne_700Bold',
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
