import { isSharingPet } from '../connection/guard';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { usePetStore } from '../pet/petState';
import { companionMessage, visiblePageContext } from './messages';

export function CheckIns({ webpage = false }: { webpage?: boolean }) {
  const [message, setMessage] = useState('');
  const pet = usePetStore();
  const turn = useRef(0);
  const lastRequest = useRef(pet.checkInRequest);
  const deliver = useCallback(async (manual = false) => {
    const state = usePetStore.getState();
    if (!manual && (isSharingPet() || !state.checkInsEnabled || !state.overlayVisible || state.currentState === 'sleeping' || document.hidden || (!window.desktopPet && !document.hasFocus()))) return;
    const page = webpage && state.pageContextEnabled ? visiblePageContext(document) : '';
    const text = companionMessage(new Date().getHours(), `${state.focusTopic} ${page}`, turn.current++);
    state.markCheckIn();
    if (window.desktopPet) {
      try { if (!await window.desktopPet.checkIn(text)) return; } catch { return; }
    }
    else setMessage(text);
    // Use only a device-local voice. Never fall back to a network speech service.
    if (state.checkInVoice && 'speechSynthesis' in window) {
      const voice = speechSynthesis.getVoices().find(voice => voice.localService && voice.lang.startsWith('en'));
      if (voice) { const speech = new SpeechSynthesisUtterance(text); speech.voice = voice; speech.rate = .95; speechSynthesis.cancel(); speechSynthesis.speak(speech); }
    }
  }, [webpage]);
  useEffect(() => {
    const timer = setInterval(() => {
      const state = usePetStore.getState();
      if (Date.now() - state.lastCheckInAt >= state.checkInMinutes * 60000) deliver();
    }, 15000);
    return () => { clearInterval(timer); };
  }, [deliver]);
  useEffect(() => {
    if (pet.checkInRequest > lastRequest.current) { lastRequest.current = pet.checkInRequest; deliver(true); }
  }, [pet.checkInRequest, deliver]);
  useEffect(() => { if (!pet.checkInsEnabled) { setMessage(''); if ('speechSynthesis' in window) speechSynthesis.cancel(); } }, [pet.checkInsEnabled]);
  useEffect(() => { if (!message) return; const timer = setTimeout(() => setMessage(''), 20000); return () => clearTimeout(timer); }, [message]);
  return message ? <aside className="companion-checkin" role="status"><MessageCircle size={18} /><p>{message}</p><button onClick={() => { setMessage(''); if ('speechSynthesis' in window) speechSynthesis.cancel(); }} aria-label="Dismiss check-in"><X size={15} /></button></aside> : null;
}
