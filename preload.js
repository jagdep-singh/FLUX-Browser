// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Navigation
  navigate: (data) => ipcRenderer.invoke('navigate', data),
  newTab: (url) => ipcRenderer.invoke('new-tab', url),
  switchTab: (id) => ipcRenderer.invoke('switch-tab', id),
  closeTab: (id) => ipcRenderer.invoke('close-tab', id),

  // Browser actions
  goBack: () => ipcRenderer.invoke('go-back'),
  goForward: () => ipcRenderer.invoke('go-forward'),
  reload: () => ipcRenderer.invoke('reload'),

  // Dark mode
  toggleDarkMode: () => ipcRenderer.invoke('toggle-dark-mode'),

  // History
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // Bookmarks
  addBookmark: (url) => ipcRenderer.invoke('add-bookmark', url),
  removeBookmark: (url) => ipcRenderer.invoke('remove-bookmark', url),
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),

  // Events from main
  onUrlChanged: (callback) => ipcRenderer.on('url-changed', callback),
  onTabAdded: (callback) => ipcRenderer.on('tab-added', callback),
  onTabRemoved: (callback) => ipcRenderer.on('tab-removed', callback),
  onDarkModeToggled: (callback) => ipcRenderer.on('dark-mode-toggled', callback),
  onHistoryCleared: (callback) => ipcRenderer.on('history-cleared', callback),
  onBookmarkAdded: (callback) => ipcRenderer.on('bookmark-added', callback),
  onBookmarkRemoved: (callback) => ipcRenderer.on('bookmark-removed', callback),

  // Additional tab title event
  onTabTitleUpdated: (callback) => ipcRenderer.on('tab-title-updated', callback)
});
