// App.tsx
import React, { useState } from 'react';
import { StatusBar, View, Pressable, Text, StyleSheet } from 'react-native';
import GameScreen from './src/screens/GameScreen';
import DailyScreen from './src/screens/DailyScreen';
import { colors } from './src/constants/colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [screen, setScreen] = useState<'game' | 'daily'>('game');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.bgTop} />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => setScreen('game')} style={[styles.tab, screen === 'game' && styles.tabActive]}>
              <Text style={[styles.tabText, screen === 'game' && styles.tabTextActive]}>Game</Text>
            </Pressable>
            <Pressable onPress={() => setScreen('daily')} style={[styles.tab, screen === 'daily' && styles.tabActive]}>
              <Text style={[styles.tabText, screen === 'daily' && styles.tabTextActive]}>Daily</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>Number Master</Text>
          <View style={{ width: 80 }} />
        </View>

        {screen === 'game' ? <GameScreen /> : <DailyScreen />}

      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 68,
    backgroundColor: colors.bgTop,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderBottomColor: '#00000066',
    borderBottomWidth: 1,
    paddingTop: 25,
  },
  headerLeft: {
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#30003040',
  },
  tabActive: {
    backgroundColor: colors.neon,
  },
  tabText: {
    color: '#ddd',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#1b0a2b',
  },
  title: {
    color: colors.headerText,
    fontWeight: '900',
    fontSize: 16,
  },
});
