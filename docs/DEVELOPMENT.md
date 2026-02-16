# FretFlow Development Guide

Last updated: **Feb 16, 2026**

This document provides technical details for developers working on FretFlow.

## Tech Stack

### Core
- **Runtime**: Expo 54.0.33
- **Framework**: React Native 0.76.6
- **Language**: TypeScript 5.9 (strict mode)
- **UI**: React Native StyleSheet

### Navigation & State
- **Routing**: Expo Router 6.0 (file-based)
- **Global State**: Zustand 5.0
- **Server State**: React Query 5.90
- **Local Storage**: MMKV (react-native-mmkv 3.3)

### Graphics & Animation
- **SVG**: react-native-svg 15.15
- **Animations**: react-native-reanimated 3.16

### Backend & i18n
- **Backend**: Supabase 2.95 (not integrated)
- **i18n**: i18next 25.8, react-i18next 16.5, expo-localization 17.0

### Dev Tools
- **Linting**: Biome 2.4
- **Validation**: Zod 4.3
- **Type Checking**: TypeScript strict mode

## Project Structure

```
src/
├── app/
│   ├── _layout.tsx              # Root layout (QueryClient, StatusBar)
│   ├── (tabs)/                  # Tab navigation
│   │   ├── _layout.tsx          # Tab bar layout
│   │   ├── index.tsx            # Home screen
│   │   ├── practice.tsx         # Practice screen
│   │   ├── mastery.tsx          # Mastery tab (TODO)
│   │   └── settings.tsx         # Settings tab (TODO)
│   └── quiz/                    # Quiz stack
│       ├── _layout.tsx          # Quiz stack layout
│       ├── note.tsx             # Lv.1 Note position quiz
│       ├── interval.tsx         # Lv.2 Interval quiz
│       ├── scale.tsx            # Lv.3 Scale quiz
│       └── ear.tsx              # Lv.4 Ear training
│
├── components/
│   ├── Fretboard.tsx            # Reusable fretboard (TODO)
│   ├── TabIcon.tsx              # Tab icons (TODO)
│   ├── quiz/
│   │   ├── QuizHeader.tsx       # Quiz header (back, badge, progress)
│   │   ├── AnswerGrid.tsx       # 4-choice grid
│   │   └── QuizCard.tsx         # Quiz card wrapper
│   ├── progress/
│   │   └── CircularProgress.tsx # Circular progress indicator
│   └── icons/                   # Icon components
│
├── config/
│   ├── routes.ts                # Route definitions
│   └── levels.ts                # Level configuration
│
├── hooks/
│   └── useSpacedRepetition.ts   # SM-2 card management
│
├── stores/
│   └── useAppStore.ts           # Global app state
│
├── types/
│   ├── music.ts                 # Music types (NoteName, FretPosition, etc.)
│   └── quiz.ts                  # Quiz types
│
├── utils/
│   ├── constants.ts             # Design tokens (colors, spacing, fonts)
│   ├── music.ts                 # Music calculations
│   ├── sm2.ts                   # SM-2 algorithm
│   ├── storage.ts               # MMKV adapter
│   └── cardGenerator.ts         # Dynamic card generation
│
├── i18n/
│   ├── index.ts                 # i18n setup
│   └── locales/
│       ├── en.json              # English translations
│       └── ko.json              # Korean translations
│
└── api/
    ├── query-client.ts          # React Query config
    └── supabase.ts              # Supabase client (not integrated)
```

## Design System

All design values are centralized in `src/utils/constants.ts`:

### Color Palette
```typescript
COLORS = {
  bg: '#0D0D0F',              // Background
  surface: '#1A1A1F',          // Cards, panels
  border: '#2A2A30',           // Borders
  textPrimary: '#FFFFFF',      // Primary text
  textSecondary: '#8E8E93',    // Secondary text

  // Level colors
  level1: '#4ADE80',           // Green (Note position)
  level2: '#A78BFA',           // Purple (Intervals)
  level3: '#60A5FA',           // Blue (Scales)
  level4: '#FB923C',           // Orange (Ear training)

  // State colors
  correct: '#4ADE80',
  wrong: '#F87171',
  selected: '#A78BFA',
}
```

### Spacing
```typescript
SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}
```

### Typography
```typescript
FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  title: 34,
}
```

### Fretboard Settings
- 6 strings, 24 frets
- Standard tuning: E-B-G-D-A-E (low to high)
- Inlay markers: 3, 5, 7, 9, 12, 15, 17, 19, 21, 24
- Double markers: 12, 24

## Architecture Decisions

### File-Based Routing
- Expo Router automatically generates routes from `src/app/`
- Tab navigation: `(tabs)` group maintains simultaneous stacks
- Quiz routes: `/quiz/note`, `/quiz/interval`, `/quiz/scale`, `/quiz/ear`

### State Management
**Zustand (useAppStore):**
- Active level
- Today's stats (cards reviewed, correct count, streak)
- Onboarding state

**React Query:**
- Planned for Supabase integration
- Currently unused

**MMKV Local Storage:**
- All flashcard data stored by ID
- Falls back to in-memory storage in dev/web environments

### Spaced Repetition System

**SM-2 Algorithm (`sm2.ts`):**
- Quality 0-5 based on response time
- Quality < 3: Reset (repetitions=0)
- Quality ≥ 3: Progressive intervals (1 → 6 → interval*EF)

**Card Hook (`useSpacedRepetition.ts`):**
- `getDueCards()`: Filter cards due today
- `addCard()`: Create new card (defaults: EF=2.5, interval=1, nextReviewDate=today)
- `recordReview()`: Record review result with response time

**Default Values:**
- Initial EF: 2.5
- Minimum EF: 1.3
- Initial interval: 1 day

### Card Generation

**Dynamic Card Generation (`cardGenerator.ts`):**
Replaces MOCK_QUESTIONS with real-time card generation:

```typescript
generateNoteCard()      // Lv.1: Random fret position + 4 choices
generateIntervalCard()  // Lv.2: Root position + interval pattern
generateScaleCard()     // Lv.3: Scale pattern + positions
generateEarCard()       // Lv.4: Audio note (open strings)
```

## Development Workflow

### Setup
```bash
npm install
npm start
```

### Quality Checks
```bash
npm run lint          # Biome linting
npm run lint:fix      # Auto-fix
npm run format        # Code formatting
npm run typecheck     # TypeScript check
```

### Linting Rules
- **Tool**: Biome 2.4 (replaces ESLint + Prettier)
- **Line width**: 100 characters
- **Tab width**: 2 spaces
- **Imports**: Auto-sorted
- **Semicolons**: Required
- **Trailing commas**: Yes

## Coding Conventions

### UI Language
- **User-facing text**: Korean
- **Code**: English (variables, functions, comments)

### Design Tokens
- **Always use constants**: Reference `COLORS`, `SPACING`, `FONT_SIZE`
- **No hardcoded values**: Ensures consistency

### StyleSheet Pattern
```typescript
const s = StyleSheet.create({
  // All styles defined here at bottom of file
});
```

### Component Pattern
```typescript
export default function QuizScreen() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [state, setState] = useState<QuizState>('question');

  // Component logic

  return (
    <View style={s.container}>
      {/* JSX */}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
```

## Feature Status

### ✅ Completed

**Screens:**
- Home (`index.tsx`) - Review cards, streak, level progress
- Practice (`practice.tsx`) - Level cards, session options
- Quiz screens - All 4 levels functional

**Core Features:**
- SM-2 spaced repetition system
- Card generation (dynamic, no more MOCK_QUESTIONS)
- Progress tracking
- i18n support (Korean/English)

**Components:**
- QuizHeader, AnswerGrid, QuizCard
- CircularProgress
- Icon components

### 🚧 TODO

**Features:**
- [ ] Supabase backend integration
  - User authentication
  - Card sync
  - Stats backup
- [ ] Daily review notifications (push notifications)
- [ ] Achievement system (badges, milestones)
- [ ] Mix mode implementation (currently redirects to note quiz only)

**Components:**
- [ ] Reusable Fretboard component (reduce duplication across quiz screens)

### ✅ Recently Completed

**Screens:**
- [x] Mastery tab - Statistics, weak cards, level progress
- [x] Settings tab - Profile, learning goals, accessibility, language

**Features:**
- [x] Audio playback (43 sound files in `assets/sounds/`)
- [x] Level unlock system (Lv.2+ requires 80% on previous level)
- [x] Statistics & analytics (mastery screen)

**Components:**
- [x] TabIcon components

## Key Files Reference

| File | Responsibility |
|------|---------------|
| `app/_layout.tsx` | QueryClient init, status bar |
| `app/(tabs)/_layout.tsx` | Tab navigation structure |
| `app/(tabs)/index.tsx` | Home screen |
| `app/(tabs)/practice.tsx` | Practice screen |
| `app/quiz/*.tsx` | Quiz screens (4 levels) |
| `hooks/useSpacedRepetition.ts` | SM-2 card CRUD & review logic |
| `stores/useAppStore.ts` | Global state (level, stats) |
| `utils/constants.ts` | All design tokens |
| `utils/music.ts` | Music calculations (MIDI, positions, intervals) |
| `utils/sm2.ts` | SM-2 algorithm implementation |
| `utils/storage.ts` | MMKV adapter |
| `utils/cardGenerator.ts` | Dynamic card generation |
| `types/music.ts` | Type definitions |
| `components/quiz/*.tsx` | Reusable quiz components |
| `i18n/` | Internationalization setup |

## Common Tasks

### Adding a New Quiz Type
1. Create type in `types/quiz.ts`
2. Add generator function in `utils/cardGenerator.ts`
3. Create screen in `app/quiz/[name].tsx`
4. Update `config/levels.ts` if needed

### Adding a New Design Token
1. Add to `utils/constants.ts`
2. Use throughout codebase
3. Never hardcode values

### Adding Translations
1. Add keys to `i18n/locales/en.json` and `ko.json`
2. Use `useTranslation()` hook in components

### Modifying SM-2 Behavior
1. Edit algorithm in `utils/sm2.ts`
2. Adjust mapping in `hooks/useSpacedRepetition.ts`
3. Update default values in constants

## Troubleshooting

### MMKV not loading
Check `utils/storage.ts` - should fall back to in-memory storage automatically.

### Navigation issues
Ensure file structure in `app/` matches route expectations. Use `expo-router` CLI for debugging.

### Type errors
Run `npm run typecheck` to see all errors. Biome linting doesn't catch all TS issues.

### i18n not working
Check that `i18n/index.ts` is initialized in `app/_layout.tsx`.

## Resources

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Query Docs](https://tanstack.com/query/latest)
- [Biome Docs](https://biomejs.dev/)
- [SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)

---

For user-facing documentation, see `README.md`
