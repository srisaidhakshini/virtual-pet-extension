import { ConnectPanel } from '../../connection/ConnectPanel';
import { RoomRuntime } from '../../connection/RoomRuntime';
import { useRoomStore } from '../../connection/transport';
import React, { useEffect, useState } from 'react';
import { Apple, Heart, Zap, Droplets, Moon, Sun, Bath, Shirt, Leaf, Footprints, Pause, Play, Eye, EyeOff, Check, Sparkles, Link2 } from 'lucide-react';
import { usePetStore, getNextLevelXP } from '../../pet/petState';
import { PET_SIZE } from '../../pet/petSize';
import { Pet } from '../Pet/Pet';

const stateLabels: Record<string, string> = {
  idle: 'Happy to be here', happy: 'Feeling loved', eating: 'Berry break', playing: 'A little playtime',
  bathing: 'Freshening up', sleeping: 'Do not disturb · dreaming', 'walking-left': 'Out for a wander', 'walking-right': 'Out for a wander',
};
export const PetControlPanel: React.FC = () => {
  const pet = usePetStore();
  const room = useRoomStore();
  const watching = room.status === 'connected' && room.controllerId !== room.id;
  const [tab, setTab] = useState<'care' | 'companion' | 'connect' | 'progress'>('care');
  useEffect(() => { void pet.initFromStorage(); }, [pet.initFromStorage]);
  const stats = [
    { label: 'Fullness', value: pet.hunger, icon: Apple, color: '#d58b78' },
    { label: 'Joy', value: pet.happiness, icon: Heart, color: '#d4aa55' },
    { label: 'Energy', value: pet.energy, icon: Zap, color: '#a094c7' },
    { label: 'Freshness', value: pet.cleanliness, icon: Droplets, color: '#76aa9b' },
  ];
  const actions = [
    { label: 'Feed', hint: 'A berry snack', icon: Apple, act: pet.feed },
    { label: 'Play', hint: 'Make some joy', icon: Heart, act: pet.play },
    { label: 'Bath', hint: 'Freshen up', icon: Bath, act: pet.bathe },
    { label: pet.currentState === 'sleeping' ? 'Wake up' : 'Sleep', hint: pet.currentState === 'sleeping' ? 'Good morning' : 'A little rest', icon: pet.currentState === 'sleeping' ? Sun : Moon, act: pet.sleep },
  ];
  return <section className="care-panel" aria-label="Companion controls">
    <RoomRuntime />
    <nav className="care-tabs" aria-label="Companion sections">
      {(['care', 'companion', 'connect', 'progress'] as const).map(id => <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>{id === 'care' ? <Leaf size={16} /> : id === 'companion' ? <Heart size={16} /> : id === 'connect' ? <Link2 size={16} /> : <Sparkles size={16} />}{id[0].toUpperCase() + id.slice(1)}</button>)}
    </nav>
    <div className="care-stage">
      <span className="stage-orb stage-orb-one" /><span className="stage-orb stage-orb-two" />
      <div className="stage-pet"><Pet petType="sprout" state={pet.currentState} direction="right" size={pet.petSize} onClick={pet.pet} /></div>
      <p className="stage-caption" aria-live="polite"><span />{stateLabels[pet.currentState] || 'Happy to be here'}</p>
    </div>
    <div className="care-content">
      {tab === 'connect' && <ConnectPanel />}
      {tab === 'care' && <>
        {watching && <p className="room-presence">Your friend has control. Open Connect to request a turn.</p>}
        <div className="care-stats">{stats.map(stat => <div className="care-stat" key={stat.label}>
          <div><span><stat.icon size={14} />{stat.label}</span><strong>{Math.round(stat.value)}<small>%</small></strong></div>
          <div className="stat-track" role="progressbar" aria-label={stat.label} aria-valuenow={Math.round(stat.value)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${stat.value}%`, background: stat.color }} /></div>
        </div>)}</div>
        <div className="care-section-heading"><h2>A little care goes a long way</h2><span>Tap to interact</span></div>
        <div className="care-actions">{actions.map(action => <button key={action.label} disabled={watching} onClick={action.act}><action.icon size={20} /><span><strong>{action.label}</strong><small>{action.hint}</small></span></button>)}</div>
        <div className="pet-size-setting">
          <div><label htmlFor="pet-size">Pet size</label><output htmlFor="pet-size">{pet.petSize} px</output></div>
          <div className="pet-size-controls"><button aria-label="Decrease pet size" disabled={pet.petSize <= PET_SIZE.min} onClick={() => pet.setPetSize(pet.petSize - PET_SIZE.step)}>−</button>
          <input id="pet-size" aria-label="Pet size" type="range" min={PET_SIZE.min} max={PET_SIZE.max} step={PET_SIZE.step} value={pet.petSize} onChange={event => pet.setPetSize(Number(event.target.value))} />
          <button aria-label="Increase pet size" disabled={pet.petSize >= PET_SIZE.max} onClick={() => pet.setPetSize(pet.petSize + PET_SIZE.step)}>+</button></div>
          <p>Applies to your floating pet on webpages and the desktop.</p>
        </div>
        <div className="care-preferences">
          <div><span className="preference-label"><Footprints size={17} /><span><strong>Wandering</strong><small>{pet.isAutoWalkEnabled ? 'Exploring at its own pace' : 'Staying right here'}</small></span></span><button className="switch" role="switch" aria-label="Wandering" aria-checked={pet.isAutoWalkEnabled} onClick={pet.toggleAutoWalk}><span /></button></div>
          <div><span className="preference-label">{pet.overlayVisible ? <Eye size={17} /> : <EyeOff size={17} />}<span><strong>Keep pet visible</strong><small>Hide whenever you need focus</small></span></span><button className="switch" role="switch" aria-label="Keep pet visible" aria-checked={pet.overlayVisible} onClick={pet.toggleOverlayVisible}><span /></button></div>
        </div>
      </>}
      {tab === 'companion' && <div className="companion-settings">
        <h2>A little conversation</h2>
        <p>Local, prewritten check-ins based on the time and your focus. This is not AI chat or full-screen reading.</p>
        <label className="companion-option"><span>Regular check-ins</span><input type="checkbox" checked={pet.checkInsEnabled} onChange={e => pet.setCompanion({ checkInsEnabled: e.target.checked })} /></label>
        <label className="companion-option"><span>Check in every</span><select aria-label="Check-in interval" value={pet.checkInMinutes} onChange={e => pet.setCompanion({ checkInMinutes: Number(e.target.value) as 5 | 10 })}><option value={5}>5 minutes</option><option value={10}>10 minutes</option></select></label>
        <label className="companion-focus">What are you working on?<input maxLength={120} placeholder="e.g. studying for physics exams" value={pet.focusTopic} onChange={e => pet.setCompanion({ focusTopic: e.target.value })} /></label>
        <label className="companion-option"><span>Speak check-ins aloud</span><input type="checkbox" checked={pet.checkInVoice} onChange={e => pet.setCompanion({ checkInVoice: e.target.checked })} /></label>
        <p>Voice uses an available English device-local voice. If none is available, the check-in stays text-only.</p>
        <label className="companion-option"><span>Use visible webpage headings</span><input type="checkbox" disabled={!!window.desktopPet} checked={pet.pageContextEnabled && !window.desktopPet} onChange={e => pet.setCompanion({ pageContextEnabled: e.target.checked })} /></label>
        <p>{window.desktopPet ? 'Desktop screen reading is not connected. Use the focus field above for now.' : 'Optional extension context: visible page headings only, processed on this device. No form inputs, screenshots, or page text are uploaded.'}</p>
        <button className="primary-button" onClick={pet.requestCheckIn}>Try a check-in</button>
        <p>{window.desktopPet ? 'Desktop check-ins appear as system notifications; Windows notification settings apply.' : 'Check-ins appear while the pet is visible on an active webpage.'}</p>
      </div>}
      {tab === 'progress' && <>
        <div className="care-section-heading"><h2>Growing together</h2><span>Level {pet.level}</span></div>
        <div className="level-track"><div><span>{pet.xp} / {getNextLevelXP(pet.level)} XP</span><span>Next level</span></div><div className="stat-track"><span style={{ width: `${Math.min(100, pet.xp / getNextLevelXP(pet.level) * 100)}%` }} /></div></div>
        <div className="journal-grid"><div><strong>{pet.journal.daysAlive}</strong><span>days together</span></div><div><strong>{pet.journal.stepsWalked.toLocaleString()}</strong><span>little steps</span></div><div><strong>{pet.streak}</strong><span>day care streak</span></div></div>
        <h3 className="activity-heading">Little moments</h3>
        {pet.activitiesLog.length ? <ul className="activity-list">{pet.activitiesLog.slice(0, 6).map(item => <li key={item.id}><span className="activity-dot" /><span>{item.text.split(pet.name).join('Your pet')}</span></li>)}</ul> : <p className="care-description">Your story starts with a snack, a game, or a little affection.</p>}
      </>}
    </div>
  </section>;
};
