import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameLogic } from '../hooks/useGameLogic';

const ScoreBoard = () => {
  const { score } = useGameLogic();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Score: {score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default ScoreBoard;
