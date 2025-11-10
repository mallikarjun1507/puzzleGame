// src/hooks/useGameLogic.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Audio } from 'expo-av'; 

type CellGrid = number[][];

const DEFAULT_ROWS = 6;
const DEFAULT_COLS = 6;
const INITIAL_FILLED_ROWS = 3;
const MATCHES_TO_LEVEL_UP = 6;

const randVal = (maxNumber: number) => Math.floor(Math.random() * maxNumber) + 1;

const playSound = async (soundFile: any) => {
  try {
  
    const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: true });

   
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('Sound play error:', error);
  }
};
export function useGameLogic() {
  const [rows] = useState(DEFAULT_ROWS);
  const [cols] = useState(DEFAULT_COLS);
  const [level, setLevel] = useState(1);
  const [maxRowsPerLevel] = useState({ 1: 4, 2: 5, 3: 6 });

  const [grid, setGrid] = useState<CellGrid>(() => {
    const g: CellGrid = Array.from({ length: DEFAULT_ROWS }, () => Array(cols).fill(0));
    for (let r = 0; r < INITIAL_FILLED_ROWS; r++) {
      for (let c = 0; c < cols; c++) g[r][c] = randVal(9 + (level - 1) * 2);
    }
    return g;
  });

  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState(0);
  const [rowsAdded, setRowsAdded] = useState(0);
  const MAX_ADD_PER_LEVEL = 4;

  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => setHistory([score]), []);

  const pushHistory = useCallback((s: number) => {
    setHistory((h) => {
      const next = [...h, s];
      if (next.length > 24) next.shift();
      return next;
    });
  }, []);

  const canAddRow = useMemo(
    () =>
      rowsAdded < MAX_ADD_PER_LEVEL &&
      INITIAL_FILLED_ROWS + rowsAdded < maxRowsPerLevel[level],
    [rowsAdded, level]
  );

  const resetLevelGrid = useCallback(
    (lvl = 1) => {
      const g: CellGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
      const filled = Math.min(INITIAL_FILLED_ROWS, maxRowsPerLevel[lvl]);
      for (let r = 0; r < filled; r++) {
        for (let c = 0; c < cols; c++) g[r][c] = randVal(9 + (lvl - 1) * 2);
      }
      setGrid(g);
      setRowsAdded(0);
      setMatches(0);
      setScore(0);
      setHistory([0]);
    },
    [cols, rows, maxRowsPerLevel]
  );

  const addRow = useCallback(() => {
    if (!canAddRow) return false;
    setGrid((prev) => {
      const newRow = Array.from({ length: cols }, () => randVal(9 + (level - 1) * 2));
      const next = prev.map((r) => r.slice());
      next.shift(); 
      next.push(newRow);
      return next;
    });
    setRowsAdded((p) => p + 1);
    return true;
  }, [cols, level, canAddRow]);

  const compactUp = useCallback(
    (g: CellGrid) => {
      const next = Array.from({ length: rows }, () => Array(cols).fill(0));
      for (let c = 0; c < cols; c++) {
        let write = 0;
        for (let r = 0; r < rows; r++) {
          if (g[r][c] && g[r][c] > 0) {
            next[write][c] = g[r][c];
            write++;
          }
        }
      }
      return next;
    },
    [cols, rows]
  );

  const tryMatch = useCallback(
    (r1: number, c1: number, r2: number, c2: number) => {
      const a = grid[r1][c1];
      const b = grid[r2][c2];
      if (!a || !b) {
        playSound(require('../../assets/sounds/fail.mp3')); 
        return { ok: false, reason: 'empty', levelUp: false };
      }
      if (!(a === b || a + b === 10)) {
        playSound(require('../../assets/sounds/fail.mp3')); 
        return { ok: false, reason: 'not-match', levelUp: false };
      }

     
      playSound(require('../../assets/sounds/match.mp3')); 
      const delta = a === b ? a * 2 : a + b;

      setGrid((prev) => {
        const next = prev.map((r) => r.slice());
        next[r1][c1] = 0;
        next[r2][c2] = 0;
        return compactUp(next);
      });

      let levelUp = false;
      setScore((s) => {
        const ns = s + delta;
        pushHistory(ns);
        return ns;
      });

      setMatches((m) => {
        const newMatches = m + 1;
        if (newMatches >= MATCHES_TO_LEVEL_UP) {
          if (level < 3) {
            setLevel((lv) => {
              const newLevel = Math.min(3, lv + 1);
              levelUp = true; 
              setTimeout(() => resetLevelGrid(newLevel), 400);
              playSound(require('../../assets/sounds/levelup.mp3')); 
              return newLevel;
            });
          }
          return 0;
        }
        return newMatches;
      });

      return { ok: true, delta, levelUp };
    },
    [compactUp, grid, level, pushHistory, resetLevelGrid]
  );

  const resetAll = useCallback(() => resetLevelGrid(1), [resetLevelGrid]);

  return {
    grid,
    score,
    level,
    matches,
    history,
    addRow,
    canAddRow,
    tryMatch,
    resetAll,
    setLevel,
    rowsAdded,
    MAX_ADD_PER_LEVEL,
  };
}
