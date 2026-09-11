import React from 'react';
import {
  Swords,
  Flame,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Circle,
  Activity,
  Wallet,
  Clock,
  Award
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
  // Level & XP calculations (200 XP per level milestone)
  const currentLevel = Math.max(1, Math.floor(profile.xp / 200) + 1);
  const currentLevelXp = profile.xp % 200;
  const xpNeeded = 200;
  const xpPercent = Math.min(100, Math.round((currentLevelXp / xpNeeded) * 100));

  // Determine next milestone text
  let nextMilestone = 'Log 1 more meal to earn +50 XP';
  if (dailyScore.mealsLoggedCount === 0) {
    nextMilestone = 'Log your breakfast (+50 XP) to kick off today';
  } else if (dailyScore.mealsLoggedCount === 1) {
    nextMilestone = 'Log your lunch (+50 XP) to reach 2/3 meals';
  } else if (dailyScore.mealsLoggedCount === 2) {
    nextMilestone = 'Log dinner (+50 XP) and complete all 3 meals today for +100 XP bonus';
  } else if (dailyScore.mealsLoggedCount === 3) {
    nextMilestone = 'All 3 daily meals logged! Stay within budget tomorrow to claim +50 XP bonus';
  }

  const spentToday = dailyScore.totalSpentToday;
  const remainingBudget = Math.max(0, profile.dailyBudget - spentToday);
  const budgetSpentPercent = Math.min(100, Math.round((spentToday / profile.dailyBudget) * 100));

  // Determine budget bar color
  let budgetBarColor = 'bg-emerald-500';
  if (budgetSpentPercent > 85) budgetBarColor = 'bg-rose-500';
  else if (budgetSpentPercent > 65) budgetBarColor = 'bg-amber-500';

  const isSick = profile.condition !== 'Normal day';
  const recentMeal = mealHistory && mealHistory.length > 0 ? mealHistory[0] : null;

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

  const handleGoToQuestLog = () => {
    playButtonClick();
    setActiveTab('questlog');
  };

  return (
    <div id="home-base-container" className="space-y-6 max-w-7xl mx-auto px-4 py-6 sm:px-6">
      {/* Welcome & Top Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono tracking-wider text-purple-700 dark:text-purple-400 uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold">MEALQUEST BASE CAMP</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-slate-600 dark:text-slate-400 font-semibold">{formatLocalDateWithWeekday()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-rpg tracking-wide flex items-center gap-2">
            Welcome, <span className="text-purple-700 dark:text-purple-400">{profile.name}</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Check today's meal status, food budget balance, and daily health score.
          </p>
        </div>

        {/* Condition & Streak Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Health Condition */}
          <button
            onClick={handleGoToProfile}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
              isSick
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/50 text-purple-900 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40'
            }`}
            title="Click to update current health condition in Profile"
          >
            <Activity className={`w-4 h-4 ${isSick ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
            <div className="text-left">
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Today's Condition</span>
              <span>{profile.condition}</span>
            </div>
          </button>

          {/* Tracking Streak */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-xs">
            <Flame className="w-4 h-4 text-orange-500" />
            <div>
              <span className="block text-[10px] text-amber-700 dark:text-amber-400 uppercase font-mono">Tracking Streak</span>
              <span>{streakDays} Day{streakDays === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Dashboard Grid: "How am I doing today?" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Daily Food Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs flex flex-col justify-between space-y-3 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono uppercase font-bold text-slate-600 dark:text-slate-300">Daily Food Budget</span>
            <Wallet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-rpg text-slate-900 dark:text-slate-100">₹{profile.dailyBudget}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Spent: <strong className="text-slate-800 dark:text-slate-200">₹{spentToday}</strong> • Remaining: <strong className="text-emerald-700 dark:text-emerald-400">₹{remainingBudget}</strong>
            </div>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full ${budgetBarColor} transition-all duration-500`}
              style={{ width: `${budgetSpentPercent}%` }}
            />
          </div>
        </div>

        {/* 2. Meals Logged Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs flex flex-col justify-between space-y-3 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono uppercase font-bold text-slate-600 dark:text-slate-300">Meals Logged</span>
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-rpg text-purple-700 dark:text-purple-400">
              {dailyScore.mealsLoggedCount} / 3 Complete
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
              <span>B: {dailyScore.morning ? '✓' : '—'}</span>
              <span>•</span>
              <span>L: {dailyScore.afternoon ? '✓' : '—'}</span>
              <span>•</span>
              <span>D: {dailyScore.night ? '✓' : '—'}</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {dailyScore.mealsLoggedCount === 3
              ? 'All meals logged today'
              : 'Keep up your daily log streak'}
          </div>
        </div>

        {/* 3. Today's Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs flex flex-col justify-between space-y-3 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono uppercase font-bold text-slate-600 dark:text-slate-300">Today's Score</span>
            <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-rpg text-slate-900 dark:text-slate-100">
              {dailyScore.overallScore !== null ? `${dailyScore.overallScore} / 10` : 'Not Rated'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {dailyScore.overallScore !== null ? 'Aggregated meal score' : 'Log meals to calculate'}
            </div>
          </div>
          <button
            onClick={handleGoToScore}
            className="text-xs text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View Scorecard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4. MealQuest Progress (XP & Purposeful Level) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs flex flex-col justify-between space-y-3 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono uppercase font-bold text-slate-600 dark:text-slate-300">MealQuest Progress</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black font-rpg text-slate-900 dark:text-slate-100">
              Level {currentLevel}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {profile.xp} XP total • {xpNeeded - currentLevelXp} XP to Level {currentLevel + 1}
            </div>
          </div>
          <div className="w-full h-2.5 rounded-full bg-purple-100 dark:bg-purple-950/60 overflow-hidden">
            <div
              className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Quest Action Banner */}
      <div
        id="main-quest-card"
        className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white dark:from-[#1E1938] dark:via-[#19182B] dark:to-[#161522] border border-purple-200 dark:border-purple-800/60 shadow-sm relative overflow-hidden transition-colors"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>TODAY'S MEAL QUEST</span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-rpg mb-2">
            Choose a balanced, practical meal from your hotel's available dishes.
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5">
            Select items available right now at your hotel or mess, verify dish prices, and let MealQuest formulate an optimal combination fitted to your daily budget and current condition.
          </p>

          {/* Meal Selection Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-start-breakfast"
              onClick={() => handleStartQuest('morning')}
              className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-sm tracking-wide shadow-xs cursor-pointer flex items-center gap-2 transition-all"
            >
              <span>🌅 Breakfast Quest</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-start-lunch"
              onClick={() => handleStartQuest('afternoon')}
              className="px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-sm tracking-wide shadow-xs cursor-pointer flex items-center gap-2 transition-all"
            >
              <span>☀️ Lunch Quest</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-start-dinner"
              onClick={() => handleStartQuest('night')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-sm tracking-wide shadow-xs cursor-pointer flex items-center gap-2 transition-all"
            >
              <span>🌙 Dinner Quest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Lower Section: Today's Meal Checklist & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Meal Completion Status & Meaningful Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-rpg text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Today's Meal Checklist</span>
              </h3>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                {dailyScore.mealsLoggedCount} of 3 Logged
              </span>
            </div>

            <div className="space-y-3">
              {/* Breakfast */}
              <div
                onClick={() => handleStartQuest('morning')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  dailyScore.morning
                    ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50 text-slate-900 dark:text-slate-100'
                    : 'bg-slate-50/60 dark:bg-[#1E1D2D]/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {dailyScore.morning ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                  )}
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">🌅 Breakfast</span>
                    {dailyScore.morning ? (
                      <span className="block text-xs text-purple-800 dark:text-purple-300 font-medium">
                        {dailyScore.morning.actualFoodSummary} • ₹{dailyScore.morning.actualCost}
                      </span>
                    ) : (
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Not logged yet — click to record</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-purple-900 dark:text-purple-300">
                    {dailyScore.morning ? `${dailyScore.morning.rating}/10 Score` : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Lunch */}
              <div
                onClick={() => handleStartQuest('afternoon')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  dailyScore.afternoon
                    ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50 text-slate-900 dark:text-slate-100'
                    : 'bg-slate-50/60 dark:bg-[#1E1D2D]/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {dailyScore.afternoon ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                  )}
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">☀️ Lunch</span>
                    {dailyScore.afternoon ? (
                      <span className="block text-xs text-purple-800 dark:text-purple-300 font-medium">
                        {dailyScore.afternoon.actualFoodSummary} • ₹{dailyScore.afternoon.actualCost}
                      </span>
                    ) : (
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Not logged yet — click to record</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-purple-900 dark:text-purple-300">
                    {dailyScore.afternoon ? `${dailyScore.afternoon.rating}/10 Score` : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Dinner */}
              <div
                onClick={() => handleStartQuest('night')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  dailyScore.night
                    ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50 text-slate-900 dark:text-slate-100'
                    : 'bg-slate-50/60 dark:bg-[#1E1D2D]/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {dailyScore.night ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                  )}
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">🌙 Dinner</span>
                    {dailyScore.night ? (
                      <span className="block text-xs text-purple-800 dark:text-purple-300 font-medium">
                        {dailyScore.night.actualFoodSummary} • ₹{dailyScore.night.actualCost}
                      </span>
                    ) : (
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Not logged yet — click to record</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-purple-900 dark:text-purple-300">
                    {dailyScore.night ? `${dailyScore.night.rating}/10 Score` : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Meaningful Level & XP Guidance Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs space-y-2.5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Next Progress Milestone</span>
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Level {currentLevel} Milestone</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {nextMilestone}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
              <span>• Log a meal: <strong className="text-slate-700 dark:text-slate-300">+50 XP</strong></span>
              <span>• Complete all 3 meals: <strong className="text-slate-700 dark:text-slate-300">+100 XP</strong></span>
              <span>• Stay on budget: <strong className="text-slate-700 dark:text-slate-300">+50 XP</strong></span>
              <span>• Daily streak: <strong className="text-slate-700 dark:text-slate-300">+25 XP</strong></span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Meal Logged & Profile Snapshot */}
        <div className="space-y-4">
          {/* Recent Meal Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-rpg text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Most Recent Meal Log</span>
              </h3>
              {recentMeal && (
                <button
                  onClick={handleGoToQuestLog}
                  className="text-[11px] text-purple-700 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
                >
                  Full Log
                </button>
              )}
            </div>

            {recentMeal ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-purple-800 dark:text-purple-300 capitalize">
                    {recentMeal.mealType}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                    {recentMeal.rating}/10 Score
                  </span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  {recentMeal.actualFoodSummary}
                </p>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Cost: ₹{recentMeal.actualCost}</span>
                  <span>{new Date(recentMeal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No meals logged yet today. Start your first quest to begin tracking!
                </p>
                <button
                  onClick={() => handleStartQuest('morning')}
                  className="text-xs text-purple-700 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                >
                  Log Breakfast Now →
                </button>
              </div>
            )}
          </div>

          {/* Physical Profile Snapshot */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-mono uppercase font-bold text-slate-600 dark:text-slate-300">Physical Context</span>
              <button
                onClick={handleGoToProfile}
                className="text-[11px] text-purple-700 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
              >
                Edit
              </button>
            </div>
            <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Dimensions: </span>
                <strong className="text-slate-900 dark:text-slate-100">{profile.heightCm} cm • {profile.weightKg} kg</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Diet: </span>
                <strong className="text-slate-900 dark:text-slate-100">{profile.foodPreference}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Avoids: </span>
                <span>{profile.foodsToAvoid || 'None specified'}</span>
              </div>
            </div>
          </div>

          {/* Safety notice when condition is not normal */}
          {isSick && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-950 dark:text-rose-100 font-bold mb-0.5">
                  Condition Note Active: {profile.condition}
                </strong>
                <p className="leading-relaxed text-rose-800 dark:text-rose-300">
                  MealQuest is prioritizing easily digestible, soothing choices. (General food guidance only, not medical treatment).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
