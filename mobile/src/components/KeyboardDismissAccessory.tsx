import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * EVRENSEL KLAVYE KAPATMA — tüm projelerde aynısı kullanılır.
 *
 * Klavye açıkken, klavyenin hemen ÜSTÜNDE yüzen bir "Klavyeyi Kapat" düğmesi
 * gösterir. Hem iOS hem Android. Hiçbir TextInput'a dokunmaya gerek YOK.
 *
 * KULLANIM: Kök ağaçta navigator ile KARDEŞ olarak BİR KEZ render et:
 *   <View style={{ flex: 1 }}>
 *     <NavigationContainer>...</NavigationContainer>
 *     <KeyboardDismissAccessory />
 *   </View>
 */
export function KeyboardDismissAccessory() {
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, (e) => setKbHeight(e.endCoordinates?.height ?? 0));
    const hideSub = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (kbHeight <= 0) return null;

  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom: kbHeight + 6 }]}>
      <Pressable
        onPress={() => Keyboard.dismiss()}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Klavyeyi kapat"
        style={s.pill}
      >
        <Text style={s.text}>⌄  Klavyeyi Kapat</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', right: 12, left: 12, alignItems: 'flex-end', zIndex: 9999, elevation: 9999 },
  pill: {
    backgroundColor: 'rgba(20,20,22,0.92)',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
