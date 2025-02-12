// Google Safe Browsing API Key (Replace with your actual API key)
const API_KEY = 'AIzaSyBJRsS9-XioXMWhkiS59MRGcZrxmuhrXj4';
const SAFE_BROWSING_API_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';
const API_KEY_tv = 'beab6515982bc3e74156f0a9cd7367ae4d005594c49e83cab747212f3ebb2b6b';
const API_KEY_tv_URL = 'https://www.virustotal.com/api/v3/urls/' ;
let stats = {
  scanned: 0,
  blocked: 0
};

// Initialize stats from storage
chrome.storage.local.get(['stats'], (result) => {
  if (result.stats) {
    stats = result.stats;
  }
});

async function checkUrl(url) {
  const requestBody = {
    client: {
      clientId: 'PhishGuard',
      clientVersion: '1.0.0'
    },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url: url }]
    }
  };

  try {
    const response = await fetch(`${SAFE_BROWSING_API_URL || API_KEY_tv_URL}?key=${API_KEY || API_KEY_tv}`, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    
    stats.scanned++;
    if (data.matches && data.matches.length > 0) {
      stats.blocked++;
      chrome.storage.local.set({ stats });
      return { safe: false, threatType: data.matches[0].threatType };
    }
    
    chrome.storage.local.set({ stats });
    return { safe: true };
  } catch (error) {
    console.error('Error checking URL:', error);
    return { safe: true, error: 'Failed to check URL' };
  }
}

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId === 0) {  // Only check main frame navigation
    const result = await checkUrl(details.url);
    if (!result.safe) {
      // Show warning page
      chrome.tabs.update(details.tabId, {
        url: `warning.html?url=${encodeURIComponent(details.url)}&threat=${result.threatType}`
      });
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getStats') {
    sendResponse(stats);
  }
});
