// js/url_theme.js
(function () {
  // Which tile values we support via URL params (extend if your build supports more)
  const supportedValues = [2,4,8,16,32,64,128,256,512,1024,2048,4096,8192];

  function readOverridesFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const overrides = Object.create(null);

    for (const v of supportedValues) {
      const key = "tile" + v;             // e.g. tile2, tile4, tile8
      if (params.has(key)) {
        // If repeated, prefer last
        const url = params.getAll(key).slice(-1)[0];

        // Very light safety: only allow http/https/data URLs
        try {
          const u = new URL(url, window.location.href);
          if (u.protocol === "http:" || u.protocol === "https:" || u.protocol === "data:") {
            overrides[v] = u.href;
          }
        } catch (_) {
          // ignore bad URLs
        }
      }
    }
    return overrides;
  }

  function applyFromLocation() {
    const o = readOverridesFromQuery();
    // Expose globally so the actuator can use it
    if (Object.keys(o).length) {
      window.customTileImages = o;
    }
  }

  // Make callable from index.html (or anywhere before GameManager is constructed)
  window.UrlTheme = { applyFromLocation };
})();
