document.addEventListener('DOMContentLoaded', () => {
  // Update stats
  chrome.runtime.sendMessage({ type: 'getStats' }, (stats) => {
    document.getElementById('scannedCount').textContent = stats.scanned;
    document.getElementById('blockedCount').textContent = stats.blocked;
  });

  // Report phishing button
  document.getElementById('reportPhish').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      // Open Google's phishing reporting page in a new tab
      chrome.tabs.create({
        url: `https://safebrowsing.google.com/safebrowsing/report_phish/?url=${encodeURIComponent(currentUrl)}`
      });
    });
  });
});
