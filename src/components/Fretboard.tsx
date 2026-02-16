import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FretPosition, StringNumber } from '@/types/music';
import { COLORS, FRETBOARD } from '@/utils/constants';

// 프렛보드 하이라이트 정보
export interface FretHighlight {
  string: StringNumber;
  fret: number;
  color: string;
  label?: string;
  border?: string;
  textColor?: string;
  opacity?: number;
}

interface FretboardProps {
  startFret?: number;
  endFret?: number;
  highlights?: FretHighlight[];
  onTap?: (pos: FretPosition) => void;
  tappable?: boolean;
  compact?: boolean;
  showOnboarding?: boolean;
}

export function Fretboard({
  startFret = 0,
  endFret = 4,
  highlights = [],
  onTap,
  tappable = false,
  compact = false,
  showOnboarding = false,
}: FretboardProps) {
  const [pressedCell, setPressedCell] = useState<string | null>(null);

  const fretCount = endFret - startFret + 1;
  const stringCount = FRETBOARD.totalStrings;

  // 자동 컴팩트: fret이 많으면 자동으로 줄임 (V5.2 오버플로 수정)
  const autoCompact = compact || fretCount > 6;
  const cellW = autoCompact ? Math.min(28, Math.floor(260 / fretCount)) : 36;
  const cellH = autoCompact ? 22 : 28;
  const dotSize = autoCompact ? 18 : 24;

  // 점 인레이 마커를 표시할 프렛 번호들
  const dotFrets = [3, 5, 7, 9, 12, 15];
  const doubleDotFrets = [12];

  const handleCellClick = (s: StringNumber, fret: number) => {
    if (!tappable || !onTap) return;

    // 탭 피드백 (200ms 플래시)
    const key = `${s}-${fret}`;
    setPressedCell(key);
    setTimeout(() => setPressedCell(null), 200);

    onTap({ string: s, fret });
  };

  return (
    <View style={styles.container}>
      {/* Onboarding overlay */}
      {showOnboarding && (
        <View style={styles.onboardingOverlay}>
          <Text style={styles.onboardingEmoji}>👆</Text>
          <Text style={styles.onboardingTitle}>프렛보드를 직접 탭하세요!</Text>
          <Text style={styles.onboardingSub}>○ 표시된 위치를 눌러 답을 선택해요</Text>
          <Text style={styles.onboardingHint}>탭하여 시작</Text>
        </View>
      )}

      {/* Fret numbers header */}
      <View style={[styles.fretHeader, { marginLeft: autoCompact ? 22 : 28 }]}>
        {Array.from({ length: fretCount }, (_, i) => {
          const fretNum = startFret + i;
          const isDotFret = dotFrets.includes(fretNum);
          return (
            <View key={fretNum} style={{ width: cellW, alignItems: 'center' }}>
              <Text
                style={[
                  styles.fretNumber,
                  {
                    fontSize: autoCompact ? 8 : 9,
                    color: isDotFret ? COLORS.textSecondary : COLORS.textTertiary,
                    fontWeight: isDotFret ? '700' : '400',
                  },
                ]}
              >
                {fretNum === 0 ? '0' : fretNum}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Fretboard body */}
      <View style={styles.fretboardBody}>
        {/* String name column */}
        <View style={styles.stringColumn}>
          {FRETBOARD.standardTuning.map((note, i) => (
            <View key={i} style={{ height: cellH, justifyContent: 'center', alignItems: 'flex-end' }}>
              <Text
                style={[
                  styles.stringLabel,
                  {
                    fontSize: autoCompact ? 8 : 10,
                    width: autoCompact ? 16 : 20,
                  },
                ]}
              >
                {note}
              </Text>
            </View>
          ))}
        </View>

        {/* Fret grid */}
        <View style={styles.fretGrid}>
          {/* Nut (thick line at fret 0) */}
          {startFret === 0 && <View style={styles.nut} />}

          {FRETBOARD.standardTuning.map((_, si) => {
            const stringNum = (si + 1) as StringNumber;
            return (
              <View key={si} style={{ position: 'relative', height: cellH }}>
                {/* String line */}
                <View
                  style={[
                    styles.stringLine,
                    {
                      height: si >= 4 ? 2 : si >= 2 ? 1.5 : 1,
                    },
                  ]}
                />

                {/* Fret cells */}
                <View style={{ flexDirection: 'row', height: cellH }}>
                  {Array.from({ length: fretCount }, (_, fi) => {
                    const fret = startFret + fi;
                    const hl = highlights.find((h) => h.string === stringNum && h.fret === fret);
                    const isPressed = pressedCell === `${stringNum}-${fret}`;

                    return (
                      <Pressable
                        key={fi}
                        onPress={() => handleCellClick(stringNum, fret)}
                        disabled={!tappable}
                        style={({ pressed }) => [
                          styles.cell,
                          {
                            width: cellW,
                            height: cellH,
                            backgroundColor:
                              isPressed || pressed
                                ? 'rgba(255,255,255,0.12)'
                                : tappable && !hl
                                  ? 'rgba(255,255,255,0.02)'
                                  : 'transparent',
                            borderRightWidth: 1,
                            borderRightColor: `${COLORS.textTertiary}35`,
                            borderBottomWidth: si < stringCount - 1 ? 1 : 0,
                            borderBottomColor: `${COLORS.bg}20`,
                          },
                        ]}
                      >
                        {/* Fret dot inlay markers */}
                        {si === 2 && dotFrets.includes(fret) && !doubleDotFrets.includes(fret) && !hl && (
                          <View style={styles.inlayDot} />
                        )}

                        {/* Highlight dot */}
                        {hl ? (
                          <View
                            style={[
                              styles.highlightDot,
                              {
                                width: dotSize,
                                height: dotSize,
                                borderRadius: dotSize / 2,
                                backgroundColor: hl.color || COLORS.accent,
                                borderWidth: hl.border ? 2 : 0,
                                borderColor: hl.border || 'transparent',
                                opacity: hl.opacity ?? 1,
                                transform: [{ scale: isPressed ? 0.9 : 1 }],
                              },
                            ]}
                          >
                            {hl.label && (
                              <Text
                                style={[
                                  styles.highlightLabel,
                                  {
                                    fontSize: autoCompact ? 8 : 11,
                                    color: hl.textColor || COLORS.bg,
                                  },
                                ]}
                              >
                                {hl.label}
                              </Text>
                            )}
                          </View>
                        ) : tappable ? (
                          // Tappable empty cell indicator
                          <View
                            style={[
                              styles.emptyDot,
                              {
                                width: dotSize - 4,
                                height: dotSize - 4,
                                borderRadius: (dotSize - 4) / 2,
                                backgroundColor: isPressed
                                  ? `${COLORS.textTertiary}40`
                                  : `${COLORS.textTertiary}10`,
                              },
                            ]}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Tap instruction hint for tappable mode */}
      {tappable && (
        <Text style={styles.tapHint}>○ = 탭 가능한 위치</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  onboardingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  onboardingEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  onboardingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  onboardingSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    textAlign: 'center',
  },
  onboardingHint: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginTop: 8,
  },
  fretHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fretNumber: {
    textAlign: 'center',
  },
  fretboardBody: {
    flexDirection: 'row',
  },
  stringColumn: {
    paddingRight: 5,
  },
  stringLabel: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
  fretGrid: {
    flex: 1,
    borderWidth: 1,
    borderColor: `${COLORS.textTertiary}40`,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  nut: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.textSecondary,
    zIndex: 5,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  stringLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    backgroundColor: '#666',
    transform: [{ translateY: -0.5 }],
    zIndex: 1,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  inlayDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: `${COLORS.textTertiary}50`,
  },
  highlightDot: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,229,160,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 3,
  },
  highlightLabel: {
    fontWeight: '700',
  },
  emptyDot: {
    borderWidth: 1.5,
    borderColor: `${COLORS.textTertiary}60`,
    zIndex: 3,
  },
  tapHint: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 9,
    color: COLORS.textTertiary,
    letterSpacing: 0.3,
  },
});
