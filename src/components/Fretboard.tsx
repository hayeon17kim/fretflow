import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import type { FretPosition, StringNumber } from '@/types/music';
import { COLORS, FRETBOARD } from '@/utils/constants';

// 프렛보드 하이라이트 정보
export interface FretHighlight {
  string: StringNumber;
  fret: number;
  color: string;
  label?: string;
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
}: FretboardProps) {
  const [pressedCell, setPressedCell] = useState<string | null>(null);

  const fretCount = endFret - startFret + 1;
  const stringCount = FRETBOARD.totalStrings;

  // 자동 컴팩트: fret이 많으면 자동으로 줄임 (V5.2 오버플로 수정)
  const autoCompact = compact || fretCount > 6;
  const cellW = autoCompact ? Math.min(28, Math.floor(260 / fretCount)) : 36;
  const cellH = autoCompact ? 22 : 28;
  const dotSize = autoCompact ? 14 : 18;

  const stringLabelW = 24;
  const svgWidth = stringLabelW + fretCount * cellW + 2;
  const svgHeight = stringCount * cellH + 20; // 아래 프렛 번호 공간

  const getHighlight = useCallback(
    (s: StringNumber, f: number) => highlights.find((h) => h.string === s && h.fret === f),
    [highlights],
  );

  const handleTap = useCallback(
    (s: StringNumber, f: number) => {
      if (!tappable || !onTap) return;

      // 탭 피드백 (200ms 플래시)
      const key = `${s}-${f}`;
      setPressedCell(key);
      setTimeout(() => setPressedCell(null), 200);

      onTap({ string: s, fret: f });
    },
    [tappable, onTap],
  );

  return (
    <View style={styles.container}>
      <Svg width={svgWidth} height={svgHeight}>
        {/* 프렛 세로선 */}
        {Array.from({ length: fretCount + 1 }, (_, i) => (
          <Line
            key={`fret-${i}`}
            x1={stringLabelW + i * cellW}
            y1={0}
            x2={stringLabelW + i * cellW}
            y2={stringCount * cellH}
            stroke={i === 0 && startFret === 0 ? COLORS.textPrimary : COLORS.fretLine}
            strokeWidth={i === 0 && startFret === 0 ? 3 : 1}
          />
        ))}

        {/* 줄 가로선 */}
        {Array.from({ length: stringCount }, (_, i) => (
          <Line
            key={`string-${i}`}
            x1={stringLabelW}
            y1={i * cellH + cellH / 2}
            x2={stringLabelW + fretCount * cellW}
            y2={i * cellH + cellH / 2}
            stroke={COLORS.fretLine}
            strokeWidth={1}
          />
        ))}

        {/* 줄 번호 라벨 */}
        {FRETBOARD.standardTuning.map((note, i) => (
          <SvgText
            key={`label-${i}`}
            x={10}
            y={i * cellH + cellH / 2 + 4}
            fill={COLORS.textTertiary}
            fontSize={10}
            textAnchor="middle"
          >
            {note}
          </SvgText>
        ))}

        {/* 프렛 번호 (하단) */}
        {Array.from({ length: fretCount }, (_, i) => {
          const fretNum = startFret + i;
          if (fretNum === 0) return null;
          return (
            <SvgText
              key={`fretnum-${i}`}
              x={stringLabelW + i * cellW + cellW / 2}
              y={stringCount * cellH + 14}
              fill={COLORS.textTertiary}
              fontSize={9}
              textAnchor="middle"
            >
              {fretNum}
            </SvgText>
          );
        })}

        {/* 탭 영역 + 하이라이트 */}
        {Array.from({ length: stringCount }, (_, si) =>
          Array.from({ length: fretCount }, (_, fi) => {
            const s = (si + 1) as StringNumber;
            const f = startFret + fi;
            const hl = getHighlight(s, f);
            const isPressed = pressedCell === `${s}-${f}`;
            const cx = stringLabelW + fi * cellW + cellW / 2;
            const cy = si * cellH + cellH / 2;

            return (
              <React.Fragment key={`cell-${s}-${f}`}>
                {/* 탭 영역 (투명) */}
                {tappable && (
                  <Rect
                    x={stringLabelW + fi * cellW}
                    y={si * cellH}
                    width={cellW}
                    height={cellH}
                    fill="transparent"
                    onPress={() => handleTap(s, f)}
                  />
                )}

                {/* 하이라이트 점 */}
                {hl && (
                  <>
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={dotSize / 2}
                      fill={isPressed ? COLORS.textPrimary : hl.color}
                      opacity={isPressed ? 0.6 : 0.9}
                    />
                    {hl.label && (
                      <SvgText
                        x={cx}
                        y={cy + 4}
                        fill={COLORS.bg}
                        fontSize={autoCompact ? 8 : 10}
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {hl.label}
                      </SvgText>
                    )}
                  </>
                )}

                {/* 탭 피드백 링 */}
                {isPressed && !hl && (
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={dotSize / 2}
                    fill="transparent"
                    stroke={COLORS.accent}
                    strokeWidth={2}
                    opacity={0.5}
                  />
                )}
              </React.Fragment>
            );
          }),
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
