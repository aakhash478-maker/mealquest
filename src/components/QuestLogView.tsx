import React, { useState } from 'react';
import {
  Scroll,
  Trash2,
  Filter,
  Calendar,
  Sparkles,
  Utensils,
  Coins,
  Star,
  CheckCircle2,
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
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-300">
            <Scroll className="w-4 h-4 text-amber-400" />
            <span>CHRONICLES OF CULINARY EXPEDITIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-rpg tracking-wide">
            📜 Quest Log & History Archives
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Review recommendations vs actual meals consumed, price differences, and rating evaluations.
          </p>
        </div>

        {/* Filter & Clear Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-purple-500/30 text-xs">
            <Filter className="w-3.5 h-3.5 text-purple-400 ml-1.5" />
            {(['all', 'morning', 'afternoon', 'night'] as const).map(f => (
              <button
                key={f}
                onClick={() => {
                  playButtonClick();
                  setFilterType(f);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono capitalize transition-colors cursor-pointer ${
                  filterType === f
                    ? 'bg-purple-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
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
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clearing History */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#121124] border-2 border-rose-500/50 shadow-2xl space-y-4 text-center">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-xl font-bold font-rpg text-white">
              Clear All Stored Quest History?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action permanently deletes all recorded meal logs, ratings, and scorecard memories from your browser's local storage. Your player level & XP will remain.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-clear-history"
                onClick={handleClear}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg glow-rose cursor-pointer"
              >
                Yes, Delete History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <div className="p-12 rounded-2xl rpg-card border border-purple-500/20 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
            <Scroll className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-rpg text-white">
              📜 No quests completed yet.
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Your first meal adventure starts here. Go to Meal Quest and record what you eat!
            </p>
          </div>
          <button
            onClick={onNavigateToMealQuest}
            className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs font-rpg tracking-wider shadow-md cursor-pointer transition-all inline-flex items-center gap-2"
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
                className="p-5 rounded-2xl rpg-card border border-purple-500/30 space-y-4 hover:border-purple-400/50 transition-all shadow-md"
              >
                {/* Entry Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg bg-purple-950 text-amber-300 font-bold font-rpg text-sm border border-purple-500/30">
                      {getMealEmoji(entry.mealType)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>{dateDisplay}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{entry.rating} / 10</span>
                    </div>
                  </div>
                </div>

                {/* Body Comparison Grid: Recommendation vs Actually Ate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Recommended */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/20 text-xs space-y-2">
                    <span className="text-purple-300 font-mono uppercase font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>🤖 Recommended:</span>
                    </span>
                    <p className="font-semibold text-slate-200 text-sm">
                      {entry.recommendedSummary}
                    </p>
                    {entry.recommendedCost > 0 && (
                      <div className="text-[11px] font-mono text-slate-400">
                        Estimated: ₹{entry.recommendedCost}
                      </div>
                    )}
                  </div>

                  {/* Right: Actually Ate */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/20 text-xs space-y-2">
                    <span className="text-amber-300 font-mono uppercase font-bold flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-400" />
                      <span>🍽️ Actually Ate:</span>
                    </span>
                    <p className="font-semibold text-white text-sm">
                      {entry.actualFoodSummary}
                    </p>
                    <div className="flex justify-between items-center text-[11px] font-mono text-amber-300">
                      <span>Portion: {entry.actualQuantity}</span>
                      <span className="font-bold">💰 Actual Cost: ₹{entry.actualCost}</span>
                    </div>
                  </div>
                </div>

                {/* Why Explanation */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/10 text-xs space-y-1">
                  <div className="text-amber-400 font-mono font-bold flex items-center gap-1 text-[11px] uppercase">
                    <span>💡 Why:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic">
                    "{entry.ratingBreakdown.whyExplanation}"
                  </p>

                  {entry.ratingBreakdown.penalties.length > 0 && (
                    <div className="pt-1 text-[10px] text-rose-300">
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
