import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Swords, Award, Heart, Coins } from 'lucide-react';
import { playQuestFanfare, playButtonClick } from '../utils/soundEffects';

interface SplashScreenProps {
  onStartQuest: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStartQuest }) => {
  const handleStart = () => {
    playButtonClick();
    playQuestFanfare();
    onStartQuest();
  };

  return (
    <div
      id="splash-screen-container"
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#070810] text-slate-100 px-4 py-8"
    >
      {/* Background RPG glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.18),rgba(11,12,20,0.95))] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative RPG HUD Runes & Lines */}
      <div className="absolute inset-x-8 top-10 flex justify-between items-center opacity-40 text-xs font-mono tracking-widest text-purple-300">
        <span className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          MEALQUEST // PROTOCOL v1.0
        </span>
        <span className="hidden sm:inline">COIN ENGINE READY // FOOD AI ONLINE</span>
        <span className="flex items-center gap-1 text-amber-400">
          <Coins className="w-3.5 h-3.5" />
          BUDGET HP READY
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center"
      >
        {/* Emblem */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="relative mb-6 p-5 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-900/90 to-purple-900/40 border-2 border-purple-500/40 shadow-2xl glow-purple"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-purple-600/20 border border-purple-400/50 text-amber-400">
            <Swords className="w-9 h-9 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-500/90 text-slate-950 p-1 rounded-full text-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Title */}
        <h1
          id="splash-title"
          className="font-epic text-5xl sm:text-7xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-purple-200 to-amber-300 drop-shadow-[0_2px_15px_rgba(168,85,247,0.5)] mb-3"
        >
          MEALQUEST
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl font-semibold tracking-wide text-purple-200 mb-8">
          Your Daily Food Adventure
        </p>

        {/* Quest Summary Box */}
        <div className="w-full max-w-lg mb-10 p-5 rounded-xl bg-slate-900/70 border border-purple-500/20 backdrop-blur-md text-left text-sm text-slate-300 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
            <Sparkles className="w-4 h-4" />
            <span>The Adventurer's Dilemma Solved</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
            Eating outside at the hotel with limited options? MealQuest analyzes your <strong className="text-white">actually available foods</strong>, prices, quantities, and daily coin budget to forge the perfect breakfast, lunch, and dinner.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400 border-t border-purple-500/20">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Real Inventory
            </span>
            <span className="flex items-center gap-1 text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Transparent Scores
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Daily Coin HP
            </span>
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          id="btn-start-quest"
          whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(168, 85, 247, 0.65)' }}
          whileTap={{ scale: 0.96 }}
          onClick={handleStart}
          className="group relative px-10 py-4 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white font-rpg text-xl font-bold tracking-wider border-2 border-purple-400 shadow-xl glow-purple cursor-pointer transition-all duration-300 flex items-center gap-3"
        >
          <Swords className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
          <span>⚔ START QUEST</span>
          <span className="text-amber-300 font-normal text-base ml-1">→</span>
        </motion.button>

        <p className="text-slate-500 text-xs mt-6">
          Press to enter Home Base & begin tracking your daily culinary campaign
        </p>
      </motion.div>

      {/* Subtle bottom note */}
      <div className="absolute bottom-4 text-center text-slate-600 text-xs">
        MEALQUEST • Personal Food Decision Assistant • Responsive RPG Edition
      </div>
    </div>
  );
};
