// Background Service Worker for Virtual Pet Extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Virtual Pet Extension Installed!');
});

// Configure Side Panel behavior if supported
if (chrome.sidePanel?.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
}

// Handle extension messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PING') {
    sendResponse({ status: 'PONG' });
  }
  return true;
});
