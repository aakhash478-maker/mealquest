import React from 'react';
import {
  Trophy,
  Sun,
  Sunrise,
  Moon,
  Coins,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Award,
  ArrowRight
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
    color: string;
    log?: ActualMealLog;
  }> = [
    {
      type: 'morning',
      title: '🌅 Morning Breakfast',
      icon: <Sunrise className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40',
      log: dailyScore.morning
    },
    {
      type: 'afternoon',
      title: '☀️ Afternoon Lunch',
      icon: <Sun className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/40',
      log: dailyScore.afternoon
    },
    {
      type: 'night',
      title: '🌙 Night Dinner',
      icon: <Moon className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/40',
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
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
            <Trophy className="w-4 h-4" />
            <span>DAILY PERFORMANCE EVALUATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-rpg tracking-wide">
            🏆 Daily Scorecard & Balance Matrix
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Transparent ratings evaluated against the foods you actually had available at the hotel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-500/40 text-xs font-mono">
            <span className="text-slate-400 block text-[10px]">Meals Evaluated</span>
            <span className="text-amber-300 font-bold">{dailyScore.mealsLoggedCount} of 3 Logged</span>
          </div>
        </div>
      </div>

      {/* OVERALL DAY RATING BANNER */}
      <div
        id="overall-scorecard-card"
        className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-900/90 to-indigo-950/70 border-2 border-amber-500/50 shadow-2xl glow-gold relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>TODAY'S OVERALL SCORE • {formatLocalDateWithWeekday(dailyScore.dateKey)}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-rpg text-white tracking-wide">
              {dailyScore.overallScore !== null ? (
                <span>
                  Overall Day Rating: <strong className="text-amber-300">{dailyScore.overallScore} / 10</strong>
                </span>
              ) : (
                <span className="text-slate-400">Awaiting Logged Meals</span>
              )}
            </h2>

            {/* Dynamic Why the Overall Score */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
              <div className="text-amber-300 font-bold font-mono text-xs uppercase flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>WHY THIS OVERALL SCORE?</span>
              </div>
              <p>{dailyScore.whyOverallScore}</p>
            </div>
          </div>

          {/* Right Summary Metric Block with Complete Budget Tracking */}
          <div className="flex flex-col gap-3 min-w-[260px]">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-purple-500/20">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Daily Coin Budget</span>
                <span className="font-mono text-amber-300 font-bold text-base">₹{dailyScore.dailyBudget}</span>
              </div>

              {/* Meal-by-meal spending breakdown */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="flex items-center gap-1">🌅 Breakfast:</span>
                  <span>₹{dailyScore.breakfastSpent}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="flex items-center gap-1">☀️ Lunch:</span>
                  <span>₹{dailyScore.lunchSpent}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="flex items-center gap-1">🌙 Dinner:</span>
                  <span>₹{dailyScore.dinnerSpent}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-500/20 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Total Spent Today:</span>
                <span className="font-bold text-white text-sm">₹{dailyScore.totalSpentToday}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono bg-purple-950/40 p-2 rounded-lg border border-purple-500/30">
                <span className="text-purple-300 font-semibold">Remaining Budget:</span>
                <span className="font-bold text-amber-300 text-sm">₹{dailyScore.remainingBudget}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200">
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
              className={`p-5 rounded-2xl rpg-card border ${meal.color} flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {meal.icon}
                    <h3 className="font-bold font-rpg text-lg text-white">{meal.title}</h3>
                  </div>

                  {log ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                      {log.rating} / 10
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-500 font-mono text-xs">
                      Pending
                    </span>
                  )}
                </div>

                {/* Content */}
                {log ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/20 text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Actually Ate:</span>
                      <span className="font-bold text-slate-200">{log.actualFoodSummary}</span>
                      <div className="text-[11px] text-amber-300 font-mono mt-1">Cost: ₹{log.actualCost}</div>
                    </div>

                    {/* Why This Rating Breakdown */}
                    <div className="space-y-2 text-xs">
                      <span className="text-amber-300 font-bold font-mono text-[11px] uppercase block">
                        Why this rating?
                      </span>

                      <div className="space-y-1 text-slate-300 text-[11px]">
                        <div className="flex justify-between">
                          <span>🍽️ Structure:</span>
                          <span className="font-mono text-white font-bold">{log.ratingBreakdown.mealStructure.score}/2.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>💪 Protein:</span>
                          <span className="font-mono text-white font-bold">{log.ratingBreakdown.protein.score}/2.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🥗 Variety/Side:</span>
                          <span className="font-mono text-white font-bold">{log.ratingBreakdown.variety.score}/2.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔢 Quantity:</span>
                          <span className="font-mono text-white font-bold">{log.ratingBreakdown.quantityPortion.score}/2.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>💰 Budget:</span>
                          <span className="font-mono text-white font-bold">{log.ratingBreakdown.budget.score}/2.0</span>
                        </div>
                      </div>

                      {log.ratingBreakdown.penalties.length > 0 && (
                        <div className="pt-2 border-t border-purple-500/20 text-[10px] text-rose-300 space-y-0.5">
                          {log.ratingBreakdown.penalties.map((p, idx) => (
                            <div key={idx}>⚠️ {p.reason} (-{p.points})</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">
                      Not logged yet. When you finish eating, record your dishes to unlock this score.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                id={`btn-scorecard-action-${meal.type}`}
                onClick={() => handleQuestAction(meal.type)}
                className={`w-full py-2 rounded-xl text-xs font-bold font-rpg tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  log
                    ? 'bg-slate-800 hover:bg-slate-700 text-purple-200 border border-slate-700'
                    : 'bg-purple-700 hover:bg-purple-600 text-white border border-purple-400 shadow-md'
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
      <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-500/20 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Health & Guidance Notice:</strong> MealQuest provides general food-choice decision support based on the menu and conditions you report. It is not a medical diagnosis, clinical treatment, or personalized dietetic therapy. If symptoms are persistent or severe, always consult a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
};
