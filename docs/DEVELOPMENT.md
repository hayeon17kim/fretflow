# FretFlow Development Guide

Last updated: **Feb 17, 2026**

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
│   │   ├── mastery.tsx          # Mastery tab ✅
│   │   └── settings.tsx         # Settings tab ✅
│   ├── onboarding/              # Onboarding flow ✅
│   │   ├── _layout.tsx          # Onboarding stack layout
│   │   ├── index.tsx            # Welcome screen
│   │   ├── mini-quiz.tsx        # Skill assessment
│   │   ├── result.tsx           # Assessment results
│   │   └── goal.tsx             # Daily goal setting
│   └── quiz/                    # Quiz stack
│       ├── _layout.tsx          # Quiz stack layout
│       ├── note.tsx             # Track 1: Note Position
│       ├── scale.tsx            # Track 2: Scales
│       ├── ear.tsx              # Track 3: Ear Training
│       ├── mix.tsx              # Mix mode (all tracks) ✅
│       └── completion.tsx       # Quiz completion screen
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
│   ├── tracks.ts                # Track configuration
│   ├── notePositionTiers.ts     # Note position difficulty tiers
│   ├── scaleTiers.ts            # Scale difficulty tiers
│   └── earTrainingTiers.ts      # Ear training difficulty tiers
│
├── hooks/
│   ├── useSpacedRepetition.ts   # SM-2 card management
│   ├── useQuizSession.ts        # Quiz session state management
│   ├── useEarTrainingAudio.ts   # Audio playback for ear training
│   ├── useGoalAchievement.ts    # Daily goal tracking
│   └── useNotifications.ts      # Push notification handling
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
│   ├── cardGenerator.ts         # Dynamic card generation with tier support
│   ├── quizHelpers.ts           # Quiz utility functions
│   ├── devTools.ts              # Dev mode utilities (tier testing)
│   └── earTrainingSounds.ts     # Audio file management
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

  // Track colors
  track1: '#4ADE80',           // Green (Note position track)
  track2: '#60A5FA',           // Blue (Scales track)
  track3: '#FB923C',           // Orange (Ear training track)
  track4: '#A78BFA',           // Purple (Reserved)

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
- Quiz routes: `/quiz/note`, `/quiz/scale`, `/quiz/ear`, `/quiz/mix`
- Onboarding routes: `/onboarding`, `/onboarding/mini-quiz`, `/onboarding/result`, `/onboarding/goal`

### State Management
**Zustand (useAppStore):**
- Active track
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

### Card Generation & Tiered Progression

**Dynamic Card Generation (`cardGenerator.ts`):**
Replaces MOCK_QUESTIONS with real-time card generation with progressive difficulty:

```typescript
generateNoteCard(masteredCount)      // Note Position: Tiered fret range
generateScaleCard(masteredCount)     // Scales: Progressive scale patterns
generateEarCard(masteredCount)       // Ear Training: Expanding note range
```

**Tiered Difficulty System:**
Each track has 4 tiers that unlock based on mastered card count:

**Note Position Tiers** (`notePositionTiers.ts`):
- Tier 1 (0 mastered): Frets 0-5 (open position)
- Tier 2 (5 mastered): Frets 0-12 (first position to octave)
- Tier 3 (15 mastered): Frets 0-17 (high positions)
- Tier 4 (30 mastered): Frets 0-24 (full fretboard)

**Scale Tiers** (`scaleTiers.ts`):
- Tier 1: Major, Minor Pentatonic
- Tier 2: Natural Minor, Blues
- Tier 3: Dorian, Mixolydian
- Tier 4: Phrygian, Lydian, Harmonic Minor

**Ear Training Tiers** (`earTrainingTiers.ts`):
- Progressive expansion of note range as user masters cards

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
- Home (`index.tsx`) - Daily review cards, streak tracking, track progress
- Practice (`practice.tsx`) - 3 track cards + Mix mode, 3 session sizes (10/25/50)
- Mastery (`mastery.tsx`) - Track progress dashboard with circular progress
- Settings (`settings.tsx`) - Language, goals, notifications, dev mode
- Onboarding flow - 4 steps (welcome, mini-quiz, results, goal setting)
- Quiz screens - Note, Scale, Ear, Mix, Completion

**Core Features:**
- SM-2 spaced repetition system with quality-based scheduling
- Tiered progression system (4 tiers per track)
- Dynamic card generation with progressive difficulty
- Mix mode (cross-track practice with smart shuffling)
- Progress tracking and statistics
- Daily goal achievement system with toast notifications
- Streak tracking with badge system
- Smart review recommendations
- Push notifications for daily reminders
- i18n support (Korean/English)
- Dev mode for tier testing

**Components:**
- QuizHeader, AnswerGrid, QuizCard
- CircularProgress
- Icon components

### 🚧 Planned (Post-Launch)

**P2 Features:**
- [ ] Analytics infrastructure (Mixpanel/Amplitude)
- [ ] Ear training expansion (chords, rhythm patterns)
- [ ] Monetization (RevenueCat subscription)
- [ ] Supabase backend integration
  - User authentication
  - Card sync
  - Stats backup

**Technical Improvements:**
- [ ] Reusable Fretboard component (reduce duplication across quiz screens)
- [ ] Quiz exit confirmation modal
- [ ] Global error boundary
- [ ] Unit tests (SM-2, card generation, progress calculation)
- [ ] Quiz answer haptic feedback

### ✅ Recently Completed (v1.0)

**Screens:**
- [x] Mastery tab - Statistics, weak cards, track progress
- [x] Settings tab - Profile, learning goals, accessibility, language
- [x] Onboarding flow - 4-step onboarding

**Features:**
- [x] Audio playback (37 sound files in `assets/sounds/`)
- [x] 5-tier ear training progression system
- [x] Smart review recommendation system
- [x] Daily goal and streak tracking
- [x] Push notifications
- [x] Achievement badges (5 tiers)
- [x] Session size options (Quick/Focus/Deep)
- [x] Parallel progression (all tracks unlocked)

**Components:**
- [x] TabIcon components
- [x] DailyReviewCard with progress visualization
- [x] CircularProgress (shared across screens)

## Key Files Reference

| File | Responsibility |
|------|---------------|
| `app/_layout.tsx` | QueryClient init, status bar |
| `app/(tabs)/_layout.tsx` | Tab navigation structure |
| `app/(tabs)/index.tsx` | Home screen |
| `app/(tabs)/practice.tsx` | Practice screen |
| `app/quiz/*.tsx` | Quiz screens (3 tracks + mix) |
| `hooks/useSpacedRepetition.ts` | SM-2 card CRUD & review logic |
| `stores/useAppStore.ts` | Global state (track, stats) |
| `utils/constants.ts` | All design tokens |
| `utils/music.ts` | Music calculations (MIDI, positions) |
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
4. Update `config/tracks.ts` if needed

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
