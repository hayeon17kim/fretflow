#!/usr/bin/env python3
"""
12음계 전체 생성 스크립트
기타 프렛보드에서 사용할 모든 음을 생성합니다.
"""

import math
import wave
import struct
from pathlib import Path

# 12음계 주파수 (A4 = 440Hz 기준으로 계산)
# 기타 음역대에 맞춰 여러 옥타브 포함
NOTES = {
    # 낮은 옥타브 (6번줄~4번줄 영역)
    'E2': 82.41,    # 6번줄 개방현
    'F2': 87.31,
    'F#2': 92.50,
    'G2': 98.00,
    'G#2': 103.83,
    'A2': 110.00,   # 5번줄 개방현
    'A#2': 116.54,
    'B2': 123.47,

    # 중간 옥타브 (4번줄~2번줄 영역)
    'C3': 130.81,
    'C#3': 138.59,
    'D3': 146.83,   # 4번줄 개방현
    'D#3': 155.56,
    'E3': 164.81,
    'F3': 174.61,
    'F#3': 185.00,
    'G3': 196.00,   # 3번줄 개방현
    'G#3': 207.65,
    'A3': 220.00,
    'A#3': 233.08,
    'B3': 246.94,   # 2번줄 개방현

    # 높은 옥타브 (1번줄 영역)
    'C4': 261.63,
    'C#4': 277.18,
    'D4': 293.66,
    'D#4': 311.13,
    'E4': 329.63,   # 1번줄 개방현
    'F4': 349.23,
    'F#4': 369.99,
    'G4': 392.00,
    'G#4': 415.30,
    'A4': 440.00,
    'A#4': 466.16,
    'B4': 493.88,

    # 초고음 (1번줄 하이 포지션)
    'C5': 523.25,
    'C#5': 554.37,
    'D5': 587.33,
    'D#5': 622.25,
    'E5': 659.25,
}

def generate_note(frequency, duration=2.5, sample_rate=44100):
    """
    기타 소리 시뮬레이션
    """
    num_samples = int(duration * sample_rate)
    samples = []

    for i in range(num_samples):
        t = i / sample_rate

        # 기본음
        sample = math.sin(2 * math.pi * frequency * t)

        # 배음 추가 (기타 특성)
        sample += 0.4 * math.sin(2 * math.pi * frequency * 2 * t)  # 2배음
        sample += 0.2 * math.sin(2 * math.pi * frequency * 3 * t)  # 3배음
        sample += 0.1 * math.sin(2 * math.pi * frequency * 4 * t)  # 4배음
        sample += 0.05 * math.sin(2 * math.pi * frequency * 5 * t) # 5배음

        # 엔벨로프 (지수 감쇠 - 기타 특성)
        envelope = math.exp(-t * 1.5)
        sample *= envelope

        # 정규화 및 16-bit 변환
        sample = int(sample * 10000)
        samples.append(sample)

    return samples

def save_wav(filename, samples, sample_rate=44100):
    """WAV 파일로 저장"""
    with wave.open(str(filename), 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        for sample in samples:
            wav_file.writeframes(struct.pack('h', sample))

def main():
    output_dir = Path(__file__).parent.parent / 'assets' / 'sounds'
    output_dir.mkdir(parents=True, exist_ok=True)

    print("🎸 12음계 전체 음 생성 중...\n")
    print(f"총 {len(NOTES)}개 음 생성 예정\n")

    # 옥타브별로 그룹화하여 표시
    octaves = {}
    for note_name in NOTES.keys():
        octave = note_name[-1]
        if octave not in octaves:
            octaves[octave] = []
        octaves[octave].append(note_name)

    for octave in sorted(octaves.keys()):
        print(f"📍 옥타브 {octave}:")
        for note in octaves[octave]:
            freq = NOTES[note]
            print(f"  생성 중: {note:6s} ({freq:7.2f} Hz)", end='')

            # 오디오 생성
            samples = generate_note(freq)

            # WAV 저장
            wav_path = output_dir / f'{note}.wav'
            save_wav(wav_path, samples)
            print(f" ✓")

        print()  # 옥타브 구분 빈 줄

    print(f"✨ 완료! 총 {len(NOTES)}개 파일 생성")
    print(f"📂 위치: {output_dir}")

    # 파일 크기 확인
    total_size = sum(f.stat().st_size for f in output_dir.glob('*.wav'))
    print(f"💾 총 용량: {total_size / 1024 / 1024:.1f} MB")

    print("\n📝 생성된 음 목록:")
    print("   개방현: E2, A2, D3, G3, B3, E4")
    print("   반음계: 모든 C, C#, D, D#, E, F, F#, G, G#, A, A#, B")
    print("   옥타브: 2~5 (기타 전 음역)")

if __name__ == '__main__':
    main()
