import React from 'react';
import { createRoot } from 'react-dom/client';
import { ContentOverlay } from './ContentOverlay';
import '../index.css';

const initContentScript = () => {
  const containerId = 'virtual-pet-extension-root';
  if (document.getElementById(containerId)) return;

  const host = document.createElement('div');
  host.id = containerId;
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '100vw';
  host.style.height = '100vh';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '999999';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  const rootContainer = document.createElement('div');
  shadow.appendChild(rootContainer);

  // Inject Tailwind & Global CSS into Shadow DOM
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    styleLink.href = chrome.runtime.getURL('assets/overlay.css');
  } else {
    // In dev mode, append global stylesheet
    const styleTags = Array.from(document.querySelectorAll('style'));
    styleTags.forEach((st) => shadow.appendChild(st.cloneNode(true)));
  }
  shadow.appendChild(styleLink);

  const root = createRoot(rootContainer);
  root.render(
    <React.StrictMode>
      <ContentOverlay />
    </React.StrictMode>
  );
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}
