# 🎸 FretFlow

> Master the guitar fretboard faster with science-backed spaced repetition

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61dafb.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020.svg)](https://expo.dev/)

## What is FretFlow?

Learning guitar means memorizing hundreds of note positions across the fretboard. FretFlow makes this process faster and more efficient using the **SM-2 spaced repetition algorithm** - the same technique used by apps like Anki and Duolingo.

The app analyzes what you're struggling with and schedules reviews at the perfect moment, just before you forget.

## Features

### 🎯 4-Level Learning Path
Progress through increasingly complex concepts:
- **Level 1**: Find notes on the fretboard
- **Level 2**: Learn interval patterns
- **Level 3**: Master scale shapes
- **Level 4**: Train your ear

### 🧠 Smart Review System
- Cards you find easy appear less often
- Difficult cards come back more frequently
- Automatic difficulty adjustment based on your response time
- Track your daily progress and study streaks

### 📱 Interactive Fretboard
- Touch-responsive fretboard for hands-on practice
- Visual feedback for correct/incorrect answers
- Multiple quiz formats: multiple choice, tap selection, multi-select

## Tech Stack

Built with **React Native** + **TypeScript** + **Expo** for cross-platform mobile development.

**Key technologies:**
- Expo Router for navigation
- Zustand for state management
- MMKV for high-performance local storage (30x faster than AsyncStorage)
- React Native SVG for fretboard visualizations
- React Native Reanimated for smooth animations

**Planned:** Supabase backend for cloud sync and user accounts

## Quick Start

```bash
npm install
npm start

# Run on your platform
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser
```

## Project Structure

```
src/
├── app/
│   ├── (tabs)/          # Home, Practice, Mastery, Settings
│   └── quiz/            # Note, Interval, Scale, Ear quizzes
├── components/          # Reusable UI components
├── hooks/               # useSpacedRepetition (SM-2 implementation)
├── stores/              # Global state management
├── utils/
│   ├── sm2.ts          # Spaced repetition algorithm
│   ├── music.ts        # Music theory calculations
│   └── constants.ts    # Design tokens
└── i18n/               # Internationalization
```

## Development

```bash
npm run lint       # Check code style
npm run lint:fix   # Auto-fix issues
npm run typecheck  # Type checking
npm run format     # Format code
```

Code quality enforced with:
- **Biome** for fast linting and formatting
- **TypeScript** strict mode
- **Zod** for runtime validation

## Roadmap

- [ ] Audio playback for ear training
- [ ] Cloud sync with Supabase
- [ ] Achievement system
- [ ] Practice statistics and insights
- [ ] Daily review reminders

---

**Status**: Active development
**Last updated**: Feb 2026

For detailed architecture and development docs, see `handoff.md`
