import React, { useState } from 'react';
import {
  User,
  Save,
  Sparkles,
  Zap,
  Activity,
  Heart,
  Scale,
  ShieldAlert,
  Coins,
  Award,
  CheckCircle2,
  Info
} from 'lucide-react';
import { FoodPreference, HealthCondition, PlayerProfile } from '../types';
import { analyzeFunPower, PowerAnalysisResult } from '../utils/powerAnalyzer';
import { playButtonClick, playQuestFanfare } from '../utils/soundEffects';

interface PlayerProfileViewProps {
  profile: PlayerProfile;
  onSaveProfile: (updated: PlayerProfile) => void;
}

export const PlayerProfileView: React.FC<PlayerProfileViewProps> = ({
  profile,
  onSaveProfile
}) => {
  const [formData, setFormData] = useState<PlayerProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [powerResult, setPowerResult] = useState<PowerAnalysisResult | null>(() =>
    profile.powerDescription ? analyzeFunPower(profile.powerDescription) : null
  );

  const handleAnalyzePower = () => {
    playButtonClick();
    playQuestFanfare();
    const res = analyzeFunPower(formData.powerDescription);
    setPowerResult(res);

    // If not unlocked, award "Power Awakened" badge
    if (!formData.unlockedBadges.includes('🧙 Power Awakened')) {
      const updated = {
        ...formData,
        unlockedBadges: [...formData.unlockedBadges, '🧙 Power Awakened']
      };
      setFormData(updated);
      onSaveProfile(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClick();
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div id="player-profile-view" className="space-y-6 max-w-7xl mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-300">
            <User className="w-4 h-4 text-amber-400" />
            <span>PLAYER CHARACTERISTICS & CONSTRAINTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-rpg tracking-wide">
            🧙 Player Profile & Health Matrix
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Configure your physical dimensions, daily coin budget, health condition, and fictional power lore.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-amber-300">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Level {formData.level} • {formData.xp} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Profile Form */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl rpg-card border border-purple-500/30 space-y-6">
            {/* Identity & Budget */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-rpg text-purple-300 uppercase tracking-wider flex items-center gap-2 border-b border-purple-500/20 pb-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>Base Identity & Food Budget</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Player / Adventurer Name
                  </label>
                  <input
                    id="input-profile-name"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Daily Food Budget (₹ Coins)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-amber-400 font-bold text-sm">₹</span>
                    <input
                      id="input-profile-budget"
                      type="number"
                      min="10"
                      value={formData.dailyBudget}
                      onChange={e => setFormData({ ...formData, dailyBudget: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-amber-300 text-xs sm:text-sm font-mono font-bold focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Dimensions */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-rpg text-purple-300 uppercase tracking-wider flex items-center gap-2 border-b border-purple-500/20 pb-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Physical Dimensions (General Context)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Height (cm)
                  </label>
                  <input
                    id="input-profile-height"
                    type="number"
                    min="50"
                    max="250"
                    value={formData.heightCm}
                    onChange={e => setFormData({ ...formData, heightCm: parseInt(e.target.value, 10) || 170 })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-white text-xs sm:text-sm font-mono focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    id="input-profile-weight"
                    type="number"
                    min="20"
                    max="250"
                    value={formData.weightKg}
                    onChange={e => setFormData({ ...formData, weightKg: parseInt(e.target.value, 10) || 65 })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-white text-xs sm:text-sm font-mono focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Notice: Height and weight are used purely as general physical context for portion balancing, not as a clinical diagnosis.
              </p>
            </div>

            {/* Dietary Preference & Foods to Avoid */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-rpg text-purple-300 uppercase tracking-wider flex items-center gap-2 border-b border-purple-500/20 pb-2">
                <Heart className="w-4 h-4 text-amber-400" />
                <span>Dietary Preferences & Exclusions</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Food Preference
                  </label>
                  <select
                    id="select-profile-preference"
                    value={formData.foodPreference}
                    onChange={e => setFormData({ ...formData, foodPreference: e.target.value as FoodPreference })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Anything">Anything (Non-Veg & Veg)</option>
                    <option value="Vegetarian">Vegetarian (No Meat / Egg / Fish)</option>
                    <option value="Non-Vegetarian">Non-Vegetarian (Include Meat & Egg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Foods to Avoid (Comma Separated)
                  </label>
                  <input
                    id="input-profile-avoid"
                    type="text"
                    placeholder="e.g. Vada, Fried Chicken, Parotta"
                    value={formData.foodsToAvoid}
                    onChange={e => setFormData({ ...formData, foodsToAvoid: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Current Health Condition */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-rpg text-purple-300 uppercase tracking-wider flex items-center gap-2 border-b border-purple-500/20 pb-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Current Condition (Today's Context)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    How do you feel today?
                  </label>
                  <select
                    id="select-profile-condition"
                    value={formData.condition}
                    onChange={e => setFormData({ ...formData, condition: e.target.value as HealthCondition })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Normal day">Normal day</option>
                    <option value="I have fever">I have fever</option>
                    <option value="I'm feeling unwell">I'm feeling unwell</option>
                    <option value="My stomach feels sensitive">My stomach feels sensitive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Condition Note (Optional)
                  </label>
                  <input
                    id="input-profile-condition-note"
                    type="text"
                    placeholder="e.g. Low appetite, mild throat irritation"
                    value={formData.conditionNote}
                    onChange={e => setFormData({ ...formData, conditionNote: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {formData.condition !== 'Normal day' && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-white">Fever / Sensitivity Adaptation Active</strong>
                    <p className="leading-relaxed">
                      Because you reported {formData.condition.toLowerCase()}, the recommendation engine will strictly prioritize easily tolerable items (like idli, rice with rasam/sambar, hot tea) and avoid heavy fried items where reasonable alternatives exist.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Fun Power Lore Input */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-rpg text-purple-300 uppercase tracking-wider flex items-center gap-2 border-b border-purple-500/20 pb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>🔥 Fun Strength / Power Reference</span>
              </h2>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Describe your strength in your own words (Anime, Games, Movies, Pop Culture)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="input-profile-power"
                    type="text"
                    placeholder='e.g. "I am as strong as the power of 8 Sukuna fingers." or "I am basically Hulk"'
                    value={formData.powerDescription}
                    onChange={e => setFormData({ ...formData, powerDescription: e.target.value })}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    id="btn-analyze-power"
                    type="button"
                    onClick={handleAnalyzePower}
                    className="px-4 py-2.5 rounded-lg bg-purple-800 hover:bg-purple-700 text-amber-300 font-bold text-xs font-rpg tracking-wider border border-purple-400 cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>⚡ ANALYZE POWER</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * Fictional strength references are for entertainment and RPG roleplay only. They are not medical or scientific measurements.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              {saveSuccess && (
                <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile saved successfully!</span>
                </div>
              )}
              <div className="sm:ml-auto">
                <button
                  id="btn-save-profile"
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-rpg font-bold tracking-wider text-sm border border-purple-400 shadow-xl glow-purple cursor-pointer flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE PLAYER PROFILE</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Fun Power Card & Badges */}
        <div className="space-y-4">
          {/* Fun Power Card Display */}
          {powerResult && (
            <div
              id="power-analysis-card"
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/90 via-slate-900/90 to-amber-950/50 border-2 border-amber-500/40 shadow-xl glow-gold space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <span className="text-2xl">{powerResult.icon}</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 uppercase font-bold">
                  {powerResult.universe}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black font-rpg text-amber-200">
                  {powerResult.title}
                </h3>
                <span className="text-xs text-purple-300 font-mono block">
                  {powerResult.rpgTitle}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-500/20">
                  <span className="block text-[10px] text-slate-400">Power Tier:</span>
                  <strong className="text-white text-xs">{powerResult.tier}</strong>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-500/20">
                  <span className="block text-[10px] text-slate-400">Estimated Fictional Output:</span>
                  <strong className="text-amber-300 text-xs">{powerResult.estimatedAura}</strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-purple-500/20 text-xs text-slate-300 space-y-1">
                <span className="text-amber-400 font-bold font-rpg block uppercase text-[11px]">
                  ⚔️ Fictional Meal Fuel Strategy
                </span>
                <p className="leading-relaxed">{powerResult.funMealAdvice}</p>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                {powerResult.disclaimer}
              </p>
            </div>
          )}

          {/* Badges / Achievements Panel */}
          <div className="p-5 rounded-2xl rpg-card border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-rpg text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Unlocked Achievements</span>
              </h3>
              <span className="text-xs font-mono text-purple-300">
                {formData.unlockedBadges.length} Badges
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.unlockedBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-400/40 text-xs font-bold text-amber-300 shadow-sm"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-slate-400 border-t border-purple-500/20">
              Log actual meals, stay on budget, and analyze your fictional power to unlock more badges.
            </div>
          </div>

          {/* Safety Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/20 text-[11px] text-slate-400 space-y-1 leading-relaxed">
            <strong className="text-slate-300 block">General Health Disclaimer</strong>
            MealQuest provides general food-choice guidance based on the information entered by the user. It is not a medical diagnosis, treatment, or personalized clinical nutrition system. If you have significant or persistent symptoms, seek appropriate medical advice.
          </div>
        </div>
      </div>
    </div>
  );
};
