// ==UserScript==
// @name Human Powered
// @namespace https://github.com/amacfie/human_powered
// @description Improve posture, etc.
// @include *
// @run-at document-start
// @noframes
// ==/UserScript==

const MODULUS = 10;

function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState ===
    "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

if (typeof GM_getValue('disableUntil') === 'undefined') {
  GM_setValue('disableUntil', 0);
}

//if (window.location.href === 'http://localhost:6771/options.html') {
//  docReady(function () {
//    document.getElementById('sleep').onclick = function () {
//      //setValue
//      setTimeout(function () {GM_setValue(
//        "disableUntil",
//        new Date().getTime() / 1000 + 12 * 60 * 60
//      )}, 0);
//    };
//  });
//}


var shouldRun = (9 <= new Date().getHours() <= 19 &&
  new Date().getTime() / 1000 >= GM_getValue('disableUntil') &&
  // navigating within domain
  document.referrer.split('/')[2] === window.location.href.split('/')[2] &&
  !document.hidden &&
  window.origin !== 'http://localhost:6771'
);

if (shouldRun) {
  if (typeof GM_getValue('count') === 'undefined') {
    GM_setValue('count', 0);
  }

  var newCount = parseInt(GM_getValue('count')) + 1;

  if (newCount === MODULUS - 1) {
    docReady(function () {
      var element = document.createElement('style');
      element.setAttribute('type', 'text/css');
      element.textContent = `
  /* The snackbar - position it at the bottom and in the middle of the screen */
  #human_powered_snackbar {
    visibility: hidden; /* Hidden by default. Visible on click */
    min-width: 50px; /* Set a default minimum width */
    margin-left: -25px; /* Divide value of min-width by 2 */
    background-color: #333; /* Black background color */
    color: #fff; /* White text color */
    text-align: center; /* Centered text */
    border-radius: 2px; /* Rounded borders */
    padding: 16px; /* Padding */
    position: fixed; /* Sit on top of the screen */
    z-index: 1; /* Add a z-index if needed */
    left: 90%; /* Center the snackbar */
    bottom: 30px; /* 30px from the bottom */
  }

  /* Show the snackbar when clicking on a button (class added with JavaScript) */
  #human_powered_snackbar.show {
    visibility: visible; /* Show the snackbar */
    /* Add animation: Take 0.5 seconds to fade in and out the snackbar.
    However, delay the fade out process for 2.5 seconds */
    -webkit-animation: human_powered_fadein 0.5s, human_powered_fadeout 0.5s 2.5s;
    animation: human_powered_fadein 0.5s, human_powered_fadeout 0.5s 2.5s;
  }

  /* Animations to fade the snackbar in and out */
  @keyframes human_powered_fadein {
    from {bottom: 0; opacity: 0;}
    to {bottom: 30px; opacity: 1;}
  }

  @keyframes human_powered_fadeout {
    from {bottom: 30px; opacity: 1;}
    to {bottom: 0; opacity: 0;}
  }
      `;
      document.getElementsByTagName('head')[0].appendChild(element);

      var elemDiv = document.createElement('div');
      elemDiv.id = "human_powered_snackbar";
      elemDiv.textContent = "⚡"
      document.body.appendChild(elemDiv);
      elemDiv.className = "show";
      setTimeout(function(){
        elemDiv.className = elemDiv.className.replace("show", "");
      }, 3000);
    });
  }

  if (newCount === MODULUS) {
    GM_setValue('count', 0);
  }
  else {
    GM_setValue('count', newCount);
  }

  if (newCount === MODULUS) {
    GM_openInTab('http://localhost:6771');
  }
}

