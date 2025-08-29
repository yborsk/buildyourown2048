// js/share_link.js
(function () {
  // Which tile values we expose in the mini form
  const VALUES = [2,4,8,16,32,64,128,256,512,1024,2048];

  function el(id) { return document.getElementById(id); }
  function encode(v) { return encodeURIComponent(v); }

  function currentBaseUrl() {
    // Preserve current origin + path (no query)
    return window.location.origin + window.location.pathname;
  }

  function buildQuery(params) {
    const parts = [];
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== "") parts.push(k + "=" + encode(String(v)));
    }
    return parts.join("&");
  }

  function readFormValues() {
    const name = el("share-name").value.trim();
    const overrides = {};
    for (const v of VALUES) {
      const val = el("url-" + v).value.trim();
      if (val) overrides[v] = val;
    }
    return { name, overrides };
  }

  function applyOverridesToGame(overrides) {
    // Merge with whatever images already exist
    window.customTileImages = Object.assign({}, window.customTileImages || {}, overrides);
    // Nudge some layouts to repaint
    window.dispatchEvent(new Event("resize"));
  }

  function generateLink() {
    const { name, overrides } = readFormValues();
    const params = {};
    if (name) params.name = name;
    for (const [v, url] of Object.entries(overrides)) {
      params["tile" + v] = url;
    }

    if (document.getElementById('share-tt')?.checked) {
    params.tt = "1";
  }
    const qs = buildQuery(params);
    return currentBaseUrl() + (qs ? "?" + qs : "");
  }

  function updateOutput() {
    const link = generateLink();
    const out = el("share-output");
    const a = el("share-anchor");
    out.value = link;
    a.href = link;
    a.textContent = "Open this custom game";
  }

  function copyToClipboard() {
    const out = el("share-output");
    out.select();
    out.setSelectionRange(0, out.value.length);
    document.execCommand("copy");
    const btn = el("share-copy");
    const old = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = old), 1200);
  }

  function prefillFromParams() {
    const p = new URLSearchParams(window.location.search);
    const name = p.get("name") || "";
    if (name) el("share-name").value = name;
    for (const v of VALUES) {
      const key = "tile" + v;
      if (p.has(key)) el("url-" + v).value = p.get(key);
    }
  }

  function wireEvents() {
    el("share-form").addEventListener("input", () => {
      const { overrides } = readFormValues();
      applyOverridesToGame(overrides);
      updateOutput();
    });
    el("share-copy").addEventListener("click", copyToClipboard);
  }

  function init() {
    if (!el("share-form")) return;
    prefillFromParams();
    updateOutput();
    wireEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
