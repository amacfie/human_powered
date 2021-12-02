'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.storage.local.set({
      counter: 0,
      savedPoses: [],
      period: 5,
      startTime: 0,
      endTime: (24-1)*60 + (60-1),
      disableUntil: 0
    });

    // https://en.wikipedia.org/wiki/Solarized_(color_scheme)#Colors
    chrome.browserAction.setBadgeBackgroundColor({color: '#b58900'});
  }
});

chrome.tabs.onCreated.addListener(function (tab) {
  var mins = new Date().getHours() * 60 + new Date().getMinutes();
  // only triggers if the user is opening a blank new tab
  if (!('pendingUrl' in tab && tab.pendingUrl === 'chrome://newtab/')) {
    return;
  }
  chrome.storage.local.get(
    ['counter', 'period', 'startTime', 'endTime', 'disableUntil'],
    function(result) {
      if (!(result.startTime <= mins && mins <= result.endTime)) return;
      if (Date.now() / 1000 <= result.disableUntil) return;
      var newCounter = (result.counter + 1) % result.period;
      chrome.storage.local.set({counter: newCounter});
      if (newCounter === 0) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.browserAction.setBadgeText({text: ''});
          var activeTab = tabs[0];
          chrome.storage.local.set({tabId: activeTab.id});
          chrome.tabs.create({url: chrome.extension.getURL('main.html')});
        });
      } else if (newCounter === result.period-1) {
        chrome.browserAction.setBadgeText({text: 'next'});
      }
  });
});

