import { RoomRuntime } from '../connection/RoomRuntime';
import React, { useEffect } from 'react';
import { Leaf, Apple, Heart, Moon, Sun, Eye, EyeOff, Footprints, Shirt } from 'lucide-react';
import { usePetStore } from '../pet/petState';
import { Pet } from '../components/Pet/Pet';
export const Popup: React.FC = () => {
  const pet = usePetStore();
  useEffect(() => { void pet.initFromStorage(); }, [pet.initFromStorage]);
  const room = () => {
    if (window.desktopPet) window.desktopPet.openRoom();
    else if (typeof chrome !== 'undefined' && chrome.runtime?.id) chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel.html') });
    else window.location.href = '/sidepanel.html';
  };
  return <main className="popup-shell"><RoomRuntime />
    <div className="popup-header"><Leaf size={18} /><span>Level {pet.level} · {pet.streak} day streak</span></div>
    <div className="popup-pet"><Pet petType="sprout" state={pet.currentState} size={Math.min(180, pet.petSize)} onClick={pet.pet} /></div>
    <p className="popup-caption" aria-live="polite">{pet.currentState === 'sleeping' ? 'Taking a little rest' : pet.currentState === 'eating' ? 'Enjoying a berry break' : 'A little company for your day'}</p>
    <div className="care-actions"><button onClick={pet.feed}><Apple size={18} /><span><strong>Feed</strong><small>A berry snack</small></span></button><button onClick={pet.play}><Heart size={18} /><span><strong>Play</strong><small>A little joy</small></span></button><button onClick={pet.sleep}>{pet.currentState === 'sleeping' ? <Sun size={18} /> : <Moon size={18} />}<span><strong>{pet.currentState === 'sleeping' ? 'Wake up' : 'Sleep'}</strong><small>Rest and recharge</small></span></button><button onClick={room}><Heart size={18} /><span><strong>Companion</strong><small>Set up check-ins</small></span></button></div>
    <button className="primary-button" onClick={room}>Open care & companion</button>
    <div className="popup-footer"><button onClick={pet.toggleOverlayVisible}>{pet.overlayVisible ? <EyeOff size={13} /> : <Eye size={13} />}{pet.overlayVisible ? 'Hide pet' : 'Show pet'}</button><button onClick={pet.toggleAutoWalk}><Footprints size={13} />{pet.isAutoWalkEnabled ? 'Pause wandering' : 'Resume wandering'}</button></div>
  </main>;
};
