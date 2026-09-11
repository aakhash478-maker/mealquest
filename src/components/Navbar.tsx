import React, { useState } from 'react';
import {
  Home,
  Swords,
  Trophy,
  Scroll,
  User,
  Volume2,
  VolumeX,
  Sparkles,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { PlayerProfile } from '../types';
import { toggleMuteSound, getIsMuted, playButtonClick } from '../utils/soundEffects';
import { useTheme } from '../context/ThemeContext';

export type NavTab = 'home' | 'mealquest' | 'dailyscore' | 'questlog' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  profile: PlayerProfile;
  remainingBudget: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  remainingBudget
}) => {
  const [muted, setMuted] = useState(getIsMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const displayBudget = remainingBudget ?? 0;

  const handleSoundToggle = () => {
    const isNowMuted = toggleMuteSound();
    setMuted(isNowMuted);
    if (!isNowMuted) playButtonClick();
  };

  const handleThemeToggle = () => {
    playButtonClick();
    toggleTheme();
  };

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home Base', icon: <Home className="w-4 h-4" /> },
    { id: 'mealquest', label: 'Meal Quest', icon: <Swords className="w-4 h-4" /> },
    { id: 'dailyscore', label: 'Daily Score', icon: <Trophy className="w-4 h-4" /> },
    { id: 'questlog', label: 'Quest Log', icon: <Scroll className="w-4 h-4" /> },
    { id: 'profile', label: 'Player Profile', icon: <User className="w-4 h-4" /> }
  ];

  const handleTabClick = (tab: NavTab) => {
    playButtonClick();
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Meaningful XP calculation (200 XP per level)
  const currentLevel = Math.max(1, Math.floor(profile.xp / 200) + 1);
  const currentLevelXp = profile.xp % 200;
  const xpNeeded = 200;
  const xpPercent = Math.min(100, Math.round((currentLevelXp / xpNeeded) * 100));

  return (
    <header
      id="main-nav-header"
      className="sticky top-0 z-40 w-full border-b border-purple-100 dark:border-purple-900/40 bg-white/95 dark:bg-[#161522]/95 backdrop-blur-md shadow-xs transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand logo & title */}
        <button
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 border border-purple-400 dark:border-purple-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Swords className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="font-epic text-lg font-black tracking-wider text-purple-950 dark:text-purple-100">
              MEALQUEST
            </span>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-purple-600 dark:text-purple-400 font-bold">
              FOOD ASSISTANT
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-purple-700 dark:bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-purple-900 dark:hover:text-purple-200 hover:bg-purple-50/70 dark:hover:bg-purple-950/40'
                }`}
              >
                <span className={isActive ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right HUD Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Daily Food Budget remaining */}
          <div
            id="hud-budget-indicator"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-mono font-bold shadow-xs"
            title={`Daily Food Budget: ₹${displayBudget} remaining of ₹${profile.dailyBudget}`}
          >
            <span className="text-amber-700 dark:text-amber-400 text-[11px] font-sans font-semibold">Budget:</span>
            <span className="text-amber-900 dark:text-amber-200">₹{displayBudget}</span>
          </div>

          {/* Player Level & XP badge */}
          <button
            onClick={() => handleTabClick('profile')}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-xs font-mono text-purple-900 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
            title="View Player Profile & Progress"
          >
            <div className="flex items-center gap-1 text-purple-800 dark:text-purple-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Lv.{currentLevel}</span>
            </div>
            <div className="w-14 h-2 rounded-full bg-purple-200/80 dark:bg-purple-900/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-purple-700 dark:text-purple-400 font-medium">{profile.xp} XP</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            id="btn-theme-toggle"
            onClick={handleThemeToggle}
            className="p-2 rounded-lg bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-purple-700" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={handleSoundToggle}
            className="p-2 rounded-lg bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={muted ? 'Unmute SFX' : 'Mute SFX'}
            aria-label="Toggle Sound"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            id="btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#161522] px-4 py-3 space-y-1.5 shadow-xl animate-in slide-in-from-top-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-purple-700 dark:bg-purple-600 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                <span className={isActive ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
            <span>Player: {profile.name} (Lv.{currentLevel})</span>
            <span className="text-purple-700 dark:text-purple-400 font-bold">{profile.xp} XP</span>
          </div>
        </div>
      )}
    </header>
  );
};
