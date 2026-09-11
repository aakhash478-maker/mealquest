import React, { useState } from 'react';
import {
  User,
  Save,
  Zap,
  Activity,
  Heart,
  Scale,
  ShieldAlert,
  Award,
  CheckCircle2,
  Info
} from 'lucide-react';
import { FoodPreference, HealthCondition, PlayerProfile } from '../types';
import { analyzeFunPower, PowerAnalysisResult } from '../utils/powerAnalyzer';
import { playButtonClick, playQuestFanfare } from '../utils/soundEffects';
import { getAgeGroup, getAgeGroupDescription } from '../utils/recommendationEngine';

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClick();
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const currentLevel = Math.max(1, Math.floor(formData.xp / 200) + 1);

  return (
    <div id="player-profile-view" className="space-y-6 max-w-7xl mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400 font-semibold">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>PLAYER CHARACTERISTICS & CONSTRAINTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-rpg tracking-wide">
            Player Profile & Health Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Configure your physical dimensions, daily food budget, health condition, and optional power reference.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-purple-900 dark:text-purple-200 font-bold shadow-xs">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Level {currentLevel} • {formData.xp} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Profile Form */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs space-y-6 transition-colors">
            {/* Identity & Budget */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-rpg text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Base Identity & Daily Food Budget</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    id="input-profile-name"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-600 focus:outline-none font-semibold shadow-2xs transition-colors"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Age (years)
                    </label>
                    <span className="text-[10px] font-mono text-purple-800 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/60">
                      {getAgeGroup(formData.age || 21)}
                    </span>
                  </div>
                  <input
                    id="input-profile-age"
                    type="number"
                    min="3"
                    max="120"
                    value={formData.age || 21}
                    onChange={e => setFormData({ ...formData, age: Math.max(1, parseInt(e.target.value, 10) || 21) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono font-bold focus:border-purple-600 focus:outline-none shadow-2xs transition-colors"
                    required
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Group: {getAgeGroup(formData.age || 21)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Food Budget (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-purple-700 dark:text-purple-400 font-bold text-sm">₹</span>
                    <input
                      id="input-profile-budget"
                      type="number"
                      min="10"
                      value={formData.dailyBudget}
                      onChange={e => setFormData({ ...formData, dailyBudget: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono font-bold focus:border-purple-600 focus:outline-none shadow-2xs transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Age group guidance note */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-purple-950 dark:text-purple-200 font-semibold">Portion Balance Guidance: </strong>
                  <span>{getAgeGroupDescription(getAgeGroup(formData.age || 21))}</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Used for practical portion guidance (e.g. 2–3 Idlis vs 1 Dosa). General advice, not clinical prescription.
                  </span>
                </div>
              </div>
            </div>

            {/* Physical Dimensions */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-rpg text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Physical Dimensions (General Context)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    id="input-profile-height"
                    type="number"
                    min="50"
                    max="250"
                    value={formData.heightCm}
                    onChange={e => setFormData({ ...formData, heightCm: parseInt(e.target.value, 10) || 170 })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono focus:border-purple-600 focus:outline-none shadow-2xs transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    id="input-profile-weight"
                    type="number"
                    min="20"
                    max="250"
                    value={formData.weightKg}
                    onChange={e => setFormData({ ...formData, weightKg: parseInt(e.target.value, 10) || 65 })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono focus:border-purple-600 focus:outline-none shadow-2xs transition-colors"
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Notice: Height and weight are used purely as general physical context for portion balancing, not as a clinical diagnosis.
              </p>
            </div>

            {/* Dietary Preference & Foods to Avoid */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-rpg text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Dietary Preferences & Exclusions</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Food Preference
                  </label>
                  <select
                    id="select-profile-preference"
                    value={formData.foodPreference}
                    onChange={e => setFormData({ ...formData, foodPreference: e.target.value as FoodPreference })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-600 focus:outline-none cursor-pointer shadow-2xs transition-colors"
                  >
                    <option value="Anything">Anything (Non-Veg & Veg)</option>
                    <option value="Vegetarian">Vegetarian (No Meat / Egg / Fish)</option>
                    <option value="Non-Vegetarian">Non-Vegetarian (Include Meat & Egg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Foods to Avoid (Comma Separated)
                  </label>
                  <input
                    id="input-profile-avoid"
                    type="text"
                    placeholder="e.g. Vada, Fried Chicken, Parotta"
                    value={formData.foodsToAvoid}
                    onChange={e => setFormData({ ...formData, foodsToAvoid: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-600 focus:outline-none shadow-2xs transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Current Health Condition */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-rpg text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Current Condition (Today's Context)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    How do you feel today?
                  </label>
                  <select
                    id="select-profile-condition"
                    value={formData.condition}
                    onChange={e => setFormData({ ...formData, condition: e.target.value as HealthCondition })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-600 focus:outline-none cursor-pointer shadow-2xs transition-colors"
                  >
                    <option value="Normal day">Normal day</option>
                    <option value="I have fever">I have fever</option>
                    <option value="I'm feeling unwell">I'm feeling unwell</option>
                    <option value="My stomach feels sensitive">My stomach feels sensitive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Condition Note (Optional)
                  </label>
                  <input
                    id="input-profile-condition-note"
                    type="text"
                    placeholder="e.g. Low appetite, mild throat irritation"
                    value={formData.conditionNote}
                    onChange={e => setFormData({ ...formData, conditionNote: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-600 focus:outline-none shadow-2xs transition-colors"
                  />
                </div>
              </div>

              {formData.condition !== 'Normal day' && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-amber-950 dark:text-amber-100 block">Digestive Adaptation Active</strong>
                    <p className="leading-relaxed">
                      Because you reported {formData.condition.toLowerCase()}, the recommendation engine will prioritize easily tolerable items (like idli, rice with rasam/sambar, hot tea) and avoid heavy oily foods where alternatives exist.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Power Reference Input */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-rpg text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>⚡ Power Reference (Universal Entity Comparison)</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enter any reference you find interesting (animals, machines, athletes, characters, mythology, nature)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="input-profile-power"
                    type="text"
                    placeholder='e.g. "Lion", "Elephant", "Excavator", "Usain Bolt", "Gojo", "Superman", "Hurricane"'
                    value={formData.powerDescription}
                    onChange={e => setFormData({ ...formData, powerDescription: e.target.value })}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-600 focus:outline-none shadow-2xs transition-colors"
                  />
                  <button
                    id="btn-analyze-power"
                    type="button"
                    onClick={handleAnalyzePower}
                    className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs font-rpg tracking-wider cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>ANALYZE ENTITY</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  * Universal entity-aware comparison: accurately captures real animal biology, human achievements, machine physics, mythological lore, or fictional powers with appropriate domain labeling.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              {saveSuccess ? (
                <div className="text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Profile saved successfully!</span>
                </div>
              ) : <div />}
              <div className="sm:ml-auto">
                <button
                  id="btn-save-profile"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-sm font-rpg tracking-wider shadow-xs cursor-pointer flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>SAVE PROFILE</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Power Reference Card & Meaningful Progress */}
        <div className="space-y-4">
          {/* Universal Power Reference Display */}
          {powerResult && (
            <div
              id="power-analysis-card"
              className={`p-5 rounded-2xl border transition-all space-y-4 shadow-sm ${
                !powerResult.isRecognized
                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-100'
                  : powerResult.isFictional
                  ? 'bg-purple-50/80 dark:bg-[#1C182F] border-purple-200 dark:border-purple-800/60 text-purple-950 dark:text-purple-100'
                  : 'bg-emerald-50/80 dark:bg-[#12261E] border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{powerResult.icon}</span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">
                      ENTITY COMPARISON
                    </span>
                    <h3 className="text-base font-bold font-rpg text-slate-900 dark:text-slate-100 leading-tight">
                      {powerResult.title}
                    </h3>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold tracking-wide border ${
                    !powerResult.isRecognized
                      ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : powerResult.isFictional
                      ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                      : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  }`}
                >
                  {!powerResult.isRecognized
                    ? 'UNKNOWN'
                    : powerResult.isFictional
                    ? 'FICTIONAL'
                    : 'REAL-WORLD'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block mb-0.5">
                  Category
                </span>
                <p className="text-xs font-semibold text-purple-900 dark:text-purple-300">
                  {powerResult.category}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#161522] border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block">
                  {powerResult.isFictional ? 'Fictional Abilities' : 'Physical Characteristics'}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {powerResult.strengthDescription}
                </p>
              </div>

              {powerResult.keyAttributes && powerResult.keyAttributes.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block mb-1.5">
                    Key Attributes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {powerResult.keyAttributes.map((attr, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-[#161522] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        • {attr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-xs text-purple-950 dark:text-purple-200 space-y-1">
                <span className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1 text-[11px] uppercase font-mono">
                  💡 Real-World Meal Energy Insight
                </span>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">{powerResult.funMealAdvice}</p>
              </div>

              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                {powerResult.disclaimer}
              </p>
            </div>
          )}

          {/* Meaningful Achievements Panel */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161522] border border-purple-100 dark:border-purple-900/40 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold font-rpg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Meaningful Milestones</span>
              </h3>
              <span className="text-xs font-mono text-purple-700 dark:text-purple-300 font-semibold">
                {formData.unlockedBadges.length} Unlocked
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.unlockedBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-xs font-semibold text-purple-900 dark:text-purple-200 shadow-2xs"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              Meaningful XP and badges are earned by logging actual meals, staying within your daily food budget, and maintaining consecutive tracking days.
            </div>
          </div>

          {/* Safety Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed transition-colors">
            <strong className="text-slate-800 dark:text-slate-200 block">General Health Notice</strong>
            MealQuest provides general food-choice guidance based on the information entered by the user. It is not a medical diagnosis or clinical prescription.
          </div>
        </div>
      </div>
    </div>
  );
};
