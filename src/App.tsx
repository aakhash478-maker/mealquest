import React, { useState, useEffect, useMemo } from 'react';
import {
  ActualMealLog,
  FoodItem,
  MealType,
  PlayerProfile
} from './types';
import {
  DEFAULT_INVENTORIES,
  DEFAULT_PROFILE,
  loadInventories,
  loadMealHistory,
  loadProfile,
  saveInventories,
  saveMealHistory,
  saveProfile,
  calculateRealStreak
} from './utils/storage';
import { calculateDailyOverallScore } from './utils/ratingEngine';
import { getLocalDateKey } from './utils/dateUtils';
import { SplashScreen } from './components/SplashScreen';
import { Navbar, NavTab } from './components/Navbar';
import { HomeBase } from './components/HomeBase';
import { MealQuestView } from './components/MealQuestView';
import { DailyScoreView } from './components/DailyScoreView';
import { QuestLogView } from './components/QuestLogView';
import { PlayerProfileView } from './components/PlayerProfileView';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedMealQuest, setSelectedMealQuest] = useState<MealType>('morning');

  // Persistence states
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);
  const [inventories, setInventories] = useState<Record<MealType, FoodItem[]>>(loadInventories);
  const [mealHistory, setMealHistory] = useState<ActualMealLog[]>(loadMealHistory);

  // Sync profile to localStorage
  const handleUpdateProfile = (newProfile: PlayerProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  // Sync inventories to localStorage
  const handleUpdateInventory = (meal: MealType, items: FoodItem[]) => {
    const updated = {
      ...inventories,
      [meal]: items
    };
    setInventories(updated);
    saveInventories(updated);
  };

  // Reset a specific inventory to default
  const handleResetInventory = (meal: MealType) => {
    const updated = {
      ...inventories,
      [meal]: DEFAULT_INVENTORIES[meal]
    };
    setInventories(updated);
    saveInventories(updated);
  };

  // Log an actual meal
  const handleLogMeal = (newLog: ActualMealLog) => {
    // If a meal log for this mealType today already exists, update or prepend
    const updatedHistory = [
      newLog,
      ...mealHistory.filter(h => !(h.dateKey === newLog.dateKey && h.mealType === newLog.mealType))
    ];
    setMealHistory(updatedHistory);
    saveMealHistory(updatedHistory);
  };

  // Clear meal history
  const handleClearHistory = () => {
    setMealHistory([]);
    saveMealHistory([]);
  };

  // Today's logs
  const todayKey = useMemo(() => getLocalDateKey(), []);

  const todayLogs = useMemo(() => {
    const morning = mealHistory.find(m => m.dateKey === todayKey && m.mealType === 'morning');
    const afternoon = mealHistory.find(m => m.dateKey === todayKey && m.mealType === 'afternoon');
    const night = mealHistory.find(m => m.dateKey === todayKey && m.mealType === 'night');
    return { morning, afternoon, night };
  }, [mealHistory, todayKey]);

  // Today's daily score summary
  const dailyScore = useMemo(() => {
    return calculateDailyOverallScore(
      todayLogs.morning,
      todayLogs.afternoon,
      todayLogs.night,
      profile.dailyBudget
    );
  }, [todayLogs, profile.dailyBudget]);

  // Real streak calculation
  const streakDays = useMemo(() => {
    return calculateRealStreak(mealHistory);
  }, [mealHistory]);

  const remainingBudget = Math.max(0, profile.dailyBudget - dailyScore.totalSpentToday);

  const handleSelectMealQuestFromHome = (meal: MealType) => {
    setSelectedMealQuest(meal);
    setActiveTab('mealquest');
  };

  if (showSplash) {
    return <SplashScreen onStartQuest={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC] dark:bg-[#0F0E17] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white transition-colors duration-200">
      {/* Navigation HUD */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        remainingBudget={remainingBudget}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <HomeBase
            profile={profile}
            dailyScore={dailyScore}
            mealHistory={mealHistory}
            streakDays={streakDays}
            setActiveTab={setActiveTab}
            onSelectMealQuest={handleSelectMealQuestFromHome}
          />
        )}

        {activeTab === 'mealquest' && (
          <MealQuestView
            initialMealType={selectedMealQuest}
            inventories={inventories}
            onUpdateInventory={handleUpdateInventory}
            onResetInventory={handleResetInventory}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            spentToday={dailyScore.totalSpentToday}
            onLogMeal={handleLogMeal}
            todayLogs={todayLogs}
          />
        )}

        {activeTab === 'dailyscore' && (
          <DailyScoreView
            dailyScore={dailyScore}
            profile={profile}
            onNavigateToMeal={(meal) => {
              setSelectedMealQuest(meal);
              setActiveTab('mealquest');
            }}
          />
        )}

        {activeTab === 'questlog' && (
          <QuestLogView
            history={mealHistory}
            onClearHistory={handleClearHistory}
            onNavigateToMealQuest={() => setActiveTab('mealquest')}
          />
        )}

        {activeTab === 'profile' && (
          <PlayerProfileView
            profile={profile}
            onSaveProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#161522] py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-epic text-purple-900 dark:text-purple-300 font-bold">MEALQUEST</span>
            <span>•</span>
            <span>Personal Food Decision Assistant</span>
          </div>

          <div className="text-slate-600 dark:text-slate-400">
            Hotel Meal Balance & Daily Budget Guide
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setShowSplash(true)}
              className="hover:text-purple-700 dark:hover:text-purple-300 underline cursor-pointer"
            >
              Opening Screen
            </button>
            <span>v1.0 Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
