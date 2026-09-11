import React, { useState } from 'react';
import {
  Scroll,
  Trash2,
  Filter,
  Calendar,
  Sparkles,
  Utensils,
  Star,
  AlertTriangle
} from 'lucide-react';
import { ActualMealLog, MealType } from '../types';
import { playButtonClick } from '../utils/soundEffects';
import { formatLocalDateTime } from '../utils/dateUtils';

interface QuestLogViewProps {
  history: ActualMealLog[];
  onClearHistory: () => void;
  onNavigateToMealQuest: () => void;
}

export const QuestLogView: React.FC<QuestLogViewProps> = ({
  history,
  onClearHistory,
  onNavigateToMealQuest
}) => {
  const [filterType, setFilterType] = useState<'all' | MealType>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredHistory = history.filter(item => {
    if (filterType === 'all') return true;
    return item.mealType === filterType;
  });

  const handleClear = () => {
    playButtonClick();
    onClearHistory();
    setShowConfirmClear(false);
  };

  const getMealEmoji = (meal: MealType) => {
    if (meal === 'morning') return '🌅 Breakfast';
    if (meal === 'afternoon') return '☀️ Lunch';
    return '🌙 Dinner';
  };

  return (
    <div id="quest-log-view" className="space-y-6 max-w-7xl mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400 font-semibold">
            <Scroll className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>MEAL LOG & HISTORY ARCHIVES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-rpg tracking-wide">
            Quest Log & History Archives
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Review recommendations vs actual meals consumed, price differences, and rating evaluations.
          </p>
        </div>

        {/* Filter & Clear Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-[#161522] p-1 rounded-xl border border-purple-200 dark:border-purple-900/50 text-xs shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 ml-1.5" />
            {(['all', 'morning', 'afternoon', 'night'] as const).map(f => (
              <button
                key={f}
                onClick={() => {
                  playButtonClick();
                  setFilterType(f);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono capitalize transition-colors cursor-pointer ${
                  filterType === f
                    ? 'bg-purple-700 dark:bg-purple-600 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <button
              id="btn-clear-history"
              onClick={() => setShowConfirmClear(true)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#161522] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clearing History */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-[#161522] border border-rose-200 dark:border-rose-900/50 shadow-xl space-y-4 text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-xl font-bold font-rpg text-slate-900 dark:text-slate-100">
              Clear All Stored Quest History?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This action permanently deletes all recorded meal logs, ratings, and scorecard memories from your browser's local storage. Your player level & XP will remain.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-clear-history"
                onClick={handleClear}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Yes, Delete History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <div className="p-12 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs text-center space-y-4 max-w-lg mx-auto my-8 transition-colors">
          <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
            <Scroll className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-rpg text-slate-900 dark:text-slate-100">
              No quests completed yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Your first meal adventure starts here. Go to Meal Quest and record what you eat!
            </p>
          </div>
          <button
            onClick={onNavigateToMealQuest}
            className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs font-rpg tracking-wider shadow-xs cursor-pointer transition-all inline-flex items-center gap-2"
          >
            <span>START FIRST QUEST</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* History List */}
      {filteredHistory.length > 0 && (
        <div className="space-y-4">
          {filteredHistory.map(entry => {
            const dateDisplay = formatLocalDateTime(entry.timestamp);

            return (
              <div
                key={entry.id}
                id={`quest-entry-${entry.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs space-y-4 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
              >
                {/* Entry Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 font-bold font-rpg text-sm border border-purple-200 dark:border-purple-800/60">
                      {getMealEmoji(entry.mealType)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>{dateDisplay}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{entry.rating} / 10</span>
                    </div>
                  </div>
                </div>

                {/* Body Comparison Grid: Recommendation vs Actually Ate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Recommended */}
                  <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs space-y-2">
                    <span className="text-purple-800 dark:text-purple-300 font-mono uppercase font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Recommended Combination:</span>
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                      {entry.recommendedSummary}
                    </p>
                    {entry.recommendedCost > 0 && (
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Estimated: ₹{entry.recommendedCost}
                      </div>
                    )}
                  </div>

                  {/* Right: Actually Ate */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <span className="text-slate-700 dark:text-slate-300 font-mono uppercase font-bold flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Actually Ate:</span>
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {entry.actualFoodSummary}
                    </p>
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      <span>Portion: {entry.actualQuantity}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">Cost: ₹{entry.actualCost}</span>
                    </div>
                  </div>
                </div>

                {/* Why Explanation */}
                <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#1E1D2D]/70 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <div className="text-purple-900 dark:text-purple-300 font-mono font-bold flex items-center gap-1 text-[11px] uppercase">
                    <span>💡 Score Breakdown:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{entry.ratingBreakdown.whyExplanation}"
                  </p>

                  {entry.ratingBreakdown.penalties.length > 0 && (
                    <div className="pt-1 text-[10px] text-rose-700 dark:text-rose-400">
                      {entry.ratingBreakdown.penalties.map((p, idx) => (
                        <span key={idx} className="mr-3 inline-block">
                          ⚠️ {p.reason} (-{p.points})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
