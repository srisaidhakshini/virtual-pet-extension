import React, { useState } from 'react';
import { usePetStore, getNextLevelXP, PetType } from '../../pet/petState';
import { getPetAvatarUrl } from '../../pet/petAssets';
import { Pet } from '../Pet/Pet';
import {
  Apple,
  Heart,
  Zap,
  Droplets,
  Utensils,
  Gamepad2,
  Bath,
  Moon,
  Sparkles,
  BarChart3,
  Shirt,
  Home,
  UserCheck,
  Award,
  Lock,
  ChevronRight,
  Footprints,
} from 'lucide-react';

export const PetControlPanel: React.FC = () => {
  const {
    name,
    petType,
    level,
    xp,
    hunger,
    happiness,
    energy,
    cleanliness,
    mood,
    equippedAccessories,
    accessories,
    currentState,
    isAutoWalkEnabled,
    toggleAutoWalk,
    feed,
    play,
    bathe,
    sleep,
    pet,
    toggleAccessory,
    setPetType,
    setName,
    journal,
  } = usePetStore();

  const [activeTab, setActiveTab] = useState<'room' | 'wardrobe' | 'stats' | 'species'>('room');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);

  const nextXP = getNextLevelXP(level);
  const xpPercent = Math.min(100, Math.round((xp / nextXP) * 100));

  const availablePets: { id: PetType; label: string; emoji: string }[] = [
    { id: 'cat', label: 'Cat (Mochi)', emoji: '🐱' },
    { id: 'elephant', label: 'Baby Elephant', emoji: '🐘' },
    { id: 'dog', label: 'Puppy / Dog', emoji: '🐶' },
    { id: 'penguin', label: 'Penguin', emoji: '🐧' },
    { id: 'bunny', label: 'Bunny', emoji: '🐰' },
    { id: 'hamster', label: 'Hamster', emoji: '🐹' },
    { id: 'bird', label: 'Bird', emoji: '🐤' },
    { id: 'panda', label: 'Panda', emoji: '🐼' },
  ];

  const allAccessoriesList = [
    { id: 'glasses', label: 'Smart Glasses', icon: '👓', price: 'Free' },
    { id: 'bow', label: 'Cute Pink Bow', icon: '🎀', price: 'Unlocked' },
    { id: 'crown', label: 'Royal Crown', icon: '👑', price: 'Unlocked' },
    { id: 'hat', label: 'Wizard Hat', icon: '🎩', price: 'Unlocked' },
    { id: 'scarf', label: 'Warm Scarf', icon: '🧣', price: 'Unlocked' },
    { id: 'headphones', label: 'Cozy Headphones', icon: '🎧', price: 'Unlocked' },
  ];

  const handleSaveName = () => {
    if (tempName.trim()) {
      setName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-cozy-pink-light flex flex-col font-sans pb-6 select-none">
      {/* Top Header Navigation */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-3 border-b border-cozy-border-light flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🐾</span>
          <span className="font-extrabold text-sm tracking-wide text-cozy-text">Virtual Pet Control</span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-cozy-pink-light p-1 rounded-full border border-cozy-border-light">
          <button
            onClick={() => setActiveTab('room')}
            className={`p-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'room' ? 'bg-cozy-pink text-white shadow-sm' : 'text-cozy-subtext hover:text-cozy-text'
            }`}
            title="Room View"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`p-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'wardrobe' ? 'bg-cozy-pink text-white shadow-sm' : 'text-cozy-subtext hover:text-cozy-text'
            }`}
            title="Accessories"
          >
            <Shirt className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`p-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'stats' ? 'bg-cozy-pink text-white shadow-sm' : 'text-cozy-subtext hover:text-cozy-text'
            }`}
            title="Statistics Room"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('species')}
            className={`p-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'species' ? 'bg-cozy-pink text-white shadow-sm' : 'text-cozy-subtext hover:text-cozy-text'
            }`}
            title="Switch Pet"
          >
            <UserCheck className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content View based on Active Tab */}
      {activeTab === 'room' && (
        <div className="flex-1 px-4 pt-3 space-y-4">
          {/* Room Background Container matching input_file_2.png */}
          <div className="relative w-full h-[220px] rounded-cozy-lg border-cozy overflow-hidden shadow-cozy bg-gradient-to-b from-[#ffd6e0] via-[#fff0f5] to-[#ffe3e8] flex items-center justify-center">
            {/* Window & Cozy Bedroom Details */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <svg viewBox="0 0 400 220" className="w-full h-full">
                {/* Arch Window */}
                <path d="M 140 20 Q 200 -10 260 20 L 260 120 L 140 120 Z" fill="#ffffff" stroke="#2d232e" strokeWidth="2.5" />
                <line x1="200" y1="10" x2="200" y2="120" stroke="#2d232e" strokeWidth="2" />
                <line x1="140" y1="65" x2="260" y2="65" stroke="#2d232e" strokeWidth="2" />
                {/* Desk & Lamp */}
                <rect x="280" y="110" width="100" height="80" fill="#fbcfe8" stroke="#2d232e" strokeWidth="2" />
                {/* Wall Shelves */}
                <rect x="30" y="35" width="80" height="8" rx="4" fill="#f472b6" />
                <rect x="40" y="70" width="70" height="8" rx="4" fill="#f472b6" />
              </svg>
            </div>

            {/* Name Tag Top Left */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full border-cozy shadow-sm flex items-center space-x-1">
              {isEditingName ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="w-20 text-xs font-bold text-cozy-text bg-transparent border-b border-cozy-pink outline-none"
                  autoFocus
                />
              ) : (
                <span
                  onClick={() => setIsEditingName(true)}
                  className="text-xs font-extrabold text-cozy-text cursor-pointer hover:underline"
                  title="Click to rename"
                >
                  {name}
                </span>
              )}
            </div>

            {/* Level Badge Top Right */}
            <div className="absolute top-3 right-3 bg-[#ff758f] text-white font-extrabold text-xs px-3 py-1 rounded-full border-cozy shadow-sm">
              Lv. {level}
            </div>

            {/* Interactive Pet centered in Room */}
            <div className="relative z-10" onClick={pet}>
              <Pet
                name={name}
                petType={petType}
                state={currentState}
                equippedAccessories={equippedAccessories}
                size={110}
                showNameTag={false}
              />
            </div>
          </div>

          {/* Auto Walk Toggle Bar */}
          <div className="bg-white p-3 rounded-cozy border-cozy shadow-cozy-card flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Footprints className="w-4 h-4 text-cozy-pink" />
              <div>
                <span className="text-xs font-bold text-cozy-text block">Autonomous Screen Walking</span>
                <span className="text-[10px] text-cozy-subtext">Pet walks around the screen naturally</span>
              </div>
            </div>
            <button
              onClick={toggleAutoWalk}
              className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all border ${
                isAutoWalkEnabled
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-500 border-slate-300'
              }`}
            >
              {isAutoWalkEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* XP Progress Bar */}
          <div className="bg-white p-3.5 rounded-cozy border-cozy shadow-cozy-card space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-cozy-subtext tracking-wider">
              <span>XP TO NEXT LEVEL</span>
              <span className="text-cozy-pink font-extrabold">{xp}/{nextXP}</span>
            </div>
            <div className="w-full bg-cozy-pink-light h-3.5 rounded-full border border-cozy-border-light overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-cozy-pink to-[#ff4d6d] h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Stat Progress Bars matching input_file_2.png */}
          <div className="bg-white p-4 rounded-cozy border-cozy shadow-cozy-card space-y-3">
            {/* Hunger Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-extrabold text-cozy-text">
                <div className="flex items-center space-x-1.5">
                  <Apple className="w-4 h-4 text-cozy-pink" />
                  <span>Hunger</span>
                </div>
                <span>{hunger}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full border border-cozy overflow-hidden p-0.5">
                <div
                  className="bg-[#ff85a1] h-full rounded-full transition-all duration-300"
                  style={{ width: `${hunger}%` }}
                />
              </div>
            </div>

            {/* Happiness Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-extrabold text-cozy-text">
                <div className="flex items-center space-x-1.5">
                  <Heart className="w-4 h-4 text-amber-500" />
                  <span>Happiness</span>
                </div>
                <span>{happiness}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full border border-cozy overflow-hidden p-0.5">
                <div
                  className="bg-[#ffd43b] h-full rounded-full transition-all duration-300"
                  style={{ width: `${happiness}%` }}
                />
              </div>
            </div>

            {/* Energy Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-extrabold text-cozy-text">
                <div className="flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  <span>Energy</span>
                </div>
                <span>{energy}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full border border-cozy overflow-hidden p-0.5">
                <div
                  className="bg-[#b197fc] h-full rounded-full transition-all duration-300"
                  style={{ width: `${energy}%` }}
                />
              </div>
            </div>

            {/* Hygiene Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-extrabold text-cozy-text">
                <div className="flex items-center space-x-1.5">
                  <Droplets className="w-4 h-4 text-emerald-500" />
                  <span>Hygiene</span>
                </div>
                <span>{cleanliness}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full border border-cozy overflow-hidden p-0.5">
                <div
                  className="bg-[#38d9a9] h-full rounded-full transition-all duration-300"
                  style={{ width: `${cleanliness}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons Grid matching input_file_2.png */}
          <div className="grid grid-cols-2 gap-3">
            {/* Feed Button */}
            <button
              onClick={feed}
              className="bg-cozy-pink-light hover:bg-[#ffe3e8] text-cozy-text p-3 rounded-cozy border-cozy shadow-sm flex flex-col items-start transition-all active:scale-95"
            >
              <div className="flex items-center space-x-2 font-extrabold text-sm">
                <Utensils className="w-4 h-4 text-cozy-pink" />
                <span>Feed</span>
              </div>
              <span className="text-[11px] font-semibold text-cozy-subtext mt-0.5">+20 Hunger</span>
            </button>

            {/* Play Button */}
            <button
              onClick={play}
              className="bg-cozy-yellow-light hover:bg-[#fff3bf] text-cozy-text p-3 rounded-cozy border-cozy shadow-sm flex flex-col items-start transition-all active:scale-95"
            >
              <div className="flex items-center space-x-2 font-extrabold text-sm">
                <Heart className="w-4 h-4 text-amber-500" />
                <span>Play</span>
              </div>
              <span className="text-[11px] font-semibold text-cozy-subtext mt-0.5">+15 Happy</span>
            </button>

            {/* Bathe Button */}
            <button
              onClick={bathe}
              className="bg-cozy-green-light hover:bg-[#c3fae8] text-cozy-text p-3 rounded-cozy border-cozy shadow-sm flex flex-col items-start transition-all active:scale-95"
            >
              <div className="flex items-center space-x-2 font-extrabold text-sm">
                <Bath className="w-4 h-4 text-emerald-500" />
                <span>Bathe</span>
              </div>
              <span className="text-[11px] font-semibold text-cozy-subtext mt-0.5">+25 Clean</span>
            </button>

            {/* Sleep Button */}
            <button
              onClick={sleep}
              className="bg-cozy-purple-light hover:bg-[#eebefa] text-cozy-text p-3 rounded-cozy border-cozy shadow-sm flex flex-col items-start transition-all active:scale-95"
            >
              <div className="flex items-center space-x-2 font-extrabold text-sm">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Sleep</span>
              </div>
              <span className="text-[11px] font-semibold text-cozy-subtext mt-0.5">+30 Energy</span>
            </button>
          </div>
        </div>
      )}

      {/* Wardrobe Tab */}
      {activeTab === 'wardrobe' && (
        <div className="flex-1 px-4 pt-3 space-y-4">
          <div className="bg-white p-4 rounded-cozy border-cozy shadow-cozy-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-cozy-text">Wardrobe & Accessories</span>
              <span className="text-xs font-bold text-cozy-pink">{equippedAccessories.length} Equipped</span>
            </div>
            <p className="text-xs text-cozy-subtext">Toggle accessories on your pet overlay.</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {allAccessoriesList.map((item) => {
                const isEquipped = equippedAccessories.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleAccessory(item.id)}
                    className={`p-3 rounded-cozy border-cozy flex items-center justify-between transition-all ${
                      isEquipped
                        ? 'bg-cozy-pink-light border-cozy-pink shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs font-bold text-cozy-text">{item.label}</span>
                    </div>
                    {isEquipped && <Sparkles className="w-3.5 h-3.5 text-cozy-pink" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Room Tab matching input_file_4.png */}
      {activeTab === 'stats' && (
        <div className="flex-1 px-4 pt-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-cozy-text flex items-center space-x-1.5">
              <BarChart3 className="w-5 h-5 text-cozy-pink" />
              <span>{name}'s Statistics Room</span>
            </h2>
            <span className="text-[10px] font-extrabold bg-cozy-text text-white px-2.5 py-1 rounded-full">
              PRO STATUS
            </span>
          </div>

          {/* Dancing Pet Card */}
          <div className="bg-white p-4 rounded-cozy border-cozy shadow-cozy-card flex flex-col items-center justify-center space-y-2 relative overflow-hidden bg-gradient-to-b from-amber-50/50 to-white">
            <Pet
              name={name}
              petType={petType}
              state="happy"
              equippedAccessories={equippedAccessories}
              size={90}
              showNameTag={false}
            />
            <div className="bg-gradient-to-r from-cozy-pink to-amber-400 text-white font-extrabold text-[10px] px-3 py-0.5 rounded-full border-cozy shadow-sm flex items-center space-x-1">
              <span>🌈 DANCING MOOD</span>
            </div>
          </div>

          {/* Personality Traits */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-cozy-subtext">Personality Traits</span>
            <div className="flex flex-wrap gap-2">
              <span className="bg-cozy-pink-light border-cozy text-cozy-text font-bold text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                <span>🌸</span>
                <span>Cozy</span>
              </span>
              <span className="bg-cozy-green-light border-cozy text-cozy-text font-bold text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                <span>🐾</span>
                <span>Explorer</span>
              </span>
              <span className="bg-cozy-yellow-light border-cozy text-cozy-text font-bold text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                <span>🍩</span>
                <span>Foodie</span>
              </span>
              <span className="bg-cozy-purple-light border-cozy text-cozy-text font-bold text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                <span>💤</span>
                <span>Sleepy</span>
              </span>
            </div>
          </div>

          {/* Weekly Stat Trends */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-cozy-subtext">Weekly Stat Trends</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-rose-50 p-3 rounded-cozy border-cozy space-y-2">
                <span className="text-[11px] font-bold text-cozy-text">Hunger Stability</span>
                <div className="flex items-end space-x-1 h-10 pt-1">
                  <div className="bg-rose-300 w-2.5 h-4 rounded-t" />
                  <div className="bg-rose-400 w-2.5 h-7 rounded-t" />
                  <div className="bg-rose-300 w-2.5 h-5 rounded-t" />
                  <div className="bg-rose-400 w-2.5 h-9 rounded-t" />
                  <div className="bg-rose-300 w-2.5 h-6 rounded-t" />
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-cozy border-cozy space-y-2">
                <span className="text-[11px] font-bold text-cozy-text">Happiness Peak</span>
                <div className="flex items-end space-x-1 h-10 pt-1">
                  <div className="bg-amber-300 w-2.5 h-6 rounded-t" />
                  <div className="bg-amber-400 w-2.5 h-8 rounded-t" />
                  <div className="bg-amber-300 w-2.5 h-7 rounded-t" />
                  <div className="bg-amber-400 w-2.5 h-10 rounded-t" />
                  <div className="bg-amber-300 w-2.5 h-8 rounded-t" />
                </div>
              </div>
            </div>
          </div>

          {/* Unlocked Badges */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-cozy-subtext">Unlocked Badges</span>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white p-2 rounded-xl border-cozy flex flex-col items-center justify-center space-y-1">
                <span className="text-xl">🍼</span>
                <span className="text-[9px] font-bold text-cozy-text">First Steps</span>
              </div>
              <div className="bg-white p-2 rounded-xl border-cozy flex flex-col items-center justify-center space-y-1">
                <span className="text-xl">🍩</span>
                <span className="text-[9px] font-bold text-cozy-text">Foodie Pro</span>
              </div>
              <div className="bg-white p-2 rounded-xl border-cozy flex flex-col items-center justify-center space-y-1">
                <span className="text-xl">🦉</span>
                <span className="text-[9px] font-bold text-cozy-text">Night Owl</span>
              </div>
              <div className="bg-slate-100 p-2 rounded-xl border-gray-300 flex flex-col items-center justify-center space-y-1 opacity-60">
                <Lock className="w-5 h-5 text-gray-400" />
                <span className="text-[9px] font-bold text-gray-500">Explorer</span>
              </div>
            </div>
          </div>

          {/* Lifetime Journal */}
          <div className="bg-white p-4 rounded-cozy border-cozy shadow-cozy-card space-y-2">
            <span className="text-xs font-extrabold text-cozy-text block pb-1 border-b border-cozy-border-light">
              Lifetime Journal
            </span>
            <div className="flex justify-between items-center text-xs">
              <span className="text-cozy-subtext">Total steps walked across webpages</span>
              <span className="font-bold text-cozy-text">{journal.stepsWalked.toLocaleString()} steps</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-cozy-subtext">Pages visited together</span>
              <span className="font-bold text-cozy-text">{journal.pagesVisited} sites</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-cozy-subtext">Days alive in your browser</span>
              <span className="font-bold text-cozy-text">{journal.daysAlive} days</span>
            </div>
          </div>
        </div>
      )}

      {/* Pet Species Switcher Tab */}
      {activeTab === 'species' && (
        <div className="flex-1 px-4 pt-3 space-y-4">
          <div className="bg-white p-4 rounded-cozy border-cozy shadow-cozy-card space-y-3">
            <span className="font-extrabold text-sm text-cozy-text block">Choose Your Pet Species</span>
            <div className="space-y-2">
              {availablePets.map((p) => {
                const avatarUrl = getPetAvatarUrl(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => setPetType(p.id)}
                    className={`w-full p-3 rounded-cozy border-cozy flex items-center justify-between transition-all ${
                      petType === p.id
                        ? 'bg-cozy-pink-light border-cozy-pink shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={p.label}
                          className="w-9 h-9 object-contain filter drop-shadow-sm"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <span className="text-2xl">{p.emoji}</span>
                      )}
                      <span className="font-extrabold text-xs text-cozy-text">{p.label}</span>
                    </div>
                    {petType === p.id && <Sparkles className="w-4 h-4 text-cozy-pink" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
