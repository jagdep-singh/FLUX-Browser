// adblocker.js
const { session } = require('electron');

// Define a list of URL patterns for common ad-serving domains.
const adBlockList = [
  "*://*.doubleclick.net/*",
  "*://*.adservice.google.com/*",
  "*://*.googlesyndication.com/*",
  "*://*.adsafeprotected.com/*",
  "*://*.advertising.com/*",
  "*://*.adnxs.com/*",
  "*://*.yieldlab.net/*"
];

function setupAdBlocker() {
  const filter = { urls: adBlockList };

  session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    // Allow main frame requests to avoid blocking entire pages.
    if (details.resourceType === 'mainFrame') {
      callback({ cancel: false });
      return;
    }
    console.log("Blocking ad:", details.url);
    callback({ cancel: true });
  });
}

module.exports = { setupAdBlocker };
