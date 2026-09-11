import React, { useState } from 'react';
import {
  Home,
  Swords,
  Trophy,
  Scroll,
  User,
  Volume2,
  VolumeX,
  Coins,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { PlayerProfile } from '../types';
import { toggleMuteSound, getIsMuted, playButtonClick } from '../utils/soundEffects';

export type NavTab = 'home' | 'mealquest' | 'dailyscore' | 'questlog' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  profile: PlayerProfile;
  remainingCoins: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  remainingCoins
}) => {
  const [muted, setMuted] = useState(getIsMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSoundToggle = () => {
    const isNowMuted = toggleMuteSound();
    setMuted(isNowMuted);
    if (!isNowMuted) playButtonClick();
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

  // XP calculation for next level (150 XP per level)
  const currentLevel = Math.max(1, Math.floor(profile.xp / 150) + 1);
  const currentLevelXp = profile.xp % 150;
  const xpNeeded = 150;
  const xpPercent = Math.min(100, Math.round((currentLevelXp / xpNeeded) * 100));

  return (
    <header
      id="main-nav-header"
      className="sticky top-0 z-40 w-full border-b border-purple-500/20 bg-[#0c0e18]/90 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand logo & title */}
        <button
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-700 to-indigo-900 border border-purple-400/50 flex items-center justify-center text-amber-300 shadow-md group-hover:glow-purple transition-all">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <span className="font-epic text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-300">
              MEALQUEST
            </span>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-purple-400">
              HUD v1.0
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-purple-900/60 text-amber-300 border border-purple-400/60 shadow-inner glow-purple'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className={isActive ? 'text-amber-300' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right HUD Stats & Sound */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins / Remaining Budget */}
          <div
            id="hud-budget-indicator"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-amber-500/40 text-xs text-amber-300 font-mono shadow-sm"
            title={`Remaining Coins / Budget out of ₹${profile.dailyBudget}`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>₹{remainingCoins}</span>
          </div>

          {/* Player Level & XP badge */}
          <button
            onClick={() => handleTabClick('profile')}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-purple-500/40 text-xs font-mono text-slate-200 hover:border-purple-400 transition-colors cursor-pointer"
            title="View Player Profile"
          >
            <div className="flex items-center gap-1 text-purple-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Lv.{currentLevel}</span>
            </div>
            <div className="w-14 h-2 rounded-full bg-slate-800 overflow-hidden border border-purple-900">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400">{profile.xp} XP</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={handleSoundToggle}
            className="p-2 rounded-lg bg-slate-900/80 border border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-400 transition-colors cursor-pointer"
            title={muted ? 'Unmute Game SFX' : 'Mute Game SFX'}
            aria-label="Toggle Sound"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            id="btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900/80 border border-purple-500/30 text-slate-200"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-500/20 bg-[#0d0e1a]/95 px-4 py-3 space-y-1.5 shadow-2xl animate-in slide-in-from-top-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-purple-900/60 text-amber-300 border border-purple-500/40'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className={isActive ? 'text-amber-300' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Player: {profile.name} (Lv.{currentLevel})</span>
            <span className="text-amber-300 font-bold">{profile.xp} XP</span>
          </div>
        </div>
      )}
    </header>
  );
};
