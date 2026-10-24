import { RoomRuntime } from './connection/RoomRuntime';
import React, { useState } from 'react';
import { Leaf, Footprints, ArrowUpRight, Heart, MousePointer2, HeartHandshake } from 'lucide-react';
import { PetControlPanel } from './components/SidePanel/PetControlPanel';
import { CheckIns } from './companion/CheckIns';
import { ContentOverlay } from './content/ContentOverlay';
import { usePetStore } from './pet/petState';

export const App: React.FC = () => {
  const [wandering, setWandering] = useState(false);
  const [desktopHelp, setDesktopHelp] = useState(false);
  const pet = usePetStore();
  return <div className="sprout-site">
    <header className="site-header"><a href="#" className="site-mark" aria-label="Home"><Leaf size={22} /><span>little company</span></a><button className="site-desktop-link" onClick={() => setDesktopHelp(value => !value)} aria-expanded={desktopHelp}>On your desktop <ArrowUpRight size={15} /></button></header>
    {desktopHelp && <aside className="desktop-help">For a companion across all your apps, open <strong>Start-Sprout.cmd</strong> in the project folder. Right-click the pet or its tray icon for care and quit controls.<button onClick={() => setDesktopHelp(false)} aria-label="Dismiss desktop instructions">×</button></aside>}
    <main className="site-main">
      <div className="site-story"><div className="site-eyebrow"><span /> A small friend for your everyday</div><h1>A little company.<br /><em>A calmer day.</em></h1><p>A tiny woodland friend to keep you company while you work. Share a snack, take a little break together, or just let it wander.</p>
        <div className="site-primary-actions"><button className="primary-button" onClick={() => { pet.pet(); document.getElementById('companion-care')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }}><Heart size={17} />Say hello</button><button className="secondary-button" aria-pressed={wandering} onClick={() => { if (!pet.overlayVisible) pet.toggleOverlayVisible(); setWandering(value => !value); }}><Footprints size={17} />{wandering ? 'Finish wandering' : 'Try a little wander'}</button></div>
        <div className="site-tips"><div><MousePointer2 size={17} /><span>Click to interact.<br /><strong>Drag to a cozy spot.</strong></span></div><div><HeartHandshake size={17} /><span>A friendly check-in.<br /><strong>At your own pace.</strong></span></div></div>
        <p className="site-quiet-note">No account. No rush. Just a little company.</p>
      </div>
      <div id="companion-care" className="site-controls"><PetControlPanel /></div>
    </main>
    <footer className="site-footer"><Leaf size={13} /> Made for the little pauses in your day.</footer>
    <RoomRuntime movement />
    <CheckIns />
    {wandering && <ContentOverlay withCheckIns={false} withRoomRuntime={false} />}
  </div>;
};
