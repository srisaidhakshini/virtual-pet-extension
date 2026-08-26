import React, { useEffect } from 'react';
import { usePetStore } from '../pet/petState';
import { Pet } from '../components/Pet/Pet';
import { Apple, Heart, Zap, Droplets, Compass, Flame, Eye, EyeOff } from 'lucide-react';

export const Popup: React.FC = () => {
  const {
    name,
    petType,
    level,
    mood,
    streak,
    hunger,
    happiness,
    energy,
    cleanliness,
    activitiesLog,
    overlayVisible,
    toggleOverlayVisible,
    equippedAccessories,
    initFromStorage,
  } = usePetStore();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  const handleVisitWebpage = () => {
    if (!overlayVisible) {
      toggleOverlayVisible();
    }
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'FOCUS_PET' }).catch(() => {});
        }
      });
    }
  };

  return (
    <div className="w-[360px] min-h-[520px] bg-cozy-bg p-4 flex flex-col justify-between font-sans select-none border-cozy rounded-cozy">
      <div className="space-y-3.5">
        {/* Header matching input_file_3.png */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🐾</span>
            <h1 className="font-extrabold text-base text-cozy-text tracking-wide">PetPal Extension</h1>
          </div>
          <div className="bg-amber-100 text-amber-800 font-extrabold text-xs px-3 py-1 rounded-full border-cozy flex items-center space-x-1">
            <span>🔥</span>
            <span>{streak}d Streak</span>
          </div>
        </div>

        {/* Pet Overview Card matching input_file_3.png */}
        <div className="bg-[#f5f3ff] p-3.5 rounded-cozy border-cozy shadow-sm flex items-center space-x-3">
          <div className="w-14 h-14 bg-white rounded-2xl border-cozy flex items-center justify-center p-1 overflow-hidden shadow-inner">
            <Pet
              name={name}
              petType={petType}
              state="idle"
              equippedAccessories={equippedAccessories}
              size={50}
              showNameTag={false}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-cozy-text truncate">{name}</span>
              <span className="bg-cozy-yellow text-cozy-text font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-cozy">
                Lv. {level}
              </span>
            </div>
            <p className="text-xs text-cozy-subtext truncate mt-0.5">
              Current mood: <span className="font-bold text-cozy-text">{mood}</span>
            </p>
          </div>
        </div>

        {/* 4 Stat Progress Bars matching input_file_3.png */}
        <div className="space-y-2 py-1">
          {/* Hunger */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-rose-100 border-cozy flex items-center justify-center text-rose-500">
              <Apple className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 bg-slate-100 h-2.5 rounded-full border border-cozy overflow-hidden p-0.5">
              <div className="bg-[#ff85a1] h-full rounded-full" style={{ width: `${hunger}%` }} />
            </div>
          </div>

          {/* Happiness */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-amber-100 border-cozy flex items-center justify-center text-amber-500">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 bg-slate-100 h-2.5 rounded-full border border-cozy overflow-hidden p-0.5">
              <div className="bg-[#ffd43b] h-full rounded-full" style={{ width: `${happiness}%` }} />
            </div>
          </div>

          {/* Energy */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 border-cozy flex items-center justify-center text-purple-500">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 bg-slate-100 h-2.5 rounded-full border border-cozy overflow-hidden p-0.5">
              <div className="bg-[#b197fc] h-full rounded-full" style={{ width: `${energy}%` }} />
            </div>
          </div>

          {/* Hygiene */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 border-cozy flex items-center justify-center text-emerald-500">
              <Droplets className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 bg-slate-100 h-2.5 rounded-full border border-cozy overflow-hidden p-0.5">
              <div className="bg-[#38d9a9] h-full rounded-full" style={{ width: `${cleanliness}%` }} />
            </div>
          </div>
        </div>

        {/* Main Action Button matching input_file_3.png */}
        <div className="space-y-2">
          <button
            onClick={handleVisitWebpage}
            className="w-full bg-[#ff758f] hover:bg-[#ff4d6d] text-white font-extrabold text-sm py-3 px-4 rounded-full border-cozy shadow-cozy flex items-center justify-center space-x-2 transition-transform active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Visit {name} On Webpage</span>
          </button>

          <button
            onClick={toggleOverlayVisible}
            className="w-full bg-white hover:bg-gray-50 text-cozy-text font-bold text-xs py-2 px-3 rounded-full border border-cozy flex items-center justify-center space-x-1.5 transition-colors"
          >
            {overlayVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-cozy-subtext" />
                <span>Hide Webpage Overlay</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-cozy-pink" />
                <span>Show Webpage Overlay</span>
              </>
            )}
          </button>
        </div>

        {/* Recent Activities Section matching input_file_3.png */}
        <div className="space-y-2 pt-1">
          <h3 className="font-extrabold text-xs text-cozy-text">Recent Activities</h3>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {activitiesLog.slice(0, 3).map((act) => (
              <div
                key={act.id}
                className="bg-white p-2.5 rounded-2xl border border-cozy flex items-center justify-between text-xs shadow-sm"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-base">
                    {act.type === 'food' ? '🍪' : act.type === 'play' ? '🎾' : act.type === 'bath' ? '🫧' : '🪙'}
                  </span>
                  <span className="font-medium text-cozy-text truncate">{act.text}</span>
                </div>
                <span className="text-[10px] text-cozy-subtext font-semibold">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
