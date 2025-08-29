(function () {
  var body        = document.body;
  var form        = document.getElementById('share-form');
  var out         = document.getElementById('share-output');
  var anchor      = document.getElementById('share-anchor');
  var ttSwitch    = document.getElementById('share-tt');   // Create-section switch

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
    applyToOutputs(!!on);
    setLocationParam('tt', !!on);
  }

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
