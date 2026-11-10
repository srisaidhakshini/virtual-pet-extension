"use client";
import { useEffect, useState } from "react";

const download = "/downloads/Sprout-Chrome-1.0.0.zip";
const poses = {
  hello: ["sprout-0.png", "Hi. I'm Sprout."],
  feed: ["sprout-4.png", "Thanks for the snack."],
  play: ["sprout-walk-0.png", "A quick walk before we get back to it?"],
  sleep: ["sprout-5.png", "Taking a nap. You can wake me when you're ready."],
} as const;
type Action = keyof typeof poses;

export default function Home() {
  const [action, setAction] = useState<Action>("hello");
  const [downloaded, setDownloaded] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [walkReady, setWalkReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const frames = Array.from({ length: 8 }, (_, index) => {
      const image = new Image();
      image.src = `/pet/sprout-walk-${index}.png`;
      return image.decode();
    });
    Promise.all(frames).then(() => { if (!cancelled) setWalkReady(true); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (action !== 'play' || !walkReady) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      clearInterval(timer);
      setWalkFrame(0);
      if (!preference.matches) timer = setInterval(() => setWalkFrame(frame => (frame + 1) % 8), 90);
    };
    update();
    preference.addEventListener('change', update);
    return () => { clearInterval(timer); preference.removeEventListener('change', update); };
  }, [action, walkReady]);
  const image = action === 'play' && walkReady ? `sprout-walk-${walkFrame}.png` : action === 'play' ? 'sprout-0.png' : poses[action][0];
  return <>
    <header className="site-header page-width"><a className="wordmark" href="#home">sprout</a><nav aria-label="Main navigation"><a href="#about">About</a><a href="#install">Install</a><a href="/privacy">Privacy</a></nav></header>
    <main id="home">
      <section className="intro page-width">
        <div className="intro-copy"><p className="release-note">A browser pet. Version 1.0.</p><h1>A small friend<br/>for your browser.</h1><p className="intro-description">This is Sprout. It wanders around your tabs, enjoys a snack, and occasionally reminds you to take a break.</p><a className="download-link" href={download} download onClick={()=>setDownloaded(true)}>Download for Chrome</a><p className="download-details">Free tester · Windows & Mac · 4.4 MB</p><p className="manual-note">Manual installation for now. <a href="#install">Here’s how.</a></p>{downloaded&&<p className="download-feedback" role="status">Your download should start shortly. Installation steps are below. <button className="plain-button" onClick={()=>setDownloaded(false)}>Dismiss</button></p>}</div>
        <div className="pet-preview" id="meet"><button className="pet-button" onClick={()=>setAction("hello")} aria-label="Say hello to Sprout"><img src={`/pet/${image}`} width="360" height="360" alt="Sprout, a cream woodland pet with green ears and a leaf on its head"/></button><p className="pet-caption" role="status" aria-live="polite">{poses[action][1]}</p><div className="demo-controls" aria-label="Try Sprout"><button aria-pressed={action==='feed'} onClick={()=>setAction('feed')}>Feed</button><button aria-pressed={action==='play'} onClick={()=>setAction('play')}>Play</button><button aria-pressed={action==='sleep'} onClick={()=>setAction(action==='sleep'?'hello':'sleep')}>{action==='sleep'?'Wake up':'Sleep'}</button></div><p className="preview-note">A small preview. Try the controls.</p></div>
      </section>
      <section className="about-section page-width" id="about"><h2>Keep a little company.</h2><div className="about-copy"><p>Sprout lives on your webpages while you work, read, or get distracted. Drag it somewhere comfortable. Feed it, play for a bit, give it a bath, or leave it to wander.</p><p>You can set a written check-in every 5 or 10 minutes and add what you’re working on. Turn the check-ins off when you’d rather be left alone.</p><p>It’s a small project, still being worked on. There’s no text chat or AI memory yet. The current messages are prewritten.</p></div></section>
      <section className="quiet-section page-width"><div className="sleeping-pet"><img src="/pet/sprout-5.png" width="265" height="265" alt="Sprout curled up asleep"/></div><div><h2>Your pet. Your device.</h2><p>Sprout saves its progress and settings in your browser profile. No account needed.</p><p>Optional webpage context is off by default. If enabled, it reads only visible headings to choose a message, on your device. No screenshots, form inputs, or uploaded page text.</p><a className="inline-link" href="/privacy">Read the privacy details</a></div></section>
      <section className="install-section page-width" id="install"><div><p className="release-note">Chrome 116 or later</p><h2>Bring Sprout home.</h2><p>The tester uses Chrome’s manual installation. A Chrome Web Store listing will come later.</p><a className="download-link" href={download} download onClick={()=>setDownloaded(true)}>Download Sprout v1.0.0</a></div><ol className="install-steps"><li><h3>Download and extract the ZIP.</h3><p>Keep the extracted <strong>Sprout-Chrome</strong> folder somewhere on your computer.</p></li><li><h3>Open Chrome’s extensions page.</h3><p>Type <code>chrome://extensions</code> in the address bar. Turn on <strong>Developer mode</strong>, choose <strong>Load unpacked</strong>, and select the Sprout-Chrome folder.</p></li><li><h3>Pin Sprout and refresh your tabs.</h3><p>You’ll find Sprout on regular webpages. Chrome’s settings, the Web Store, and other protected pages don’t allow it.</p></li></ol></section>
      <section className="questions-section page-width" id="questions"><h2>A few things to know.</h2><dl><div><dt>Is it free?</dt><dd>Yes. The tester is free and solo care needs no server or subscription. Updates currently require downloading the new version and reloading the extension.</dd></div><div><dt>Can I connect with a friend?</dt><dd>The room feature works with a separately deployed room server. A public service isn’t included yet, so it isn’t ready to use out of the box.</dd></div><div><dt>Does it work outside Chrome?</dt><dd>This download is just the browser extension. A Windows desktop version is in development, but there’s no standalone installer here yet.</dd></div><div><dt>What about personalised chat?</dt><dd>Text chat and local conversation memory are planned. They aren’t included in this version.</dd></div></dl></section>
    </main><footer className="site-footer page-width"><a className="wordmark" href="#home">sprout</a><p>A little project. Still growing.</p><a href="/privacy">Privacy</a><span>2026</span></footer>
  </>;
}
