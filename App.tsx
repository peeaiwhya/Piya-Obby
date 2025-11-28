import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { generateLevel } from './services/geminiService';
import { LevelBlock, BlockType } from './types';
import { DEFAULT_THEME, SAMPLE_LEVEL } from './constants';
import { Loader2, Play, Wand2, RotateCcw, Gamepad2, Layers, AlertCircle, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [theme, setTheme] = useState<string>('A floating candy land with chocolate rivers');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [levelData, setLevelData] = useState<LevelBlock[]>(SAMPLE_LEVEL);
  const [bgColor, setBgColor] = useState<string>('#ecfeff'); // Cyan 50
  const [gameKey, setGameKey] = useState<number>(0); // Used to force reset game
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!theme.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateLevel(theme, difficulty);
      setLevelData(data.blocks);
      setBgColor(data.backgroundColor);
      setGameKey(prev => prev + 1); // Reset game state
    } catch (err) {
      console.error(err);
      setError("Failed to generate level. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeath = () => {
    // Optional: track deaths or show toast
    console.log("Player died");
  };

  const handleWin = () => {
    // Optional: show victory modal
    console.log("Player won");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-cyan-100 text-slate-800 flex flex-col font-sans selection:bg-pink-200">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-white/50 p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-2.5 rounded-2xl shadow-lg shadow-purple-200 rotate-3 transition-transform hover:rotate-6">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 drop-shadow-sm">
              GenAI Obby Architect
            </h1>
          </div>
          <div className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
        {/* Editor Sidebar */}
        <aside className="w-full lg:w-96 flex-shrink-0 space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-slate-700">
              <div className="p-1.5 bg-purple-100 rounded-lg text-purple-500">
                <Wand2 className="w-5 h-5" />
              </div>
              Create Level
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Theme / Idea
                </label>
                <textarea
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-base focus:ring-4 focus:ring-purple-100 focus:border-purple-300 outline-none transition-all resize-none h-28 placeholder:text-slate-400 shadow-inner"
                  placeholder="Describe your dream level..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`px-3 py-3 rounded-xl text-sm font-bold capitalize transition-all border-b-4 active:border-b-0 active:translate-y-1
                        ${difficulty === diff 
                          ? 'bg-purple-500 border-purple-700 text-white shadow-lg shadow-purple-200' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || !theme.trim()}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 text-white font-bold text-lg py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-pink-200 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Building...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 fill-current" />
                    Build Obby!
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-start gap-3 text-red-500 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Level Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <div className="text-slate-400 text-xs font-bold uppercase mb-1">Total Blocks</div>
                <div className="text-3xl font-black text-slate-700">{levelData.length}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <div className="text-slate-400 text-xs font-bold uppercase mb-1">Length</div>
                <div className="text-3xl font-black text-slate-700">
                  {Math.max(...levelData.map(b => b.x + b.width)).toFixed(0)}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Game Area */}
        <section className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-[800px]">
             {/* Toolbar */}
            <div className="flex justify-between items-center mb-4 px-2">
               <h2 className="text-2xl font-black text-slate-700 drop-shadow-sm">Preview</h2>
               <button 
                 onClick={() => setGameKey(prev => prev + 1)}
                 className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm hover:text-purple-600 hover:shadow-md transition-all"
               >
                 <RotateCcw className="w-4 h-4" />
                 Reset
               </button>
            </div>

            <GameCanvas 
              key={gameKey} // Force re-mount on reset
              levelData={levelData} 
              backgroundColor={bgColor}
              onDeath={handleDeath}
              onWin={handleWin}
              resetTrigger={gameKey}
            />

            <div className="mt-8 flex justify-center gap-6">
               <div className="bg-white/60 p-3 rounded-2xl flex flex-col items-center min-w-[100px] border border-white shadow-sm">
                  <div className="flex gap-1 mb-1">
                    <kbd className="bg-slate-200 border-b-2 border-slate-300 px-2 py-1 rounded-lg text-slate-600 font-bold text-sm">A</kbd>
                    <kbd className="bg-slate-200 border-b-2 border-slate-300 px-2 py-1 rounded-lg text-slate-600 font-bold text-sm">D</kbd>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Move</span>
               </div>
               <div className="bg-white/60 p-3 rounded-2xl flex flex-col items-center min-w-[100px] border border-white shadow-sm">
                  <div className="mb-1">
                    <kbd className="bg-slate-200 border-b-2 border-slate-300 px-4 py-1 rounded-lg text-slate-600 font-bold text-sm">Space</kbd>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Jump</span>
               </div>
               <div className="bg-white/60 p-3 rounded-2xl flex flex-col items-center min-w-[100px] border border-white shadow-sm">
                  <div className="mb-1">
                    <kbd className="bg-slate-200 border-b-2 border-slate-300 px-3 py-1 rounded-lg text-slate-600 font-bold text-sm">R</kbd>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Restart</span>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;