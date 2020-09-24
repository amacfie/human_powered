// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const MODULUS = 5;

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({color: '#3aa757'}, function() {
    console.log('The color is green.');
  });
  chrome.storage.local.set({counter: 0});
  chrome.storage.local.set({savedPoses: []});

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
  if ('pendingUrl' in tab && tab.pendingUrl === 'chrome://newtab/') {
    console.log('new tab page opened');
    chrome.storage.local.get(['counter'], function(result) {
      var newCounter = (result.counter + 1) % MODULUS;
      console.log('newCounter: ' + newCounter);
      chrome.storage.local.set({counter: newCounter});
      if (newCounter === 0) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.browserAction.setIcon({path: "images/128x128.png"});
          var activeTab = tabs[0];
          chrome.storage.local.set({tabId: activeTab.id});
          chrome.tabs.create({url: chrome.extension.getURL('main.html')});
        });
      } else if (newCounter === MODULUS-1) {
          chrome.browserAction.setIcon({path: "images/filled128x128.png"});
      }
    });
  }
});

