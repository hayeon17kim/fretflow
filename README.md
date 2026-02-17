# 🎸 FretFlow

> Master the guitar fretboard with science-backed spaced repetition

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61dafb.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020.svg)](https://expo.dev/)

## What is FretFlow?

Learning guitar means memorizing hundreds of note positions across the fretboard. FretFlow makes this faster and more efficient using the **SM-2 spaced repetition algorithm** - the same technique used by Anki and Duolingo.

## Features

### 🎯 3 Parallel Learning Tracks
- **Note Position** - Find notes on the fretboard
- **Scales** - Master scale shapes
- **Ear Training** - Train your ear with audio
- **Mix Mode** - Practice all tracks in one session

### 🧠 Smart Review System
- SM-2 algorithm schedules reviews at optimal moments
- Cards you find easy appear less often, difficult ones more frequently
- Auto-adjusts based on response time
- Track progress and study streaks

### 📈 Tiered Progression System
- 4 difficulty tiers per track that unlock as you master cards
- **Note Position**: Basic (frets 0-5) → Extended (0-12) → Advanced (0-17) → Master (0-24)
- **Scales**: Gradual scale pattern unlocking
- **Ear Training**: Expanding note range as you improve

### 📱 Interactive Fretboard
- Touch-responsive fretboard for hands-on practice
- Visual feedback for correct/incorrect answers
- Multiple quiz formats: multiple choice, tap selection, multi-select

## Tech Stack

**Core**: Expo 54 + React Native 0.76 + TypeScript 5.9
**State**: Zustand + MMKV (30x faster than AsyncStorage)
**UI**: React Native SVG + Reanimated
**i18n**: i18next (Korean/English support)

## Quick Start

```bash
npm install
npm start

# Run on platform
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser
```

## Development

```bash
npm run lint          # Biome lint check
npm run lint:fix      # Auto-fix issues
npm run typecheck     # TypeScript check
npm run format        # Format code
```

## Project Structure

```
src/
├── app/              # Expo Router screens
│   ├── (tabs)/      # Home, Practice, Mastery, Settings
│   ├── quiz/        # Note, Scale, Ear, Mix quizzes
│   └── onboarding/  # 4-step onboarding flow
├── components/      # Reusable UI components
├── config/          # Tier configurations for each track
├── hooks/           # useSpacedRepetition (SM-2), useQuizSession
├── stores/          # Zustand global state
├── utils/           # SM-2, music theory, card generation
└── i18n/            # Internationalization (Korean/English)
```

## Documentation

- **[Development Guide](docs/DEVELOPMENT.md)** - Technical details, architecture, coding conventions
- **[Handoff Document](docs/handoff.md)** - Project overview for new developers (Korean)
- **[BM/PM Analysis](docs/FretFlow_BM_PM_Analysis.md)** - Business & product analysis

## Roadmap

### Completed (v1.0)
- [x] 3 parallel learning tracks (Note Position, Scales, Ear Training)
- [x] Mix mode (cross-track practice)
- [x] Tiered progression system (4 tiers per track)
- [x] SM-2 spaced repetition algorithm
- [x] Audio playback for ear training
- [x] Statistics and progress tracking
- [x] Mastery dashboard with track progress
- [x] Smart review recommendation system
- [x] 4-step onboarding flow
- [x] Daily goal and streak tracking
- [x] Push notifications
- [x] Achievement badges
- [x] Dev mode for tier testing

### Planned (Post-Launch)
- [ ] Analytics infrastructure
- [ ] Ear training expansion (chord recognition, rhythm training)
- [ ] Monetization (subscription model)
- [ ] Supabase backend integration
- [ ] Social features (leaderboards, sharing)

---

**Status**: MVP Complete
**Last Updated**: Feb 2026

For detailed information, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
