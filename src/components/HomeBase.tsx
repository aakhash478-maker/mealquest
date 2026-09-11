import React from 'react';
import {
  Swords,
  Coins,
  Flame,
  Trophy,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Circle,
  Activity
} from 'lucide-react';
import { ActualMealLog, DailyScoreSummary, PlayerProfile } from '../types';
import { NavTab } from './Navbar';
import { playButtonClick } from '../utils/soundEffects';
import { formatLocalDateWithWeekday } from '../utils/dateUtils';

interface HomeBaseProps {
  profile: PlayerProfile;
  dailyScore: DailyScoreSummary;
  mealHistory: ActualMealLog[];
  streakDays: number;
  setActiveTab: (tab: NavTab) => void;
  onSelectMealQuest: (mealType: 'morning' | 'afternoon' | 'night') => void;
}

export const HomeBase: React.FC<HomeBaseProps> = ({
  profile,
  dailyScore,
  mealHistory,
  streakDays,
  setActiveTab,
  onSelectMealQuest
}) => {
  const currentLevel = Math.max(1, Math.floor(profile.xp / 150) + 1);
  const currentLevelXp = profile.xp % 150;
  const xpNeeded = 150;
  const xpPercent = Math.min(100, Math.round((currentLevelXp / xpNeeded) * 100));

  const spentToday = dailyScore.totalSpentToday;
  const remainingBudget = Math.max(0, profile.dailyBudget - spentToday);
  const budgetSpentPercent = Math.min(100, Math.round((spentToday / profile.dailyBudget) * 100));

  // Determine budget bar color
  let budgetBarColor = 'from-emerald-500 to-teal-400';
  if (budgetSpentPercent > 80) budgetBarColor = 'from-rose-500 to-amber-500';
  else if (budgetSpentPercent > 60) budgetBarColor = 'from-amber-500 to-yellow-400';

  const isSick = profile.condition !== 'Normal day';

  const handleStartQuest = (meal: 'morning' | 'afternoon' | 'night' = 'morning') => {
    playButtonClick();
    onSelectMealQuest(meal);
  };

  const handleGoToScore = () => {
    playButtonClick();
    setActiveTab('dailyscore');
  };

  const handleGoToProfile = () => {
    playButtonClick();
    setActiveTab('profile');
  };

  return (
    <div id="home-base-container" className="space-y-6 max-w-7xl mx-auto px-4 py-6 sm:px-6">
      {/* Welcome & Player Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-slate-900/60 border border-purple-500/30 backdrop-blur-md shadow-xl glow-purple">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono tracking-wider text-purple-300 uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>HQ COMMANDER // BASE CAMP</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 font-semibold">{formatLocalDateWithWeekday()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-rpg tracking-wide flex items-center gap-2">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-200 to-purple-400">{profile.name}</span> 👋
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Your hotel food companion is armed with your actual inventory & daily coin HP.
          </p>
        </div>

        {/* Condition Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoToProfile}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
              isSick
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-200 hover:bg-rose-900/60'
                : 'bg-slate-900/80 border-purple-500/40 text-purple-200 hover:bg-purple-950/60'
            }`}
            title="Click to edit current condition in Profile"
          >
            <Activity className={`w-4 h-4 ${isSick ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-mono">Condition</span>
              <span>{profile.condition}</span>
            </div>
          </button>

          {/* Real Streak Counter */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-mono">Streak</span>
              <span>{streakDays} Day{streakDays === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main HUD Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Level & XP */}
        <div className="p-4 rounded-xl rpg-card border border-purple-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase">Level Status</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black font-rpg text-amber-300">⭐ Level {currentLevel}</div>
            <div className="text-xs text-slate-400 font-mono">XP {profile.xp} / {currentLevel * 150}</div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-purple-900">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Daily Budget */}
        <div className="p-4 rounded-xl rpg-card border border-purple-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase">Daily Budget</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black font-rpg text-white">🪙 ₹{profile.dailyBudget}</div>
            <div className="text-xs text-slate-400 font-mono">Daily Coin Allocation</div>
          </div>
          <div className="text-[11px] text-purple-300 font-mono">Remaining: ₹{remainingBudget}</div>
        </div>

        {/* Today's Score */}
        <div className="p-4 rounded-xl rpg-card border border-purple-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase">Today's Score</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black font-rpg text-rose-300">
              {dailyScore.overallScore !== null ? `❤️ ${dailyScore.overallScore}/10` : 'Pending'}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {dailyScore.mealsLoggedCount} of 3 Meals Logged
            </div>
          </div>
          <button
            onClick={handleGoToScore}
            className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Scorecard</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Physical Profile Context */}
        <div className="p-4 rounded-xl rpg-card border border-purple-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase">Profile Context</span>
            <Trophy className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-lg font-bold text-slate-200">
              {profile.heightCm} cm • {profile.weightKg} kg
            </div>
            <div className="text-xs text-cyan-300 truncate font-mono">
              {profile.foodPreference}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {profile.foodsToAvoid ? `Avoids: ${profile.foodsToAvoid}` : 'No avoided foods'}
          </div>
        </div>
      </div>

      {/* Main Quest Card */}
      <div
        id="main-quest-card"
        className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-950/50 to-slate-900/70 border-2 border-purple-500/50 backdrop-blur-md shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Swords className="w-48 h-48 text-purple-400" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3" />
            <span>⚔️ TODAY'S MAIN QUEST</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-rpg mb-2">
            Choose a practical meal from the food available to you.
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Enter the exact dishes at your hotel, set prices & quantities, and let MealQuest formulate a balanced, affordable recommendation based on your health condition and budget.
          </p>

          {/* Meal Selection Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-start-breakfast"
              onClick={() => handleStartQuest('morning')}
              className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-sm tracking-wide border border-purple-400 shadow-md cursor-pointer flex items-center gap-2 transition-all"
            >
              <span>🌅 Breakfast Quest</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-start-lunch"
              onClick={() => handleStartQuest('afternoon')}
              className="px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-sm tracking-wide border border-indigo-400 shadow-md cursor-pointer flex items-center gap-2 transition-all"
            >
              <span>☀️ Lunch Quest</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-start-dinner"
              onClick={() => handleStartQuest('night')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 font-bold text-sm tracking-wide border border-purple-500/40 shadow-md cursor-pointer flex items-center gap-2 transition-all"
            >
              <span>🌙 Dinner Quest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Budget HP Progress Bar & Meal Completion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget HP Card */}
        <div className="lg:col-span-2 p-5 rounded-2xl rpg-card border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <h3 className="font-rpg text-lg font-bold text-white tracking-wide">
                🪙 Budget HP / Coin Tracker
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              ₹{spentToday} spent / ₹{profile.dailyBudget} total
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-4 rounded-full bg-slate-800/80 p-0.5 border border-purple-900 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${budgetBarColor} transition-all duration-500 shadow-sm`}
                style={{ width: `${budgetSpentPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-400 pt-1">
              <span>Spent: <strong className="text-slate-200">₹{spentToday}</strong></span>
              <span className="text-amber-400 font-bold">Remaining: ₹{remainingBudget}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Budget spending is tracked directly from your actual logged meals today. When dining outside, keeping single meal totals between 30%–45% of your daily coin HP prevents running out before dinner.
          </p>
        </div>

        {/* Meal Progress Status Checklist */}
        <div className="p-5 rounded-2xl rpg-card border border-purple-500/30 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-rpg text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Today's Log Progress</span>
            </h3>
            <span className="text-xs font-mono text-amber-300">
              {dailyScore.mealsLoggedCount}/3
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Breakfast */}
            <div
              onClick={() => handleStartQuest('morning')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                dailyScore.morning
                  ? 'bg-purple-950/40 border-purple-500/40 text-white'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {dailyScore.morning ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
                <div>
                  <span className="font-bold text-sm">🌅 Breakfast</span>
                  {dailyScore.morning && (
                    <span className="block text-[11px] text-purple-300 truncate max-w-[170px]">
                      {dailyScore.morning.actualFoodSummary} (₹{dailyScore.morning.actualCost})
                    </span>
                  )}
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-amber-300">
                {dailyScore.morning ? `${dailyScore.morning.rating}/10` : 'Not logged'}
              </span>
            </div>

            {/* Lunch */}
            <div
              onClick={() => handleStartQuest('afternoon')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                dailyScore.afternoon
                  ? 'bg-purple-950/40 border-purple-500/40 text-white'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {dailyScore.afternoon ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
                <div>
                  <span className="font-bold text-sm">☀️ Lunch</span>
                  {dailyScore.afternoon && (
                    <span className="block text-[11px] text-purple-300 truncate max-w-[170px]">
                      {dailyScore.afternoon.actualFoodSummary} (₹{dailyScore.afternoon.actualCost})
                    </span>
                  )}
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-amber-300">
                {dailyScore.afternoon ? `${dailyScore.afternoon.rating}/10` : 'Not logged'}
              </span>
            </div>

            {/* Dinner */}
            <div
              onClick={() => handleStartQuest('night')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                dailyScore.night
                  ? 'bg-purple-950/40 border-purple-500/40 text-white'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {dailyScore.night ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
                <div>
                  <span className="font-bold text-sm">🌙 Dinner</span>
                  {dailyScore.night && (
                    <span className="block text-[11px] text-purple-300 truncate max-w-[170px]">
                      {dailyScore.night.actualFoodSummary} (₹{dailyScore.night.actualCost})
                    </span>
                  )}
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-amber-300">
                {dailyScore.night ? `${dailyScore.night.rating}/10` : 'Not logged'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice if Sick */}
      {isSick && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-200">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white font-semibold">Special Condition Active: {profile.condition}</strong>
            <p className="text-slate-300">
              MealQuest is prioritizing lighter, non-fried foods (like idli, rice with rasam/sambar) to minimize digestive strain. Note: MealQuest provides general food guidance, not medical diagnosis or treatment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
