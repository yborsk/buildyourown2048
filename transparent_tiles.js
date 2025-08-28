(function () {
  // --- helpers ------------------------------------------------------------
  function qs(sel) { return document.querySelector(sel); }
  function getParam(name) {
    var u = new URL(window.location.href);
    return u.searchParams.get(name);
  }
  function setParam(name, value) {
    var u = new URL(window.location.href);
    if (value === null || value === undefined || value === '' || value === '0') {
      u.searchParams.delete(name);
    } else {
      u.searchParams.set(name, value);
    }
    history.replaceState(null, '', u.toString());
  }

  // Switch elements
  var ttSwitch      = qs('#tt-switch');
  var ttLabel       = qs('#tt-label');
  var bgSwitch      = qs('#bg-highest-switch');   // existing BG switch
  var bgLabel       = qs('#bg-label');
  var numbersSwitch = qs('#numbers-switch');
  var numbersLabel  = qs('#numbers-label');

  // Body flags
  function applyTransparent(on) {
    document.body.classList.toggle('tiles-transparent', !!on);
    // Transparent tiles should not show numbers (per requirement)
    document.body.classList.toggle('hide-numbers', !!on);

    // Reflect UI
    if (ttSwitch) ttSwitch.checked = !!on;
    if (ttLabel)  ttLabel.textContent = 'Transparent tiles' + (on ? ' (on)' : '');

    // --- Override the other options when tt=1 -----------------------------
    if (on) {
      // Turn off Highest-tile Background and lock the UI look
      if (bgSwitch) {
        bgSwitch.checked = false;
        // If your BG script uses a class to activate, remove it:
        var gc = document.querySelector('.game-container');
        if (gc) {
          gc.classList.remove('byobg-on'); // matches your bg code’s class
          gc.style.removeProperty('--byo-bg-image');
        }
      }
      if (bgLabel) bgLabel.textContent = 'BG: Off';

      // Turn off numbers (switch off and hide via CSS)
      if (numbersSwitch) numbersSwitch.checked = false;
    }
  }

  function applyNumbers(on) {
    // Only effective if Transparent Tiles is NOT forcing the override
    var ttOn = !!document.body.classList.contains('tiles-transparent');
    var shouldHide = ttOn ? true : !on;
    document.body.classList.toggle('hide-numbers', shouldHide);
    if (numbersSwitch) numbersSwitch.checked = !shouldHide;
  }

  // --- Initial load from URL ----------------------------------------------
  var ttParam = getParam('tt');         // "1" enables transparent tiles
  var ttOn = ttParam === '1';
  applyTransparent(ttOn);

  // Default: show numbers unless hidden by tt
  if (!ttOn) applyNumbers(true);

  // --- Wire up events ------------------------------------------------------
  if (ttSwitch) {
    ttSwitch.addEventListener('change', function (e) {
      var on = !!e.target.checked;
      setParam('tt', on ? '1' : '0');
      applyTransparent(on);
    });
  }

  if (numbersSwitch) {
    numbersSwitch.addEventListener('change', function (e) {
      // If tt is on, it overrides — force switch to Off and keep numbers hidden.
      if (document.body.classList.contains('tiles-transparent')) {
        numbersSwitch.checked = false;
        return; // override in effect
      }
      applyNumbers(!!e.target.checked);
    });
  }
})();
