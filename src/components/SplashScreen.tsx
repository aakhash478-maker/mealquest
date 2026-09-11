import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Swords, Sun, Moon } from 'lucide-react';
import { playQuestFanfare, playButtonClick } from '../utils/soundEffects';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onStartQuest: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStartQuest }) => {
  const { theme, toggleTheme } = useTheme();

  const handleStart = () => {
    playButtonClick();
    playQuestFanfare();
    onStartQuest();
  };

  const handleThemeToggle = () => {
    playButtonClick();
    toggleTheme();
  };

  return (
    <div
      id="splash-screen-container"
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#F8F7FC] dark:bg-[#0F0E17] text-slate-900 dark:text-slate-100 px-4 py-8 transition-colors duration-300"
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.06),rgba(248,247,252,0.95))] dark:bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.15),rgba(15,14,23,0.98))] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-200/30 dark:bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative HUD Runes & Lines */}
      <div className="absolute inset-x-8 top-8 flex justify-between items-center text-xs font-mono tracking-widest text-purple-700 dark:text-purple-400">
        <span className="flex items-center gap-2 font-semibold">
          <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          MEALQUEST // DECISION ASSISTANT
        </span>
        <span className="hidden sm:inline text-slate-500 dark:text-slate-400">HOTEL FOOD BALANCE & BUDGET GUIDE</span>
        
        {/* Theme Toggle Button */}
        <button
          id="btn-splash-theme-toggle"
          onClick={handleThemeToggle}
          aria-label="Toggle Theme"
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-purple-200 dark:border-purple-800/60 shadow-xs flex items-center gap-1.5 text-xs font-mono cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-200 text-[11px]">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-purple-700" />
              <span className="text-slate-700 text-[11px]">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center mt-12 sm:mt-0"
      >
        {/* Emblem */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="relative mb-6 p-5 rounded-2xl bg-white dark:bg-[#1A1829] border border-purple-200 dark:border-purple-800/60 shadow-md"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
            <Swords className="w-9 h-9" />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full text-xs shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Title */}
        <h1
          id="splash-title"
          className="font-epic text-5xl sm:text-7xl font-extrabold tracking-wider text-purple-950 dark:text-purple-100 mb-3"
        >
          MEALQUEST
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl font-semibold tracking-wide text-purple-800 dark:text-purple-300 mb-8">
          Your Daily Food Adventure
        </p>

        {/* Quest Summary Box */}
        <div className="w-full max-w-lg mb-10 p-5 rounded-2xl bg-white dark:bg-[#1A1829] border border-purple-100 dark:border-purple-900/40 text-left text-sm text-slate-700 dark:text-slate-300 space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold uppercase tracking-wider text-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Eat Better Outside Without Overspending</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs sm:text-sm">
            Eating outside at the hotel with limited menu items? MealQuest checks your{' '}
            <strong className="text-slate-900 dark:text-slate-100">currently available foods</strong>, prices, and daily budget to recommend practical, balanced breakfasts, lunches, and dinners.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400 border-t border-purple-100 dark:border-purple-900/30">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Real Available Dishes
            </span>
            <span className="flex items-center gap-1 text-purple-700 dark:text-purple-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-600" /> Transparent Scores
            </span>
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Daily Food Budget
            </span>
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          id="btn-start-quest"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          className="group relative px-10 py-4 rounded-xl bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-rpg text-xl font-bold tracking-wider shadow-md cursor-pointer transition-all duration-200 flex items-center gap-3"
        >
          <Swords className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
          <span>START QUEST</span>
          <span className="text-amber-300 font-normal text-base ml-1">→</span>
        </motion.button>

        <p className="text-slate-500 dark:text-slate-400 text-xs mt-6">
          Press to enter Home Base & review today's meals and budget
        </p>
      </motion.div>

      {/* Subtle bottom note */}
      <div className="absolute bottom-4 text-center text-slate-500 dark:text-slate-500 text-xs">
        MEALQUEST • Personal Food Decision Assistant
      </div>
    </div>
  );
};
