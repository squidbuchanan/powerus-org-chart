/* Powerus Org Chart — renderer
 * Reads window.ORG_TREE / ORG_ADVISORS, builds a collapsible tree,
 * wires search + controls. No deps. */

(() => {
  const tree = window.ORG_TREE;
  const advisors = window.ORG_ADVISORS || [];
  const board = window.ORG_BOARD || [];
  const STATUSES = {
    exec:      "Exec",
    onboard:   "On board",
    urgent:    "Urgent Hire",
    agent:     "Agent",
    candidate: "Candidate",
    open:      "Open",
    contract:  "Contractor",
    advisor:   "Advisor",
  };

  // ── Stats ────────────────────────────────────────────────────
  let totalCount = 0, openCount = 0, maxDepth = 0;
  (function tally(n, d) {
    totalCount++;
    if (n.type === "open" || n.type === "urgent") openCount++;
    if (d > maxDepth) maxDepth = d;
    (n.children || []).forEach(c => tally(c, d + 1));
  })(tree, 1);
  document.getElementById('head-count').textContent = `${totalCount} POSITIONS`;
  document.getElementById('head-open').textContent  = `${openCount} OPEN`;
  document.getElementById('head-tiers').textContent = `${maxDepth} TIERS`;

  // ── Advisory board + Board of Directors ─────────────────────
  // Rendered (and made editable) by org-board-view.js. The default
  // data still lives in window.ORG_ADVISORS / window.ORG_BOARD; the
  // chart view's advisor links continue to read those defaults.

  // ── Tree render ──────────────────────────────────────────────
  const treeEl = document.getElementById('tree');

  function descendantCount(n) {
    let k = 0;
    (n.children || []).forEach(c => { k += 1 + descendantCount(c); });
    return k;
  }

  function makeNode(n, depth) {
    const li = document.createElement('li');
    li.className = 'node';
    li.dataset.depth = depth;
    // open by default for top 2 tiers
    if (depth <= 2) li.classList.add('is-open');

    const row = document.createElement('div');
    row.className = 'row';

    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.dept = n.dept || '';
    card.dataset.skill = (window.ORG_SKILL_OF && window.ORG_SKILL_OF(n.name)) || '';
    card.dataset.type = n.type || '';
    if (n.dotted) card.dataset.dotted = '1';
    card.dataset.name = (n.name || '').toLowerCase();
    card.dataset.role = (n.role || '').toLowerCase();

    const swatch = document.createElement('div');
    swatch.className = 'swatch';

    const body = document.createElement('div');
    body.className = 'body';
    const nm = document.createElement('div');
    nm.className = 'name' + ((n.type === 'open' || n.type === 'urgent') ? ' is-open' : '');
    nm.textContent = (n.type === 'open' || n.type === 'urgent') ? `Open — ${n.role}` : n.name;
    const rl = document.createElement('div');
    rl.className = 'role';
    rl.textContent = (n.type === 'open' || n.type === 'urgent') ? (n.dept ? n.dept.toUpperCase() : '') : n.role;
    body.appendChild(nm); body.appendChild(rl);

    const right = document.createElement('div');
    right.className = 'right';
    const dCount = descendantCount(n);
    if (dCount > 0) {
      const pill = document.createElement('span');
      pill.className = 'count-pill';
      pill.textContent = `${dCount}`;
      right.appendChild(pill);
    }
    const badge = document.createElement('span');
    badge.className = 'badge ' + (n.type || 'open');
    badge.textContent = STATUSES[n.type] || n.type || '—';
    right.appendChild(badge);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toggle' + ((n.children && n.children.length) ? '' : ' is-empty');
    toggle.setAttribute('aria-label', 'Toggle subtree');
    toggle.innerHTML = '<span class="ic">›</span>';
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      li.classList.toggle('is-open');
    });

    card.appendChild(swatch);
    card.appendChild(body);
    card.appendChild(right);

    // Tap card to also toggle (mobile-friendly)
    card.addEventListener('click', () => {
      if (n.children && n.children.length) li.classList.toggle('is-open');
    });

    row.appendChild(toggle);
    row.appendChild(card);
    li.appendChild(row);

    if (n.children && n.children.length) {
      const ul = document.createElement('ul');
      ul.className = 'branch children';
      n.children.forEach(c => ul.appendChild(makeNode(c, depth + 1)));
      li.appendChild(ul);
    }
    return li;
  }
  treeEl.appendChild(makeNode(tree, 1));

  // ── Controls ─────────────────────────────────────────────────
  const allNodes = () => Array.from(treeEl.querySelectorAll('.node'));
  document.getElementById('btn-expand').addEventListener('click', () => {
    allNodes().forEach(n => n.classList.add('is-open'));
  });
  document.getElementById('btn-collapse').addEventListener('click', () => {
    allNodes().forEach((n, i) => {
      const d = parseInt(n.dataset.depth, 10);
      if (d > 1) n.classList.remove('is-open');
      else n.classList.add('is-open');
    });
  });

  const hideBtn = document.getElementById('btn-hide-open');
  hideBtn.addEventListener('click', () => {
    const on = hideBtn.classList.toggle('is-active');
    hideBtn.textContent = on ? 'SHOW OPEN' : 'HIDE OPEN';
    document.body.classList.toggle('hide-open', on);
  });
  // CSS for hide-open mode
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    body.hide-open .card[data-type="open"],
    body.hide-open .card[data-type="urgent"] { display: none; }
    body.hide-open .node:has(> .row > .card[data-type="open"]),
    body.hide-open .node:has(> .row > .card[data-type="urgent"]) { display: none; }
  `;
  document.head.appendChild(styleEl);

  // ── Search ───────────────────────────────────────────────────
  const input = document.getElementById('search');
  const countEl = document.getElementById('search-count');
  const clearEl = document.getElementById('search-clear');

  function clearMarks() {
    treeEl.querySelectorAll('.card.is-match, .card.is-dim').forEach(c => c.classList.remove('is-match', 'is-dim'));
    treeEl.querySelectorAll('mark').forEach(m => {
      const t = document.createTextNode(m.textContent);
      m.replaceWith(t);
    });
    // Normalize text nodes
    treeEl.querySelectorAll('.name, .role').forEach(el => el.normalize());
  }
  function highlightText(el, q) {
    const txt = el.textContent;
    const i = txt.toLowerCase().indexOf(q);
    if (i < 0) return;
    const before = txt.slice(0, i), match = txt.slice(i, i + q.length), after = txt.slice(i + q.length);
    el.textContent = '';
    el.append(document.createTextNode(before));
    const m = document.createElement('mark');
    m.textContent = match;
    el.append(m);
    el.append(document.createTextNode(after));
  }

  function runSearch() {
    const q = input.value.trim().toLowerCase();
    clearMarks();
    const dirMode = document.body.classList.contains('mode-directory');
    if (!q) {
      if (!dirMode) countEl.textContent = '';
      clearEl.hidden = true;
      return;
    }
    clearEl.hidden = false;
    if (dirMode) return;  // Directory view owns its own results + count
    let hits = 0;
    treeEl.querySelectorAll('.node').forEach(n => {
      const card = n.querySelector(':scope > .row > .card');
      const nm = card.dataset.name || '';
      const rl = card.dataset.role || '';
      const dept = card.dataset.dept || '';
      const matches = nm.includes(q) || rl.includes(q) || dept.includes(q);
      if (matches) {
        hits++;
        card.classList.add('is-match');
        highlightText(card.querySelector('.name'), q);
        highlightText(card.querySelector('.role'), q);
        // Open all ancestors
        let p = n.parentElement;
        while (p && p !== treeEl) {
          if (p.classList && p.classList.contains('node')) p.classList.add('is-open');
          p = p.parentElement;
        }
      } else {
        card.classList.add('is-dim');
      }
    });
    countEl.textContent = `${hits} MATCH${hits === 1 ? '' : 'ES'}`;
  }

  let t = 0;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(runSearch, 80); });
  clearEl.addEventListener('click', () => { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); });
})();
