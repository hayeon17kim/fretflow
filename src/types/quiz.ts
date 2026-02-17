import type { FretPosition, IntervalName, NoteName, ScaleName } from './music';

// Question types for each track
export interface NoteQuestion {
  type: 'note';
  position: FretPosition;
}

export interface IntervalQuestion {
  type: 'interval';
  from: FretPosition;
  intervalName: IntervalName;
}

export interface ScaleQuestion {
  type: 'scale';
  scaleName: ScaleName;
  positions: FretPosition[];
}

export interface EarQuestion {
  type: 'ear';
  audioUrl: string;
  correctNote: NoteName;
  options: NoteName[];
}

// Discriminated union
export type QuizQuestion = NoteQuestion | IntervalQuestion | ScaleQuestion | EarQuestion;

// Quiz state (used in all quiz screens)
export type QuizState = 'question' | 'correct' | 'wrong';
