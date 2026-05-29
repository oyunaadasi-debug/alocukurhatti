// Global yazı tipi sarmalayıcı — RN Text'i sarar, stildeki fontWeight'e göre
// doğru Plus Jakarta Sans ailesini enjekte eder. Böylece tek tek ekranlardaki
// stilleri değiştirmeden tüm uygulama premium fonta geçer.
// (Eski monkey-patch yaklaşımı yerine bu güvenli — ref ve tüm prop'lar aktarılır.)
import React, { forwardRef } from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

function weightToFamily(weight?: string | number): string {
  switch (String(weight)) {
    case '100':
    case '200': return 'PlusJakartaSans_200ExtraLight';
    case '300': return 'PlusJakartaSans_300Light';
    case '500': return 'PlusJakartaSans_500Medium';
    case '600': return 'PlusJakartaSans_600SemiBold';
    case '700':
    case 'bold': return 'PlusJakartaSans_700Bold';
    case '800':
    case '900': return 'PlusJakartaSans_800ExtraBold';
    default:    return 'PlusJakartaSans_400Regular'; // 400, 'normal', undefined
  }
}

export const Text = forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  (props, ref) => {
    const flat = StyleSheet.flatten(props.style) || {};
    const fontFamily = weightToFamily(flat.fontWeight as any);
    return <RNText ref={ref} {...props} style={[props.style, { fontFamily }]} />;
  }
);
Text.displayName = 'Text';
