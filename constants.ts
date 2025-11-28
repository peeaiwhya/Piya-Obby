import { BlockType } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER_SIZE = 30;
export const PLAYER_COLOR = '#06b6d4'; // Cyan 500

export const DEFAULT_THEME = "A candy land obstacle course with chocolate rivers and cookie platforms.";

export const GAME_PHYSICS = {
  gravity: 0.6,
  friction: 0.8,
  moveSpeed: 5,
  jumpPower: -12,
};

export const SAMPLE_LEVEL = [
  { x: 0, y: 550, width: 200, height: 50, type: BlockType.PLATFORM, color: '#86efac' },
  { x: 250, y: 450, width: 100, height: 20, type: BlockType.PLATFORM, color: '#fca5a5' },
  { x: 400, y: 550, width: 300, height: 50, type: BlockType.LAVA, color: '#fda4af' },
  { x: 450, y: 350, width: 80, height: 20, type: BlockType.PLATFORM, color: '#fcd34d' },
  { x: 600, y: 250, width: 80, height: 20, type: BlockType.PLATFORM, color: '#93c5fd' },
  { x: 750, y: 550, width: 100, height: 50, type: BlockType.FINISH, color: '#fbbf24' },
];