#!/usr/bin/env python3
"""
기타 개방현 소리 생성 스크립트
필요: pip install numpy scipy
"""

import numpy as np
from scipy.io import wavfile
from pathlib import Path

# 기타 개방현 주파수 (Hz)
NOTES = {
    'E': 82.41,   # 6번줄 (낮은 E) - 실제로는 이게 더 자연스러움
    'A': 110.00,  # 5번줄
    'D': 146.83,  # 4번줄
    'G': 196.00,  # 3번줄
    'B': 246.94,  # 2번줄
    # 'E_high': 329.63,  # 1번줄 (높은 E) - 퀴즈에서는 낮은 E 사용
}

def generate_guitar_note(frequency, duration=2.5, sample_rate=44100):
    """
    기타 소리를 시뮬레이션하여 생성

    Args:
        frequency: 기본 주파수 (Hz)
        duration: 길이 (초)
        sample_rate: 샘플링 레이트 (Hz)

    Returns:
        numpy array (오디오 데이터)
    """
    t = np.linspace(0, duration, int(sample_rate * duration))

    # 기본음 (fundamental)
    signal = np.sin(2 * np.pi * frequency * t)

    # 배음 추가 (harmonics) - 기타 소리를 더 풍부하게
    signal += 0.4 * np.sin(2 * np.pi * frequency * 2 * t)  # 2배음
    signal += 0.2 * np.sin(2 * np.pi * frequency * 3 * t)  # 3배음
    signal += 0.1 * np.sin(2 * np.pi * frequency * 4 * t)  # 4배음
    signal += 0.05 * np.sin(2 * np.pi * frequency * 5 * t) # 5배음

    # ADSR 엔벨로프 (Attack, Decay, Sustain, Release)
    # 기타는 빠른 어택, 서서히 감소
    attack_time = 0.01  # 10ms
    decay_time = 0.1    # 100ms
    sustain_level = 0.6
    release_time = 0.5  # 500ms

    attack_samples = int(attack_time * sample_rate)
    decay_samples = int(decay_time * sample_rate)
    release_samples = int(release_time * sample_rate)
    sustain_samples = len(t) - attack_samples - decay_samples - release_samples

    envelope = np.concatenate([
        np.linspace(0, 1, attack_samples),  # Attack
        np.linspace(1, sustain_level, decay_samples),  # Decay
        np.ones(sustain_samples) * sustain_level,  # Sustain
        np.linspace(sustain_level, 0, release_samples)  # Release
    ])

    # 엔벨로프 적용
    signal = signal * envelope

    # 정규화 (-1 ~ 1 범위)
    signal = signal / np.max(np.abs(signal))

    # 16-bit PCM으로 변환
    signal = (signal * 32767).astype(np.int16)

    return signal

def wav_to_mp3(wav_path, mp3_path):
    """WAV를 MP3로 변환 (ffmpeg 필요)"""
    import subprocess
    try:
        subprocess.run([
            'ffmpeg', '-i', str(wav_path),
            '-acodec', 'libmp3lame',
            '-ab', '128k',
            '-y',  # 덮어쓰기
            str(mp3_path)
        ], check=True, capture_output=True)
        print(f"✅ {mp3_path.name} 생성 완료")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ MP3 변환 실패: {e}")
        return False
    except FileNotFoundError:
        print("❌ ffmpeg가 설치되어 있지 않습니다.")
        print("   macOS: brew install ffmpeg")
        print("   Ubuntu: sudo apt install ffmpeg")
        return False

def main():
    # 출력 디렉토리
    output_dir = Path(__file__).parent.parent / 'assets' / 'sounds'
    output_dir.mkdir(parents=True, exist_ok=True)

    print("🎸 기타 개방현 소리 생성 중...\n")

    for note, freq in NOTES.items():
        print(f"생성 중: {note} ({freq:.2f} Hz)")

        # WAV 생성
        audio = generate_guitar_note(freq)
        wav_path = output_dir / f'{note}.wav'
        wavfile.write(wav_path, 44100, audio)

        # MP3로 변환
        mp3_path = output_dir / f'{note}.mp3'
        if wav_to_mp3(wav_path, mp3_path):
            # WAV 파일 삭제 (MP3만 유지)
            wav_path.unlink()
        else:
            print(f"⚠️  {note}.wav 파일은 유지됩니다 (MP3 변환 실패)")

    print(f"\n✨ 완료! 파일 위치: {output_dir}")
    print("\n생성된 파일:")
    for file in sorted(output_dir.glob('*.mp3')):
        print(f"  - {file.name}")
    for file in sorted(output_dir.glob('*.wav')):
        print(f"  - {file.name} (WAV)")

if __name__ == '__main__':
    main()
