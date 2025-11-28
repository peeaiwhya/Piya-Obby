import React, { useRef, useEffect, useCallback } from 'react';
import { LevelBlock, BlockType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE, GAME_PHYSICS } from '../constants';

interface GameCanvasProps {
  levelData: LevelBlock[];
  backgroundColor: string;
  onDeath: () => void;
  onWin: () => void;
  resetTrigger: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  levelData, 
  backgroundColor, 
  onDeath, 
  onWin,
  resetTrigger 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State Refs
  const player = useRef({
    x: 50,
    y: 400,
    vx: 0,
    vy: 0,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    isGrounded: false,
    color: '#06b6d4', // Updated to Cyan
    spawnX: 50,
    spawnY: 400
  });

  const keys = useRef<{ [key: string]: boolean }>({});
  const camera = useRef({ x: 0 });
  const gameState = useRef<'playing' | 'won' | 'dead'>('playing');
  const animationFrameId = useRef<number>(0);

  // Initialize inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Full Reset Logic (New Level)
  useEffect(() => {
    // When level changes, reset everything including spawn point
    player.current.spawnX = 50;
    player.current.spawnY = 400;
    respawnPlayer();
    gameState.current = 'playing';
    camera.current.x = 0;
  }, [resetTrigger, levelData]);

  const respawnPlayer = () => {
    player.current.x = player.current.spawnX;
    player.current.y = player.current.spawnY;
    player.current.vx = 0;
    player.current.vy = 0;
    gameState.current = 'playing';
    
    // Snap camera to spawn
    const targetCamX = player.current.x - CANVAS_WIDTH / 3;
    camera.current.x = Math.max(0, targetCamX);
  };

  const checkCollision = (rect1: any, rect2: any) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameState.current === 'playing') {
      const p = player.current;

      // 1. Horizontal Movement
      if (keys.current['ArrowRight'] || keys.current['KeyD']) {
        p.vx += 0.5;
      } else if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
        p.vx -= 0.5;
      } else {
        p.vx *= GAME_PHYSICS.friction;
      }

      // Cap speed
      p.vx = Math.max(Math.min(p.vx, GAME_PHYSICS.moveSpeed), -GAME_PHYSICS.moveSpeed);
      p.x += p.vx;

      // Horizontal Collisions
      for (const block of levelData) {
        if (checkCollision(p, block)) {
            if (block.type === BlockType.LAVA) {
                handleDeath();
            } else if (block.type === BlockType.FINISH) {
                handleWin();
            } else if (block.type === BlockType.CHECKPOINT) {
                p.spawnX = block.x;
                p.spawnY = block.y - p.height - 10;
            } else {
                // Solid block logic
                if (p.vx > 0) { // Moving right
                    p.x = block.x - p.width;
                } else if (p.vx < 0) { // Moving left
                    p.x = block.x + block.width;
                }
                p.vx = 0;
            }
        }
      }

      // 2. Vertical Movement
      p.vy += GAME_PHYSICS.gravity;
      p.y += p.vy;

      // Vertical Collisions
      p.isGrounded = false;
      
      // World Floor (Death)
      if (p.y > CANVAS_HEIGHT + 200) {
        handleDeath();
      }

      for (const block of levelData) {
        if (checkCollision(p, block)) {
            if (block.type === BlockType.LAVA) {
                handleDeath();
            } else if (block.type === BlockType.FINISH) {
                handleWin();
            } else if (block.type === BlockType.CHECKPOINT) {
                p.spawnX = block.x;
                p.spawnY = block.y - p.height - 10;
            } else {
                // Solid block logic
                if (p.vy > 0) { // Falling
                    p.y = block.y - p.height;
                    p.isGrounded = true;
                    p.vy = 0;
                } else if (p.vy < 0) { // Jumping up (hitting head)
                    p.y = block.y + block.height;
                    p.vy = 0;
                }
            }
        }
      }

      // Jump
      if ((keys.current['Space'] || keys.current['ArrowUp'] || keys.current['KeyW']) && p.isGrounded) {
        p.vy = GAME_PHYSICS.jumpPower;
        p.isGrounded = false;
      }

      // Camera Follow
      const targetCamX = p.x - CANVAS_WIDTH / 3;
      camera.current.x += (targetCamX - camera.current.x) * 0.1;
      camera.current.x = Math.max(0, camera.current.x);
    }

    // --- Rendering ---
    
    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.translate(-Math.floor(camera.current.x), 0);

    // Draw Blocks
    levelData.forEach(block => {
      ctx.fillStyle = block.color || '#666';
      
      if (block.type === BlockType.LAVA) {
        // Glowing Lava Effect
        const time = Date.now() * 0.005;
        const glow = Math.sin(time) * 0.2 + 0.8;
        ctx.fillStyle = block.color || '#ef4444';
        ctx.globalAlpha = glow;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        ctx.globalAlpha = 1.0;
      } else if (block.type === BlockType.CHECKPOINT) {
        // Draw Checkpoint Flag
        ctx.fillStyle = '#64748b'; // Pole
        ctx.fillRect(block.x + 5, block.y - 40, 4, 40);
        ctx.fillStyle = player.current.spawnX === block.x ? '#22c55e' : '#cbd5e1'; // Flag color changes if active
        ctx.beginPath();
        ctx.moveTo(block.x + 9, block.y - 40);
        ctx.lineTo(block.x + 35, block.y - 30);
        ctx.lineTo(block.x + 9, block.y - 20);
        ctx.fill();
        
        // Base
        ctx.fillStyle = block.color || '#334155';
        ctx.fillRect(block.x, block.y, block.width, block.height);
      } else {
        // Standard Block with Rounded Look
        ctx.fillRect(block.x, block.y, block.width, block.height);
        
        // Highlight (Snow/Grass top)
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(block.x, block.y, block.width, 6);
      }

      // Finish Text
      if (block.type === BlockType.FINISH) {
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px "Fredoka", sans-serif';
        ctx.fillText('FINISH', block.x + block.width/2 - 35, block.y - 15);
        
        // Finish Particles/Glow
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.strokeRect(block.x - 4, block.y - 4, block.width + 8, block.height + 8);
      }
    });

    // Draw Player
    const p = player.current;
    if (gameState.current !== 'dead') {
      ctx.fillStyle = p.color;
      // Simple bounce animation when moving
      const bounce = p.isGrounded && Math.abs(p.vx) > 0.1 ? Math.sin(Date.now() * 0.02) * 2 : 0;
      
      // Rounded Rect for player (Cutish look)
      // ctx.fillRect(p.x, p.y - bounce, p.width, p.height + bounce);
      
      // Draw rounded player manually
      const radius = 8;
      const x = p.x;
      const y = p.y - bounce;
      const w = p.width;
      const h = p.height + bounce;
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Face
      ctx.fillStyle = 'white';
      const lookDir = p.vx >= 0 ? 1 : -1;
      
      // Eyes (Bigger cute eyes)
      ctx.beginPath();
      ctx.arc(p.x + (lookDir === 1 ? 20 : 8), p.y + 10 - bounce, 5, 0, Math.PI * 2);
      ctx.arc(p.x + (lookDir === 1 ? 8 : 20), p.y + 10 - bounce, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Pupils
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(p.x + (lookDir === 1 ? 22 : 6), p.y + 10 - bounce, 2, 0, Math.PI * 2);
      ctx.arc(p.x + (lookDir === 1 ? 10 : 18), p.y + 10 - bounce, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // UI Overlays (Light Theme)
    if (gameState.current === 'dead') {
      drawOverlay(ctx, 'OOPS!', '#f43f5e', 'Press R to Retry');
    } else if (gameState.current === 'won') {
      drawOverlay(ctx, 'YAY!', '#8b5cf6', 'Press R to Play Again');
    }

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [levelData, backgroundColor, onDeath, onWin]);

  const drawOverlay = (ctx: CanvasRenderingContext2D, title: string, color: string, sub: string) => {
      // Light glass overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      
      ctx.fillStyle = color;
      ctx.font = '900 80px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      ctx.restore();
      
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 24px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sub, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  };

  const handleDeath = () => {
    if (gameState.current === 'playing') {
      gameState.current = 'dead';
      onDeath();
    }
  };

  const handleWin = () => {
    if (gameState.current === 'playing') {
      gameState.current = 'won';
      onWin();
    }
  };

  // Global Key Listener for Quick Restart
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        if (gameState.current === 'dead') {
            respawnPlayer();
        } else if (gameState.current === 'won') {
            // Full reset on win
            player.current.spawnX = 50;
            player.current.spawnY = 400;
            respawnPlayer();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [gameLoop]);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-200 border-[6px] border-white bg-slate-100 group">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="block cursor-crosshair"
      />
    </div>
  );
};