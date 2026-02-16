#!/usr/bin/env python3
"""
간단한 기타 소리 생성 스크립트 (외부 라이브러리 불필요)
Python 기본 라이브러리만 사용
"""

import math
import wave
import struct
from pathlib import Path

# 기타 개방현 주파수 (Hz)
NOTES = {
    'E': 82.41,   # 6번줄 (낮은 E)
    'A': 110.00,  # 5번줄
    'D': 146.83,  # 4번줄
    'G': 196.00,  # 3번줄
    'B': 246.94,  # 2번줄
}

def generate_note(frequency, duration=2.5, sample_rate=44100):
    """
    기본 사인파로 음 생성

    Args:
        frequency: 주파수 (Hz)
        duration: 길이 (초)
        sample_rate: 샘플링 레이트

    Returns:
        list of samples
    """
    num_samples = int(duration * sample_rate)
    samples = []

    for i in range(num_samples):
        t = i / sample_rate

        # 기본음
        sample = math.sin(2 * math.pi * frequency * t)

        # 배음 추가 (기타 소리를 풍부하게)
        sample += 0.4 * math.sin(2 * math.pi * frequency * 2 * t)  # 2배음
        sample += 0.2 * math.sin(2 * math.pi * frequency * 3 * t)  # 3배음
        sample += 0.1 * math.sin(2 * math.pi * frequency * 4 * t)  # 4배음

        # 엔벨로프 (서서히 감소)
        envelope = math.exp(-t * 1.5)  # 지수 감쇠
        sample *= envelope

        # 정규화 및 16-bit 변환
        sample = int(sample * 10000)  # 볼륨 조절
        samples.append(sample)

    return samples

def save_wav(filename, samples, sample_rate=44100):
    """WAV 파일로 저장"""
    with wave.open(str(filename), 'w') as wav_file:
        # 설정: 1채널(모노), 2바이트(16-bit), 샘플레이트
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        # 샘플 쓰기
        for sample in samples:
            wav_file.writeframes(struct.pack('h', sample))

def wav_to_mp3(wav_path, mp3_path):
    """WAV를 MP3로 변환 (ffmpeg 사용)"""
    import subprocess
    try:
        result = subprocess.run([
            'ffmpeg', '-i', str(wav_path),
            '-acodec', 'libmp3lame',
            '-ab', '128k',
            '-ar', '44100',
            '-y',
            str(mp3_path)
        ], capture_output=True, text=True, timeout=10)

        if result.returncode == 0:
            return True
        else:
            print(f"⚠️  ffmpeg 오류: {result.stderr}")
            return False
    except FileNotFoundError:
        return False
    except Exception as e:
        print(f"⚠️  변환 오류: {e}")
        return False

def main():
    # 출력 디렉토리
    output_dir = Path(__file__).parent.parent / 'assets' / 'sounds'
    output_dir.mkdir(parents=True, exist_ok=True)

    print("🎸 기타 개방현 소리 생성 중...\n")

    has_ffmpeg = True
    mp3_files = []
    wav_files = []

    for note, freq in NOTES.items():
        print(f"생성 중: {note} ({freq:.2f} Hz)")

        # 오디오 생성
        samples = generate_note(freq)

        # WAV 저장
        wav_path = output_dir / f'{note}.wav'
        save_wav(wav_path, samples)
        print(f"  ✓ {note}.wav 생성")

        # MP3 변환 시도
        mp3_path = output_dir / f'{note}.mp3'
        if has_ffmpeg and wav_to_mp3(wav_path, mp3_path):
            print(f"  ✓ {note}.mp3 생성")
            wav_path.unlink()  # WAV 삭제
            mp3_files.append(mp3_path.name)
        else:
            if has_ffmpeg:
                print(f"  ⚠️  MP3 변환 실패, WAV 파일 유지")
                has_ffmpeg = False  # 더 이상 시도하지 않음
            wav_files.append(wav_path.name)

    print(f"\n✨ 완료! 파일 위치: {output_dir}\n")

    if mp3_files:
        print("생성된 MP3 파일:")
        for f in mp3_files:
            print(f"  - {f}")

    if wav_files:
        print("\n생성된 WAV 파일:")
        for f in wav_files:
            print(f"  - {f}")

        if not has_ffmpeg:
            print("\n⚠️  참고: ffmpeg가 없어서 MP3로 변환하지 못했습니다.")
            print("   WAV 파일도 React Native에서 사용 가능하지만,")
            print("   MP3가 파일 크기가 더 작습니다.")
            print("\n   MP3 변환을 원하시면:")
            print("   macOS: brew install ffmpeg")
            print("   그 후 이 스크립트를 다시 실행하세요.")

if __name__ == '__main__':
    main()
