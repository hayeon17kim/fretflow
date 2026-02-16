# 🎸 FretFlow

> Master the guitar fretboard with science-backed spaced repetition learning

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61dafb.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020.svg)](https://expo.dev/)

## 💡 Overview

Learning guitar is challenging - memorizing hundreds of note positions across the fretboard can be overwhelming. **FretFlow** solves this with the **SM-2 Spaced Repetition Algorithm**, scientifically proven to optimize memory retention.

- 📊 **Personalized Learning**: Analyzes your memory patterns to schedule optimal review timing
- 🎯 **4-Level Progression**: Note Position → Intervals → Scales → Ear Training
- 📱 **Native Experience**: Smooth interactions powered by React Native
- 🎨 **Interactive Fretboard**: Real-time SVG-based visualizations

## ✨ Features

### 🎯 Progressive 4-Level System
Each level builds naturally on the previous one:
- **Lv.1 Note Position**: Mini fretboard + multiple-choice quiz
- **Lv.2 Intervals**: Tappable fretboard for pattern recognition
- **Lv.3 Scales**: Multi-select fretboard to build complete scales
- **Lv.4 Ear Training**: Audio playback with pitch identification

### 🧠 Intelligent Review System
SM-2 algorithm tracks difficulty for each card to beat the forgetting curve:
- Easy cards appear less frequently, difficult ones more often
- Auto-adjusts difficulty based on response time
- High-performance MMKV local storage

### 📈 Progress Visualization
- Daily review count with estimated study time
- Mastery progress by level
- Study streak tracking

## 🛠 Tech Stack

| Category | Technologies |
|---------|-------------|
| **Frontend** | React Native 0.76.6, TypeScript 5.9, Expo 54 |
| **Navigation** | Expo Router 6.0 (file-based routing) |
| **State Management** | Zustand 5.0 (global), React Query 5.90 (server) |
| **Storage** | MMKV (high-performance local storage) |
| **Graphics** | React Native SVG, Reanimated 3.16 |
| **Backend** | Supabase (planned) |
| **i18n** | i18next, react-i18next |
| **Dev Tools** | Biome 2.4, Zod 4.3 |

## 🏗 Technical Highlights

### 1. SM-2 Algorithm Implementation
Scientifically validated spaced repetition algorithm implemented in TypeScript for maximum learning efficiency:
```typescript
// Auto-adjusts difficulty based on response time
const quality = responseTimeMs < 3000 ? 5 : responseTimeMs < 5000 ? 4 : 3;
const updated = calculateSM2(card, quality);
```

### 2. File-Based Routing Architecture
Leveraging Expo Router's file-system navigation for scalable structure:
- Tab navigation: `(tabs)` group
- Nested stacks: `quiz/` directory

### 3. High-Performance Local Storage
Native performance data persistence with MMKV (**30x faster** than AsyncStorage)

### 4. Design System
Centralized design tokens for consistent UI/UX (`constants.ts`):
- Level-based color coding
- Responsive spacing system
- Typography scale

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS / Android / Web
npm run ios | android | web
```

### Development Commands
```bash
npm run lint          # Biome lint check
npm run lint:fix      # Auto-fix issues
npm run format        # Format code
npm run typecheck     # TypeScript type checking
```

## 📁 Project Structure

```
src/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation (Home, Practice, etc.)
│   └── quiz/                # Quiz screens (Note, Interval, Scale, Ear)
├── components/              # Reusable components
│   └── quiz/                # Quiz-specific components
├── hooks/                   # Custom hooks
│   └── useSpacedRepetition.ts    # SM-2 card management
├── stores/                  # Zustand stores
├── types/                   # TypeScript definitions
├── utils/                   # Utilities
│   ├── constants.ts         # Design tokens
│   ├── music.ts             # Music theory calculations
│   ├── sm2.ts               # SM-2 algorithm
│   └── storage.ts           # MMKV adapter
└── i18n/                    # Internationalization
```

## 🎨 Design Philosophy

- **Design Tokens First**: All colors, spacing, and typography sourced from centralized constants
- **TypeScript Strict Mode**: Type safety throughout
- **Component Composition**: Reusable, testable components
- **Performance**: Native animations with Reanimated, MMKV for storage

## 🚧 Roadmap

- [ ] Audio playback (expo-av integration)
- [ ] Supabase backend integration
- [ ] Level unlock system
- [ ] Mastery dashboard with analytics
- [ ] Daily review notifications
- [ ] Settings & customization

## 📝 Development Guidelines

- **UI Language**: Korean for user-facing text, English for code
- **Linting**: Biome enforces consistent code style (100 char line width, 2-space tabs)
- **Commit Style**: Conventional commits preferred

## 📄 License

Personal project.

---

**Last Updated**: Feb 2026
**Detailed Docs**: See `handoff.md` for architecture details
