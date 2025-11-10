import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

const STORAGE_KEY = 'daily_completion_v1';

export default function DailyScreen() {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const daysInMonth = 30; 
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(JSON.parse(raw));
    })();
  }, []);

  const toggleDay = async (d: number) => {
    const next = { ...completed, [d]: !completed[d] };
    setCompleted(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const renderDay = ({ item }: { item: number }) => {
    const done = !!completed[item];
    return (
      <Pressable onPress={() => toggleDay(item)} style={[styles.day, done && styles.dayDone]}>
        <Text style={[styles.dayText, done && styles.dayTextDone]}>{item}</Text>
      </Pressable>
    );
  };

  const numbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Daily Challenges</Text>
      <Text style={styles.subtitle}>Tap a day to mark as complete</Text>

      <FlatList
        data={numbers}
        numColumns={7}
        keyExtractor={(i) => String(i)}
        renderItem={renderDay}
        contentContainerStyle={styles.grid}
      />

      <Pressable
        style={styles.clear}
        onPress={async () => {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setCompleted({});
          Alert.alert('Progress Cleared');
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Clear Progress</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBottom,
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 24, 
  },
  title: {
    color: colors.headerText,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: '#ccc',
    marginBottom: 10,
  },
  grid: {
    alignItems: 'center',
    marginTop: 8,
  },
  day: {
    width: 44,
    height: 44,
    margin: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#301b2f',
  },
  dayDone: {
    backgroundColor: colors.neon,
  },
  dayText: {
    color: '#ddd',
  },
  dayTextDone: {
    color: '#1b0a2b',
    fontWeight: '900',
  },
  clear: {
    backgroundColor: '#7a3b62',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
    marginBottom: 20, 
  },
});
