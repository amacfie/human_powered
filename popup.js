document.getElementById('reenable').onclick = function () {
  chrome.storage.local.set({disableUntil: 0});
};

document.getElementById('disable').onclick = function () {
  var hrs = parseFloat(document.getElementById('disableHours').value);
  if (hrs > 0) {
    chrome.storage.local.set({
      disableUntil: Date.now() / 1000 + hrs * 60 * 60
    });
  }
};

