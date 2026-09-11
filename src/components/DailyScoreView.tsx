import React from 'react';
import {
  Trophy,
  Sun,
  Sunrise,
  Moon,
  HelpCircle,
  ShieldCheck,
  Award,
  ArrowRight,
  Wallet,
  Calendar
} from 'lucide-react';
import { ActualMealLog, DailyScoreSummary, MealType, PlayerProfile } from '../types';
import { playButtonClick } from '../utils/soundEffects';
import { formatLocalDateWithWeekday } from '../utils/dateUtils';

interface DailyScoreViewProps {
  dailyScore: DailyScoreSummary;
  profile: PlayerProfile;
  onNavigateToMeal: (meal: MealType) => void;
}

export const DailyScoreView: React.FC<DailyScoreViewProps> = ({
  dailyScore,
  profile,
  onNavigateToMeal
}) => {
  const mealsConfig: Array<{
    type: MealType;
    title: string;
    icon: React.ReactNode;
    log?: ActualMealLog;
  }> = [
    {
      type: 'morning',
      title: '🌅 Breakfast',
      icon: <Sunrise className="w-5 h-5 text-amber-500" />,
      log: dailyScore.morning
    },
    {
      type: 'afternoon',
      title: '☀️ Lunch',
      icon: <Sun className="w-5 h-5 text-indigo-500" />,
      log: dailyScore.afternoon
    },
    {
      type: 'night',
      title: '🌙 Dinner',
      icon: <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      log: dailyScore.night
    }
  ];

  const handleQuestAction = (type: MealType) => {
    playButtonClick();
    onNavigateToMeal(type);
  };

  return (
    <div id="daily-score-view" className="space-y-6 max-w-7xl mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400 font-semibold">
            <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>DAILY EVALUATION & SCORECARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-rpg tracking-wide">
            Daily Scorecard & Balance Matrix
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Transparent ratings evaluated against the foods you actually had available at the hotel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-[#161522] border border-purple-200 dark:border-purple-900/50 text-xs font-mono shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Meals Evaluated</span>
            <span className="text-purple-900 dark:text-purple-300 font-extrabold">{dailyScore.mealsLoggedCount} of 3 Logged</span>
          </div>
        </div>
      </div>

      {/* OVERALL DAY RATING BANNER */}
      <div
        id="overall-scorecard-card"
        className="p-6 rounded-2xl bg-white dark:bg-[#161522] border border-purple-200 dark:border-purple-900/50 shadow-sm relative overflow-hidden transition-colors"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-purple-900 dark:text-purple-300 text-xs font-mono font-bold uppercase">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>TODAY'S OVERALL SCORE • {formatLocalDateWithWeekday(dailyScore.dateKey)}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-rpg text-slate-900 dark:text-slate-100 tracking-wide">
              {dailyScore.overallScore !== null ? (
                <span>
                  Overall Day Rating: <strong className="text-purple-700 dark:text-purple-400">{dailyScore.overallScore} / 10</strong>
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">Awaiting Logged Meals</span>
              )}
            </h2>

            {/* Dynamic Why the Overall Score */}
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
              <div className="text-purple-900 dark:text-purple-300 font-bold font-mono text-xs uppercase flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>WHY THIS OVERALL SCORE?</span>
              </div>
              <p>{dailyScore.whyOverallScore}</p>
            </div>
          </div>

          {/* Right Summary Metric Block with Complete Budget Tracking */}
          <div className="flex flex-col gap-3 min-w-[260px]">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Daily Food Budget</span>
                </span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-bold text-base">₹{dailyScore.dailyBudget}</span>
              </div>

              {/* Meal-by-meal spending breakdown */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>🌅 Breakfast:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{dailyScore.breakfastSpent}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>☀️ Lunch:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{dailyScore.lunchSpent}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>🌙 Dinner:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{dailyScore.dinnerSpent}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-600 dark:text-slate-400">Total Spent Today:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">₹{dailyScore.totalSpentToday}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono bg-purple-50 dark:bg-purple-950/40 p-2 rounded-lg border border-purple-200 dark:border-purple-800/50">
                <span className="text-purple-900 dark:text-purple-300 font-semibold">Remaining Budget:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">₹{dailyScore.remainingBudget}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-[11px] text-slate-600 dark:text-slate-400 text-center">
              Scoring is calculated strictly from meals you actually logged today.
            </div>
          </div>
        </div>
      </div>

      {/* 3 INDIVIDUAL MEAL CARDS (Morning, Afternoon, Night) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mealsConfig.map(meal => {
          const log = meal.log;
          return (
            <div
              key={meal.type}
              id={`scorecard-${meal.type}`}
              className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs flex flex-col justify-between space-y-4 transition-colors"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {meal.icon}
                    <h3 className="font-bold font-rpg text-base text-slate-900 dark:text-slate-100">{meal.title}</h3>
                  </div>

                  {log ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                      {log.rating} / 10
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      Pending
                    </span>
                  )}
                </div>

                {/* Content */}
                {log ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-mono">Actually Ate:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{log.actualFoodSummary}</span>
                      <div className="text-[11px] text-purple-800 dark:text-purple-300 font-mono mt-1 font-semibold">Cost: ₹{log.actualCost}</div>
                    </div>

                    {/* Why This Rating Breakdown */}
                    <div className="space-y-2 text-xs">
                      <span className="text-purple-900 dark:text-purple-300 font-bold font-mono text-[11px] uppercase block">
                        Why this rating?
                      </span>

                      <div className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                        <div className="flex justify-between">
                          <span>🍽️ Structure:</span>
                          <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{log.ratingBreakdown.mealStructure.score}/2.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>💪 Protein:</span>
                          <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{log.ratingBreakdown.protein.score}/2.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🥗 Variety/Side:</span>
                          <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{log.ratingBreakdown.variety.score}/2.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔢 Quantity:</span>
                          <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{log.ratingBreakdown.quantityPortion.score}/2.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>💰 Budget:</span>
                          <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{log.ratingBreakdown.budget.score}/2.0</span>
                        </div>
                      </div>

                      {log.ratingBreakdown.penalties.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-rose-700 dark:text-rose-400 space-y-0.5">
                          {log.ratingBreakdown.penalties.map((p, idx) => (
                            <div key={idx}>⚠️ {p.reason} (-{p.points})</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Not logged yet. When you finish eating, record your dishes to unlock this score.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                id={`btn-scorecard-action-${meal.type}`}
                onClick={() => handleQuestAction(meal.type)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold font-rpg tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  log
                    ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    : 'bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white shadow-xs'
                }`}
              >
                <span>{log ? 'Update / View Quest' : 'Start Meal Quest'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Health & Clinical Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3 transition-colors">
        <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800 dark:text-slate-200">Health & Guidance Notice:</strong> MealQuest provides general food-choice decision support based on the menu and conditions you report. It is not a medical diagnosis, clinical treatment, or personalized dietetic therapy. If symptoms are persistent or severe, always consult a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
};
