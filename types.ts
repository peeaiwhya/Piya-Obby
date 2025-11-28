export enum BlockType {
  PLATFORM = 'platform',
  LAVA = 'lava',
  CHECKPOINT = 'checkpoint',
  FINISH = 'finish'
}

export interface LevelBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  type: BlockType;
  color?: string;
}

export interface GameConfig {
  gravity: number;
  speed: number;
  jumpForce: number;
}

export interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  hasWon: boolean;
  score: number;
  deaths: number;
}

// AI Service Types
export interface GenerateLevelParams {
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
