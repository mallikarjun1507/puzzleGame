// src/components/ScoreWave.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

type Props = { history: number[]; height?: number };

export default function ScoreWave({ history, height = 60 }: Props) {
  const points = useMemo(() => {
    if (!history || history.length === 0) {
      // default tiny line
      return `0,${height / 2} ${width * 0.86},${height / 2}`;
    }
    const max = Math.max(...history, 1);
    const min = Math.min(...history, 0);
    const span = max - min || 1;
    const cols = history.length;
    return history.map((v, i) => {
      const x = (i / Math.max(1, cols - 1)) * (width * 0.86);
      // invert Y because svg origin is top
      const normalized = (v - min) / span;
      const y = height - normalized * (height - 8) - 4;
      return `${x},${y}`;
    }).join(' ');
  }, [history, height]);

  return (
    <View style={styles.wrap}>
      <Svg width="86%" height={height} viewBox={`0 0 ${width * 0.86} ${height}`}>
        <Polyline points={points} fill="none" stroke={colors.wave} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', marginTop: 10 },
});
