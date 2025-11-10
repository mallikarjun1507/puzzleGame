// src/screens/GameScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

// import LottieView from 'lottie-react-native'; // 
import ScoreWave from '../components/ScoreWave';
import Tile from '../components/Tile';
import { colors } from '../constants/colors';
import { useGameLogic } from '../hooks/useGameLogic';

import { Audio } from 'expo-av';

export default function GameScreen() {
    const {
        grid,
        score,
        level,
        matches,
        history,
        addRow,
        canAddRow,
        tryMatch,
        resetAll,
    } = useGameLogic();

    const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [levelUpVisible, setLevelUpVisible] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const confettiRef = useRef<any>(null);

    // Load saved high score
    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem('highScore');
            if (saved) setHighScore(Number(saved));
        })();
    }, []);

    // Save new high score
    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            AsyncStorage.setItem('highScore', score.toString());
        }
    }, [score]);


    // Successful match sound
    const playMatchSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/match.mp3'),
      { shouldPlay: true }
    );

    // optional: unload when finished
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('Sound play error:', error);
  }
};
const playLevelUpSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/levelup.mp3'),
      { shouldPlay: true }
    );

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('Level up sound error:', error);
  }
};
    //  Invalid move sound
const playFailSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/fail.mp3'),
      { shouldPlay: true } // plays immediately
    );

    //  Automatically unload after finishing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('Fail sound error:', error);
  }
};

    const handleTap = (r: number, c: number) => {
        if (!selected) {
            if (grid[r][c] === 0) return;
            setSelected({ r, c });
            return;
        }

        if (selected.r === r && selected.c === c) {
            setSelected(null);
            return;
        }

        const res = tryMatch(selected.r, selected.c, r, c);
        if (!res.ok) {
            Alert.alert('Invalid', 'Tiles must be equal or sum to 10.');
        } else {
            playMatchSound();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 1200);

            if (res.levelUp) {
                setLevelUpVisible(true);
                setTimeout(() => setLevelUpVisible(false), 2500);
            }
        }
        setSelected(null);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.stage}>LEVEL {level}</Text>

                <View style={styles.scoreBox}>
                    <Text style={styles.scoreLabel}>SCORE</Text>
                    <Text style={styles.score}>{score}</Text>
                    <Text style={styles.highScore}>Best: {highScore}</Text>
                </View>

                <Text style={styles.goal}>Goal: Match Numbers or Sum to 10</Text>
            </View>

            {/* Game Panel */}
            <View style={styles.panel}>
                {grid.map((row, rIdx) => (
                    <View key={rIdx} style={styles.row}>
                        {row.map((v, cIdx) => (
                            <Tile
                                key={`${rIdx}-${cIdx}`}
                                value={v}
                                highlighted={
                                    !!(selected && selected.r === rIdx && selected.c === cIdx)
                                }
                                matched={false}
                                invalidFlash={false}
                                onPress={() => handleTap(rIdx, cIdx)}
                                size={56}
                            />
                        ))}
                    </View>
                ))}

                <ScoreWave history={history} />

                {/* Controls */}
                <View style={styles.controls}>
                    <Pressable
                        style={[styles.btn, !canAddRow && styles.btnDisabled]}
                        onPress={() => {
                            if (!canAddRow) {
                                Alert.alert('Limit reached', 'You cannot add more rows this level.');
                                return;
                            }
                            addRow();
                        }}
                    >
                        <Text style={styles.btnText}>
                            {canAddRow ? `+ Add Row` : `Add Limit`}
                        </Text>
                    </Pressable>

                    <Pressable style={styles.btn} onPress={() => resetAll()}>
                        <Text style={styles.btnText}>Restart</Text>
                    </Pressable>
                </View>
            </View>

            {/* Confetti Animation */}
            {showConfetti && (
                <ConfettiCannon
                    count={25}
                    origin={{ x: 200, y: 0 }}
                    autoStart
                    explosionSpeed={350}
                    fallSpeed={2800}
                />
            )}

            {/*  Lottie Animation Disabled for Now */}
            {/* 
      {levelUpVisible && (
        <View style={styles.lottieWrapper}>
          <LottieView
            source={require('../../assets/lottie/amazing.json')}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
        </View>
      )}
      */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgTop,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
   header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10, 
    paddingBottom: 20,
    backgroundColor: colors.panel,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
},

    stage: {
        color: colors.neon,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 6,
    },
    scoreBox: {
        alignItems: 'center',
        marginBottom: 6,
    },
    scoreLabel: {
        color: colors.headerText,
        fontSize: 14,
        opacity: 0.8,
    },
    score: {
        color: '#00FFAA',
        fontSize: 38,
        fontWeight: '900',
        textShadowColor: '#00ffaa55',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
    highScore: {
        color: '#FFD700',
        fontSize: 14,
        marginTop: 4,
        fontWeight: '700',
    },
    goal: {
        color: colors.headerText,
        fontSize: 13,
        opacity: 0.9,
    },
    panel: {
        width: '92%',
        marginTop: 16,
        backgroundColor: colors.panel,
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    row: { flexDirection: 'row' },
    controls: { flexDirection: 'row', marginTop: 16, gap: 12 },
    btn: {
        backgroundColor: '#3b2a42',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        marginHorizontal: 8,
    },
    btnDisabled: { backgroundColor: '#5a4b5c' },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    lottieWrapper: {
        position: 'absolute',
        top: '40%',
        alignSelf: 'center',
    },
});
