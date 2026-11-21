/**
 * Template leftover — Brain Bank screens use constants/Colors + components/ui.
 * Kept as a thin wrapper so any residual imports keep working.
 */
import {
  Text as DefaultText,
  View as DefaultView,
  type TextProps,
  type ViewProps,
} from 'react-native';

import { Brand } from '@/constants/Colors';

export type ThemeProps = { lightColor?: string; darkColor?: string };

export function Text(props: ThemeProps & TextProps) {
  const { style, lightColor: _l, darkColor: _d, ...other } = props;
  return <DefaultText style={[{ color: Brand.text }, style]} {...other} />;
}

export function View(props: ThemeProps & ViewProps) {
  const { style, lightColor: _l, darkColor: _d, ...other } = props;
  return <DefaultView style={[{ backgroundColor: Brand.bg }, style]} {...other} />;
}
