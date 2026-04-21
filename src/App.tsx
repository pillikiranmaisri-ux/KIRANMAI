/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Volume2, Trophy, Activity, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- TYPES ---
type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

// --- CONSTANTS ---
const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION: Direction = 'UP';
const GAME_SPEED = 150;

const TRACKS: Track[] = [
  {
    id: '1',
    title: 'NEURAL_OSCILLATION_01',
    artist: 'CYBER_GEN_AI',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'SYNTHETIC_DREAM_X',
    artist: 'MAGENTA_PULSE',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    id: '3',
    title: 'VOID_PROTO_V3',
    artist: 'BIT_GHXST',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
  },
];

// --- APP COMPONENT ---
export default function App() {
  // Game State
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  
  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- GAME LOGIC ---
  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Check if food spawned on snake
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collision with walls
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food consumption
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
        case ' ': setIsPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  // --- MUSIC LOGIC ---
  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const toggleMusic = () => setIsPlaying(!isPlaying);
  
  const skipTrack = (dir: 'next' | 'prev') => {
    if (dir === 'next') {
      setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    }
    setIsPlaying(true);
  };

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <div className="scanline" />
      <div className="crt-overlay" />

      {/* HEADER */}
      <header className="mb-8 text-center z-10">
        <h1 
          className="text-6xl font-display glitch-text mb-2 tracking-widest text-neon-cyan uppercase"
          data-text="NEON_RECURSION"
        >
          NEON_RECURSION
        </h1>
        <p className="text-neon-magenta font-mono text-sm opacity-80 flex items-center justify-center gap-2">
          <Terminal size={14} /> SYS_VER: 0.9.8_BETA // STATUS: ONLINE
        </p>
      </header>

      {/* MAIN GAME WINDOW */}
      <main className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl w-full">
        
        {/* LEFT PANEL: STATS */}
        <div className="w-full lg:w-48 space-y-4 font-mono">
          <div className="border border-neon-cyan/30 bg-black/60 p-4 backdrop-blur-sm">
            <h2 className="text-xs text-neon-cyan/60 uppercase mb-2 flex items-center gap-2">
              <Trophy size={14} /> Records
            </h2>
            <div className="space-y-1">
              <div className="flex justify-between text-lg">
                <span className="text-neon-cyan/40">HI_SCORE:</span>
                <span className="text-neon-cyan">{highScore}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-neon-magenta/40">CURRENT:</span>
                <span className="text-neon-magenta">{score}</span>
              </div>
            </div>
          </div>

          <div className="border border-neon-magenta/30 bg-black/60 p-4 backdrop-blur-sm">
            <h2 className="text-xs text-neon-magenta/60 uppercase mb-2 flex items-center gap-2">
              <Activity size={14} /> System_Log
            </h2>
            <div className="text-[10px] space-y-1 opacity-60">
              <p>{'>'} AUTH_USER: MOUNIKA_R</p>
              <p>{'>'} GRID_INITIALIZED...</p>
              <p>{'>'} ASYNC_AUDIO_SYNCED</p>
              {gameOver && <p className="text-red-500 animate-pulse">{'>'} CRITICAL_ERROR: COLLISION</p>}
              {!isPaused && !gameOver && <p className="text-green-500">{'>'} EXECUTING_RECURSION</p>}
            </div>
          </div>
        </div>

        {/* CENTER: SNAKE BOARD */}
        <div className="relative group">
          <div 
            className="grid bg-black border-4 border-neon-cyan shadow-[0_0_20px_rgba(0,255,255,0.3)] relative overflow-hidden"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: 'min(80vw, 500px)',
              height: 'min(80vw, 500px)'
            }}
          >
            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{
                backgroundImage: 'radial-gradient(#00ffff 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} 
            />

            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isSnakeHead = snake[0].x === x && snake[0].y === y;
              const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;

              return (
                <div 
                  key={i} 
                  className={`
                    w-full h-full relative border-[0.5px] border-neon-cyan/5
                    ${isSnakeHead ? 'bg-neon-cyan shadow-[0_0_10px_rgba(0,255,255,1)] z-20' : ''}
                    ${isSnakeBody ? 'bg-neon-cyan/40 z-10' : ''}
                    ${isFood ? 'bg-neon-magenta animate-pulse shadow-[0_0_15px_rgba(255,0,255,1)] rounded-full scale-75' : ''}
                  `}
                >
                  {isSnakeHead && (
                     <div className="absolute inset-0 flex items-center justify-center text-[8px] text-black font-bold">
                       ::
                     </div>
                  )}
                </div>
              );
            })}

            {/* OVERLAYS */}
            <AnimatePresence>
              {(gameOver || isPaused) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center"
                >
                  {gameOver ? (
                    <>
                      <h2 className="text-4xl font-display text-neon-magenta glitch-text mb-4" data-text="GAME OVER">GAME OVER</h2>
                      <p className="text-neon-cyan mb-6 font-mono">FINAL_SCORE: {score}</p>
                      <button 
                        onClick={resetGame}
                        className="px-8 py-3 border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all font-display tracking-tight uppercase"
                      >
                        RESTART_PROCESS
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-4xl font-display text-neon-cyan mb-4">SYSTEM_PAUSED</h2>
                      <p className="text-neon-magenta/60 mb-8 font-mono text-xs">AWAITING_INPUT_CONTINUE</p>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setIsPaused(false)}
                          className="px-8 py-3 bg-neon-cyan text-black font-display uppercase hover:bg-white transition-colors"
                        >
                          RESUME
                        </button>
                        <button 
                          onClick={resetGame}
                          className="px-8 py-3 border border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-black transition-all uppercase"
                        >
                          RESET
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* CONTROL INFO */}
          <div className="mt-4 flex justify-between text-[10px] font-mono text-neon-cyan/40 uppercase tracking-widest">
            <span>[ ARROW_KEYS ] TO_STEER</span>
            <span>[ SPACE ] TO_PAUSE</span>
          </div>
        </div>

        {/* RIGHT PANEL: MUSIC PLAYER */}
        <div className="w-full lg:w-64 flex flex-col font-mono">
          <div className="border-t-4 border-l-4 border-neon-magenta shadow-[0_0_15px_rgba(255,0,255,0.2)] bg-black/80 p-6 space-y-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Music size={48} className="text-neon-magenta" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-neon-magenta/60 uppercase">Now_Playing_Stream</span>
              <div className="h-8 overflow-hidden relative border-l-2 border-neon-magenta pl-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTrack.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex flex-col"
                  >
                    <span className="text-neon-cyan text-sm leading-tight font-display truncate">{currentTrack.title}</span>
                    <span className="text-neon-magenta/70 text-[10px] tracking-tighter truncate">{currentTrack.artist}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* VOLUMETRIC VISUALIZER (MOCK) */}
            <div className="h-24 flex items-end gap-1 px-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isPlaying ? [10, Math.random() * 80 + 10, 10] : 10
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5 + Math.random() * 0.5,
                    ease: "easeInOut"
                  }}
                  className="flex-1 bg-gradient-to-t from-neon-magenta to-neon-cyan opacity-60"
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button 
                onClick={() => skipTrack('prev')}
                className="p-2 text-neon-cyan hover:text-white transition-colors"
              >
                <SkipBack size={20} />
              </button>
              <button 
                onClick={toggleMusic}
                className="w-12 h-12 rounded-full border-2 border-neon-cyan flex items-center justify-center text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all shadow-[0_0_10px_rgba(0,255,255,0.3)]"
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
              </button>
              <button 
                onClick={() => skipTrack('next')}
                className="p-2 text-neon-cyan hover:text-white transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-neon-cyan/60 uppercase">
              <Volume2 size={14} />
              <div className="flex-1 h-1 bg-neon-cyan/20 relative">
                <div className="absolute inset-y-0 left-0 w-2/3 bg-neon-cyan shadow-[0_0_5px_rgba(0,255,255,0.5)]" />
              </div>
            </div>
            
            <audio 
              ref={audioRef}
              src={currentTrack.url}
              onEnded={() => skipTrack('next')}
            />
          </div>

          <div className="mt-4 border border-neon-cyan/20 p-3 italic text-[9px] text-neon-cyan/30 text-center uppercase tracking-tighter">
            Warning: Audio may contain synthetic artifacts and neural distortions. Proceed with caution.
          </div>
        </div>
      </main>

      <footer className="mt-12 opacity-40 text-[10px] font-mono tracking-[0.5em] text-neon-cyan uppercase z-10">
        Execution_Environment: [ CLOUD_RUN_STABLE ] // 2026_CYBER_DOMAIN
      </footer>
    </div>
  );
}
