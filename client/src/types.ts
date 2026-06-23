export interface Player {
  id: string;
  username: string;
  progress: number;
  wpm: number;
  finished: boolean;
  finishTime: number | null;
}

export interface Players {
  [id: string]: Player;
}

export type Language = 'en' | 'uz' | 'ru' | 'de' | 'fr';

export type GameMode = 'solo' | 'multiplayer';
