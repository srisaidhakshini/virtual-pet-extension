import React from 'react';
import { createRoot } from 'react-dom/client';
import { PetControlPanel } from '../components/SidePanel/PetControlPanel';
import '../index.css';

const container = document.getElementById('sidepanel-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <PetControlPanel />
    </React.StrictMode>
  );
}
