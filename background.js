// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const MODULUS = 5;

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({counter: 0});
  chrome.storage.local.set({savedPoses: []});

  // https://en.wikipedia.org/wiki/Solarized_(color_scheme)#Colors
  chrome.browserAction.setBadgeBackgroundColor({color: '#b58900'});

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.tabs.onCreated.addListener(function (tab) {
  // only triggers if the user is opening a blank new tab
  if ('pendingUrl' in tab && tab.pendingUrl === 'chrome://newtab/') {
    console.log('new tab page opened');
    chrome.storage.local.get(['counter'], function(result) {
      var newCounter = (result.counter + 1) % MODULUS;
      console.log('newCounter: ' + newCounter);
      chrome.storage.local.set({counter: newCounter});
      if (newCounter === 0) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.browserAction.setBadgeText({text: ''});
          var activeTab = tabs[0];
          chrome.storage.local.set({tabId: activeTab.id});
          chrome.tabs.create({url: chrome.extension.getURL('main.html')});
        });
      } else if (newCounter === MODULUS-1) {
        chrome.browserAction.setBadgeText({text: 'next'});
      }
    });
  }
});

