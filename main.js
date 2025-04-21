// main.js
const { app, BrowserWindow, BrowserView, ipcMain, Menu } = require('electron');
const path = require('path');
const { setupAdBlocker } = require('./adblocker');

let mainWindow;
let views = [];
let activeTab = 0;
let history = [];
let bookmarks = [];
let darkMode = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Remove default Electron menu
  Menu.setApplicationMenu(null);

  mainWindow.loadFile('index.html');

  // Open a default tab
  addTab('https://www.google.com');
}

/**
 * Creates a new BrowserView (tab) and loads the given URL.
 */
function addTab(url) {
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  views.push(view);
  const thisTabIndex = views.length - 1;

  // Set newly added tab as active
  activeTab = thisTabIndex;
  updateActiveTab();

  view.webContents.loadURL(url);

  // Track history (URL) whenever navigation occurs
  view.webContents.on('did-navigate', (event, newUrl) => {
    history.push(newUrl);
    // Update URL bar in the renderer
    mainWindow.webContents.send('url-changed', { id: thisTabIndex, url: newUrl });
  });

  // Update tab title whenever the page title changes
  view.webContents.on('page-title-updated', (event, title) => {
    mainWindow.webContents.send('tab-title-updated', { id: thisTabIndex, title });
  });

  // Let the renderer know we have a new tab
  mainWindow.webContents.send('tab-added', { id: thisTabIndex, url });
}

/**
 * Ensures only the active BrowserView is displayed,
 * and sizes it to fit below the navigation bar.
 */
function updateActiveTab() {
    const [winWidth, winHeight] = mainWindow.getSize();
    views.forEach((view, index) => {
      if (index === activeTab) {
        mainWindow.setBrowserView(view);
        // Use y: 90 if the combined height of tab bar + nav bar is ~90px
        view.setBounds({ x: 0, y: 90, width: winWidth, height: winHeight - 90 });
        view.setAutoResize({ width: true, height: true });
      }
    });
  }
  

/* ---------------------------
   IPC Handlers (Renderer -> Main)
--------------------------- */

/**
 * Load a URL in the given tab.
 */
ipcMain.handle('navigate', async (event, { id, url }) => {
  if (views[id]) views[id].webContents.loadURL(url);
});

/**
 * Create a new tab with an optional URL.
 */
ipcMain.handle('new-tab', async (event, url) => {
  addTab(url || 'https://www.google.com');
});

/**
 * Switch to an existing tab by index.
 */
ipcMain.handle('switch-tab', async (event, id) => {
  if (views[id]) {
    activeTab = id;
    updateActiveTab();
  }
});

/**
 * Close a specific tab by index.
 */
ipcMain.handle('close-tab', async (event, id) => {
  if (views[id]) {
    views[id].destroy();
    views.splice(id, 1);

    // Adjust active tab if needed
    activeTab = Math.min(activeTab, views.length - 1);
    activeTab = Math.max(0, activeTab);
    updateActiveTab();

    // Notify the renderer
    mainWindow.webContents.send('tab-removed', id);
  }
});

/**
 * Return all visited URLs in history.
 */
ipcMain.handle('get-history', async () => {
  return history;
});

/**
 * Clear history and notify the renderer.
 */
ipcMain.handle('clear-history', async () => {
  history = [];
  mainWindow.webContents.send('history-cleared');
});

/**
 * Add a bookmark if it doesn't already exist.
 */
ipcMain.handle('add-bookmark', async (event, url) => {
  if (!bookmarks.includes(url)) bookmarks.push(url);
  mainWindow.webContents.send('bookmark-added', bookmarks);
});

/**
 * Remove a bookmark.
 */
ipcMain.handle('remove-bookmark', async (event, url) => {
  bookmarks = bookmarks.filter(bookmark => bookmark !== url);
  mainWindow.webContents.send('bookmark-removed', bookmarks);
});

/**
 * Return all bookmarks.
 */
ipcMain.handle('get-bookmarks', async () => {
  return bookmarks;
});

/**
 * Toggle dark mode state and notify the renderer.
 */
ipcMain.handle('toggle-dark-mode', async () => {
  darkMode = !darkMode;
  mainWindow.webContents.send('dark-mode-toggled', darkMode);
});

/**
 * App lifecycle
 */
app.whenReady().then(() => {
  setupAdBlocker();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
