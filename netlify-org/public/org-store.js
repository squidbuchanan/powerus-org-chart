/* Powerus Org Chart — shared-state sync layer.
 *
 * Goal: one source of truth. Every visitor loads the same org document, and
 * every edit anyone makes is saved back so the next person (or a refresh) sees
 * the latest state.
 *
 * How: a tiny Netlify Function (netlify/functions/org-state) backed by Netlify
 * Blobs stores a single JSON document of the three localStorage keys the app
 * already uses. This shim:
 *   1. On load, pulls the shared document and primes localStorage BEFORE the
 *      view scripts read it (they load state synchronously, so this must be
 *      synchronous too).
 *   2. Wraps localStorage writes for those keys and pushes them back (debounced).
 *
 * Off Netlify (local file, preview, offline) the network call fails silently and
 * the app keeps working against plain localStorage — no behavior change.
 */
(function () {
  var API = '/.netlify/functions/org-state';
  // The exact keys each editable view persists to.
  var KEYS = [
    'powerus_chart_tree_v1', // List / Chart structure
    'powerus_skills_v5',     // Skills view
    'powerus_board_v2',      // Advisory Board + Board of Directors
    'powerus_directory_v1'   // Directory contacts
  ];

  // ── 1. Prime localStorage from the shared document (synchronous on purpose) ──
  var primed = false;
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', API, false); // sync: must complete before the views read LS
    xhr.send();
    if (xhr.status === 200 && xhr.responseText) {
      var doc = JSON.parse(xhr.responseText);
      var keys = (doc && doc.keys) || {};
      KEYS.forEach(function (k) {
        if (typeof keys[k] === 'string') {
          // setItem is not wrapped yet, so this does not trigger a push.
          localStorage.setItem(k, keys[k]);
        }
      });
      primed = true;
    }
  } catch (e) {
    /* Not on Netlify / offline — localStorage stays authoritative. */
  }

  // ── 2. Mirror future writes back to the shared document (debounced) ──
  var origSet = localStorage.setItem.bind(localStorage);
  var origRemove = localStorage.removeItem.bind(localStorage);
  var timer = null;
  var status = null;

  function setStatus(state) {
    // Lightweight, optional save indicator (shown only if the element exists).
    var el = document.getElementById('org-save-status');
    if (!el) return;
    if (state === 'saving') { el.textContent = 'Saving…'; el.dataset.state = 'saving'; }
    else if (state === 'saved') { el.textContent = 'All changes saved'; el.dataset.state = 'saved'; }
    else if (state === 'error') { el.textContent = 'Offline — saved locally'; el.dataset.state = 'error'; }
  }

  function push() {
    var payload = { keys: {} };
    KEYS.forEach(function (k) {
      var v = localStorage.getItem(k);
      if (v != null) payload.keys[k] = v;
    });
    setStatus('saving');
    try {
      fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).then(function (r) {
        setStatus(r && r.ok ? 'saved' : 'error');
      }).catch(function () { setStatus('error'); });
    } catch (e) { setStatus('error'); }
  }

  function schedulePush() {
    clearTimeout(timer);
    timer = setTimeout(push, 600);
  }

  localStorage.setItem = function (key, val) {
    origSet(key, val);
    if (KEYS.indexOf(key) !== -1) schedulePush();
  };
  localStorage.removeItem = function (key) {
    origRemove(key);
    if (KEYS.indexOf(key) !== -1) schedulePush();
  };

  // Flush any pending save if the user leaves quickly.
  window.addEventListener('pagehide', function () {
    if (timer) { clearTimeout(timer); push(); }
  });

  window.orgStore = { push: push, KEYS: KEYS, primed: primed };
})();
