import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';

export default function LevelUpBanner({ visible, level }: { visible: boolean; level: number }) {
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      lottieRef.current?.play();
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.delay(1500),
        Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fade, transform: [{ translateY }] }]}>
      <LottieView
        ref={lottieRef}
        source={require('../../assets/animations/levelup.json')}
        autoPlay={false}
        loop={false}
        style={{ width: 160, height: 160 }}
      />
      <Text style={styles.text}>Level {level} Unlocked!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowRadius: 10,
    marginTop: -10,
  },
});
