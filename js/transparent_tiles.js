(function () {
  var body        = document.body;
  var form        = document.getElementById('share-form');
  var out         = document.getElementById('share-output');
  var anchor      = document.getElementById('share-anchor');
  var ttSwitch    = document.getElementById('share-tt');   // Create-section switch

  function getPositionKey(tileEl) {
  // class contains "tile-position-X-Y"
  var m = (tileEl.className || '').match(/tile-position-(\d+)-(\d+)/);
  return m ? (m[1] + 'x' + m[2]) : null;
}

  
  function setParamOnString(urlString, name, on) {
    try {
      var u = new URL(urlString, location.origin);
      if (on) u.searchParams.set(name, '1'); else u.searchParams.delete(name);
      return u.toString();
    } catch(e) { return urlString; }
  }
  function setLocationParam(name, on) {
    try {
      var u = new URL(window.location.href);
      if (on) u.searchParams.set(name, '1'); else u.searchParams.delete(name);
      history.replaceState(null, '', u.toString());
    } catch (e) {}
  }
  function applyToOutputs(ttOn) {
    if (out && out.value)      out.value   = setParamOnString(out.value, 'tt', ttOn);
    if (anchor && anchor.href) anchor.href = setParamOnString(anchor.href, 'tt', ttOn);
  }

  function applyTransparent(on) {
    body.classList.toggle('tiles-transparent', !!on);

  if (on) {
    // Force nums=0 when transparent mode is on
    var numsSwitch = document.getElementById('share-nums');
    if (numsSwitch) numsSwitch.checked = false;
  }
    
    applyToOutputs(!!on);
    setLocationParam('tt', !!on);
  }

    // === Hide duplicate tiles during merges in transparent mode ===
  function hideDuplicateTilesAtSamePosition() {
    if (!document.body.classList.contains('tiles-transparent')) return;

    var tiles = Array.from(document.querySelectorAll('.tile-container .tile'));
    var byPos = new Map();

    tiles.forEach(function (el) {
      var key = getPositionKey(el);
      if (!key) return;
      if (!byPos.has(key)) byPos.set(key, []);
      byPos.get(key).push(el);
    });

    byPos.forEach(function (list) {
      if (list.length <= 1) return;
      var keep = list.find(el => el.className.indexOf('tile-merged') !== -1)
              || list.find(el => el.className.indexOf('tile-new') !== -1)
              || list[list.length - 1];
      list.forEach(function (el) {
        el.style.visibility = (el === keep) ? '' : 'hidden';
      });
    });
  }

  // Attach an observer to run it after DOM updates
  (function () {
    var wrap = document.querySelector('.tile-container');
    if (!wrap) return;
    var pending = false;
    var obs = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        hideDuplicateTilesAtSamePosition();
      });
    });
    obs.observe(wrap, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    hideDuplicateTilesAtSamePosition();
  })();


  // Init from URL (?tt=1)
  var params = new URLSearchParams(location.search);
  var ttOn = params.get('tt') === '1';
  if (ttSwitch) ttSwitch.checked = ttOn;
  applyTransparent(ttOn);

  // React to UI + form changes
  if (ttSwitch) {
    ttSwitch.addEventListener('change', function () {
      applyTransparent(ttSwitch.checked);
    });
  }
  if (form) {
    var sync = function(){ applyToOutputs(ttSwitch && ttSwitch.checked); };
    form.addEventListener('input',  function(){ setTimeout(sync, 0); });
    form.addEventListener('change', function(){ setTimeout(sync, 0); });
  }
})();
