// src/components/Tile.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

type Props = {
  value: number;
  size?: number;
  onPress?: () => void;
  highlighted?: boolean;
  matched?: boolean;
  invalidFlash?: boolean;
};

const Tile: React.FC<Props> = ({ value, size = 56, onPress, highlighted = false, matched = false, invalidFlash = false }) => {
  const scale = useRef(new Animated.Value(highlighted ? 1.06 : 1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(invalidFlash ? 1 : 0)).current;
  const opacity = matched ? 0.32 : 1;

  useEffect(() => {
    Animated.timing(scale, { toValue: highlighted ? 1.06 : 1, duration: 120, useNativeDriver: true }).start();
  }, [highlighted]);

  useEffect(() => {
    if (invalidFlash) {
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 30, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 30, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 30, useNativeDriver: true }),
      ]).start();
    }
  }, [invalidFlash]);

  const translateX = shake.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] });

  const bg = (colors.tiles as any)[value] || colors.tiles.default;
  const textColor = value > 4 ? '#fff' : '#1d0b2a';

  return (
    <Pressable onPress={onPress} style={{ margin: 4 }}>
      <Animated.View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            transform: [{ scale }, { translateX }],
            backgroundColor: bg,
            opacity: opacity,
          },
        ]}>

        <Animated.Text style={[styles.text, { color: matched ? '#bbb' : textColor }]}>{value > 0 ? value : ''}</Animated.Text>

        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.invalidFlash, opacity: flash, borderRadius: 10 }]} pointerEvents="none" />

        {highlighted && <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderWidth: 2, borderColor: colors.neon, borderRadius: 10 }]} />}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: { fontSize: 20, fontWeight: '800' },
});

export default Tile;
