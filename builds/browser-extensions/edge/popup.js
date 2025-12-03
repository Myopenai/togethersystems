
document.getElementById('open')?.addEventListener('click', () => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.tabs) {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  } else if (typeof browser !== 'undefined' && browser.runtime && browser.tabs) {
    browser.tabs.create({ url: browser.runtime.getURL('index.html') });
  } else {
    console.warn('Browser extension API not available');
  }
});
