import React from 'react';
import { View, StyleSheet } from 'react-native';
import Tile from './Tile';
import { colors } from '../constants/colors';

type GameBoardProps = {
  grid: number[][];
  onTilePress: (row: number, col: number) => void;
  matchedTiles: boolean[][];
  highlightedTile?: [number, number] | null;
  invalidTiles?: [number, number][];
};

const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  onTilePress,
  matchedTiles,
  highlightedTile,
  invalidTiles = [],
}) => {
  return (
    <View style={styles.container}>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((value, colIndex) => {
            const isMatched = matchedTiles[rowIndex]?.[colIndex];
            const isHighlighted =
              highlightedTile &&
              highlightedTile[0] === rowIndex &&
              highlightedTile[1] === colIndex;
            const isInvalid = invalidTiles.some(
              ([r, c]) => r === rowIndex && c === colIndex
            );

            return (
              <Tile
                key={`${rowIndex}-${colIndex}`}
                value={value}
                matched={isMatched}
                highlighted={!!isHighlighted}
                invalidFlash={isInvalid}
                onPress={() => onTilePress(rowIndex, colIndex)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gridBackground,
    padding: 8,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default GameBoard;
