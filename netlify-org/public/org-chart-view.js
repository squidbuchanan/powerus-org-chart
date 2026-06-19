/* Powerus Org Chart — chart (pan/zoom) view
 * Renders a top-down node-link diagram into #chart on demand.
 * Supports an "Onboard only" filter that hides open/urgent/candidate/advisor
 * nodes and re-parents their kept descendants to the nearest kept ancestor.
 */

(() => {
  const chartEl = document.getElementById('chart');
  if (!window.ORG_TREE || !chartEl) return;

  // Assign stable UIDs to every node in the default tree.
  let _uidNext = 1;
  function assignUids(n) {
    if (!n._uid) n._uid = 'u' + (_uidNext++);
    (n.children || []).forEach(assignUids);
  }
  assignUids(window.ORG_TREE);

  // Persist / restore the working tree.
  function saveTree(t) { try { localStorage.setItem('powerus_chart_tree_v1', JSON.stringify(t)); } catch (_) {} }
  let workingTree = window.ORG_TREE;
  try {
    const saved = localStorage.getItem('powerus_chart_tree_v1');
    if (saved) { workingTree = JSON.parse(saved); assignUids(workingTree); }
  } catch (_) {}

  // Layout constants (CSS px, in stage coords)
  const NODE_W = 168;
  const NODE_H = 60;
  const H_GAP  = 14;
  const V_GAP  = 38;
  const PAD    = 40;
  const LEAF_INDENT = 24;
  const LEAF_ROW_H  = NODE_H + 8;

  // Status labels for tooltip-ish role line
  const STATUS = {
    exec: "Exec", onboard: "On board", urgent: "Urgent Hire",
    agent: "Agent", candidate: "Candidate", open: "Open",
    contract: "Contractor", advisor: "Advisor",
  };

  // What counts as "on board" for the filter
  const ONBOARD_TYPES = new Set(['exec', 'onboard', 'contract']);

  // ── Filter — keep only onboard people, bubble up their kept descendants
  //    so that, e.g., onboard reports of a filtered-out (Open) manager
  //    re-parent onto the nearest kept ancestor.
  function pruneToOnboard(node) {
    const childResults = (node.children || []).map(pruneToOnboard).filter(Boolean);
    // Expand pass-through (not-kept-but-has-kept-descendants) into their kids
    const flatKids = childResults.flatMap(r => r._kept ? [r] : (r.children || []));
    const kept = ONBOARD_TYPES.has(node.type);
    if (kept || flatKids.length) {
      const cloned = { ...node, children: flatKids, _kept: kept };
      // Strip layout hints — these were tuned for the full tree's
      // breadth; in the onboard subset they cause weird drift.
      delete cloned.xShift;
      delete cloned.extraDepth;
      delete cloned.childExtraDepth;
      return cloned;
    }
    return null;
  }

  // ── Render pipeline: layout pass 1, layout pass 2, draw connectors, draw nodes
  function renderChart(rootTree) {
    // Clear previous stage
    chartEl.innerHTML = '';

    // Deep-clone so we don't pollute the original tree with _w/_cx/etc
    const tree = JSON.parse(JSON.stringify(rootTree));

    // ── Layout pass 1: split children into branches (have kids) + leaves; compute subtree pixel width
    function w1(n) {
      if (!n.children || !n.children.length) {
        n._branches = []; n._leaves = [];
        n._w = NODE_W + H_GAP;
        return n._w;
      }
      n._branches = n.children.filter(c => (c.children && c.children.length > 0) || c.forceBranch);
      n._leaves   = n.children.filter(c => !((c.children && c.children.length > 0) || c.forceBranch));
      // Promote a single leaf to a branch (visual parity, no need for spine)
      if (n._leaves.length === 1) {
        n._branches = n.children.slice();
        n._leaves = [];
      }
      const branchW = n._branches.reduce((s, b) => s + w1(b), 0);
      const leafColW = n._leaves.length ? (NODE_W + LEAF_INDENT + H_GAP) : 0;
      n._w = Math.max(NODE_W + H_GAP, branchW + leafColW);
      return n._w;
    }
    w1(tree);

    // ── Layout pass 2: assign x (center), y (top)
    function pos(n, x, y) {
      if (n.extraDepth) y += n.extraDepth * (NODE_H + V_GAP);
      if (n.xShift)     x += n.xShift;
      n._cx = x + n._w / 2;
      n._y  = y;
      const extra = (n.childExtraDepth || 0) * (NODE_H + V_GAP);
      const childY = y + NODE_H + V_GAP + extra;
      let cx = x;
      (n._branches || []).forEach(b => {
        pos(b, cx, childY);
        cx += b._w;
      });
      if (n._leaves && n._leaves.length) {
        const colLeftX = cx;
        n._leafColLeft = colLeftX;
        n._leafSpineX  = colLeftX + LEAF_INDENT / 2;
        n._leaves.forEach((l, i) => {
          l._branches = []; l._leaves = [];
          l._cx = colLeftX + LEAF_INDENT + NODE_W / 2;
          l._y  = childY + i * LEAF_ROW_H;
        });
      }
    }
    pos(tree, 0, 0);

    // ── Bounds (walk both branches and leaves)
    let minX = Infinity, maxX = -Infinity, maxY = 0;
    (function b(n) {
      minX = Math.min(minX, n._cx - NODE_W / 2);
      maxX = Math.max(maxX, n._cx + NODE_W / 2);
      maxY = Math.max(maxY, n._y + NODE_H);
      (n._branches || []).forEach(b);
      (n._leaves || []).forEach(b);
    })(tree);

    const W = (maxX - minX) + PAD * 2;
    const H = maxY + PAD * 2;

    // Translate stage coords so minX,0 → PAD,PAD
    const offX = -minX + PAD;
    const offY = PAD;

    // ── Build stage
    const stage = document.createElement('div');
    stage.className = 'chart-stage';
    stage.style.width = W + 'px';
    stage.style.height = H + 'px';

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.classList.add('chart-svg');
    stage.appendChild(svg);

    function escapeHtml(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function drawConnectors(n) {
      // Branches: standard horizontal-elbow descent.
      (n._branches || []).forEach(c => {
        const x1 = n._cx + offX;
        const y1 = n._y + offY + NODE_H;
        const x2 = c._cx + offX;
        const y2 = c._y + offY;
        const my = y2 - V_GAP / 2;
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', `M${x1},${y1} L${x1},${my} L${x2},${my} L${x2},${y2}`);
        if (c.dotted) {
          path.setAttribute('stroke', 'rgba(22,22,22,0.7)');
          path.setAttribute('stroke-width', '1.4');
          path.setAttribute('stroke-dasharray', '5 4');
        } else {
          path.setAttribute('stroke', 'rgba(22,22,22,0.28)');
          path.setAttribute('stroke-width', '1');
        }
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
        drawConnectors(c);
      });
      // Lateral siblings: dashed connector(s) from named sibling(s) to the lateral node.
      const siblings = [...(n._branches || []), ...(n._leaves || [])];
      siblings.forEach(c => {
        if (!c.lateralOf) return;
        const targets = (Array.isArray(c.lateralOf) ? c.lateralOf : [c.lateralOf])
          .map(name => siblings.find(s => s.name === name))
          .filter(Boolean);
        targets.forEach(target => {
          const targetIsLeft = target._cx < c._cx;
          const tx = target._cx + offX + (targetIsLeft ?  NODE_W / 2 : -NODE_W / 2);
          const ty = target._y + offY + NODE_H / 2;
          const cx = c._cx + offX + (targetIsLeft ? -NODE_W / 2 :  NODE_W / 2);
          const cy = c._y + offY + NODE_H / 2;
          const path = document.createElementNS(svgNS, 'path');
          path.setAttribute('d', `M${tx},${ty} L${cx},${cy}`);
          path.setAttribute('stroke', 'rgba(22,22,22,0.4)');
          path.setAttribute('stroke-width', '1');
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke-dasharray', '4 3');
          svg.appendChild(path);
        });
      });
      // Leaves: vertical spine + horizontal stubs
      if (n._leaves && n._leaves.length) {
        const px = n._cx + offX;
        const py = n._y + offY + NODE_H;
        const sx = n._leafSpineX + offX;
        const my = py + V_GAP / 2;
        const lastY = n._leaves[n._leaves.length - 1]._y + offY + NODE_H / 2;
        const lead = document.createElementNS(svgNS, 'path');
        lead.setAttribute('d', `M${px},${py} L${px},${my} L${sx},${my} L${sx},${lastY}`);
        lead.setAttribute('stroke', 'rgba(22,22,22,0.28)');
        lead.setAttribute('stroke-width', '1');
        lead.setAttribute('fill', 'none');
        if (n._leaves.every(l => l.dotted)) {
          lead.setAttribute('stroke', 'rgba(22,22,22,0.7)');
          lead.setAttribute('stroke-width', '1.4');
          lead.setAttribute('stroke-dasharray', '5 4');
        }
        svg.appendChild(lead);
        n._leaves.forEach(l => {
          const leafLeftX = l._cx + offX - NODE_W / 2;
          const leafCY    = l._y + offY + NODE_H / 2;
          const stub = document.createElementNS(svgNS, 'path');
          stub.setAttribute('d', `M${sx},${leafCY} L${leafLeftX},${leafCY}`);
          stub.setAttribute('stroke', 'rgba(22,22,22,0.28)');
          stub.setAttribute('stroke-width', '1');
          stub.setAttribute('fill', 'none');
          if (l.dotted) {
            stub.setAttribute('stroke', 'rgba(22,22,22,0.7)');
            stub.setAttribute('stroke-width', '1.4');
            stub.setAttribute('stroke-dasharray', '5 4');
          }
          svg.appendChild(stub);
        });
      }
    }
    drawConnectors(tree);

    // ── Cross-tree lateral links (dotted)
    (function() {
      const all = [];
      (function walk(n) { all.push(n); [...(n._branches || []), ...(n._leaves || [])].forEach(walk); })(tree);
      all.forEach(c => {
        if (!c.lateralOf) return;
        const target = all.find(s => s.name === c.lateralOf);
        if (!target) return;
        const parentOf = (kid) => all.find(p => [...(p._branches||[]),...(p._leaves||[])].includes(kid));
        if (parentOf(c) === parentOf(target)) return;
        const tx = target._cx + offX + NODE_W / 2;
        const ty = target._y + offY + NODE_H / 2;
        const cx = c._cx + offX - NODE_W / 2;
        const cy = c._y + offY + NODE_H / 2;
        const path = document.createElementNS(svgNS, 'path');
        const midX = (tx + cx) / 2;
        path.setAttribute('d', `M${tx},${ty} L${midX},${ty} L${midX},${cy} L${cx},${cy}`);
        path.setAttribute('stroke', 'rgba(22,22,22,0.4)');
        path.setAttribute('stroke-width', '1');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '4 3');
        svg.appendChild(path);
      });
    })();

    // ── Extra parent links
    (window.ORG_EXTRA_LINKS || []).forEach(link => {
      function find(n, name) {
        if (n.name === name) return n;
        const kids = [...(n._branches || []), ...(n._leaves || [])];
        for (const k of kids) { const r = find(k, name); if (r) return r; }
        return null;
      }
      const parent = find(tree, link.parent);
      const target = find(tree, link.sharesChildrenOf);
      if (!parent || !target) return;
      const hasKids = (target._branches && target._branches.length) || (target._leaves && target._leaves.length);
      if (!hasKids) return;
      const spineY = target._y + offY + NODE_H + V_GAP / 2;
      const px = parent._cx + offX;
      const py = parent._y + offY + NODE_H;
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', `M${px},${py} L${px},${spineY} L${target._cx + offX},${spineY}`);
      path.setAttribute('stroke', 'rgba(22,22,22,0.28)');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('fill', 'none');
      if (link.dotted) path.setAttribute('stroke-dasharray', '4 3');
      svg.insertBefore(path, svg.firstChild);
    });

    // ── Extra over-the-top lateral connectors
    (window.ORG_EXTRA_LATERALS || []).forEach(link => {
      function find(n, name) {
        if (n.name === name) return n;
        const kids = [...(n._branches || []), ...(n._leaves || [])];
        for (const k of kids) { const r = find(k, name); if (r) return r; }
        return null;
      }
      const a = find(tree, link.from);
      const b = find(tree, link.to);
      if (!a || !b) return;
      const ax = a._cx + offX;
      const bx = b._cx + offX;
      const ayB = a._y + offY + NODE_H;
      const byB = b._y + offY + NODE_H;
      const yBand = Math.max(ayB, byB) + V_GAP / 2;
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', `M${ax},${ayB} L${ax},${yBand} L${bx},${yBand} L${bx},${byB}`);
      path.setAttribute('stroke', 'rgba(22,22,22,0.75)');
      path.setAttribute('stroke-width', '1.6');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-dasharray', '6 4');
      svg.appendChild(path);
    });

    function drawNode(n) {
      const card = document.createElement('div');
      card.className = 'chart-card';
      card.dataset.dept = n.dept || '';
      card.dataset.skill = (window.ORG_SKILL_OF && window.ORG_SKILL_OF(n.name)) || '';
      card.dataset.type = n.type || '';
      card.style.left = (n._cx + offX - NODE_W / 2) + 'px';
      card.style.top  = (n._y + offY) + 'px';
      card.style.width  = NODE_W + 'px';
      card.style.height = NODE_H + 'px';
      const isOpen = n.type === 'open' || n.type === 'urgent';
      card.innerHTML =
        `<div class="cc-name">${escapeHtml(isOpen ? 'Open' : n.name)}</div>` +
        `<div class="cc-role">${escapeHtml(n.role || '')}</div>`;
      if (n.dotted) card.dataset.dotted = '1';
      card.dataset.uid = n._uid || '';
      card.title = `${isOpen ? 'Open' : n.name}\n${n.role || ''}\n${STATUS[n.type] || ''}`;
      card.addEventListener('click', (e) => {
        if (!document.body.classList.contains('chart-edit-mode')) return;
        e.stopPropagation();
        document.dispatchEvent(new CustomEvent('chart:nodeclick', { detail: { uid: n._uid } }));
      });
      stage.appendChild(card);
      (n._branches || []).forEach(drawNode);
      (n._leaves || []).forEach(drawNode);
    }
    drawNode(tree);

    chartEl.appendChild(stage);

    return { stage, tree, W, H, offX, offY };
  }

  // ── State that lives across re-renders
  let current = null; // { stage, tree, W, H, offX, offY }
  let scale = 1, tx = 0, ty = 0;
  const SCALE_MIN = 0.18, SCALE_MAX = 2.5;
  let activeFilter = 'all'; // 'all' | 'onboard'
  let didFit = false;

  function apply() {
    if (!current) return;
    current.stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  function fit() {
    if (!current) return;
    const cw = chartEl.clientWidth;
    const ch = chartEl.clientHeight;
    if (!cw || !ch) return;
    const s = Math.min(cw / current.W, ch / current.H);
    scale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, s));
    tx = (cw - current.W * scale) / 2;
    ty = 16;
    apply();
  }

  function focusCEO() {
    if (!current) return;
    const cw = chartEl.clientWidth;
    const ch = chartEl.clientHeight;
    if (!cw || !ch) return;
    scale = 1.0;
    const cx = (current.tree._cx + current.offX) * scale;
    const cy = (current.tree._y  + current.offY) * scale;
    tx = cw / 2 - cx;
    ty = Math.min(48, ch * 0.12) - cy + (NODE_H * scale) / 2;
    apply();
  }

  function zoomAt(px, py, factor) {
    const newScale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale * factor));
    if (newScale === scale) return;
    tx = px - (px - tx) * (newScale / scale);
    ty = py - (py - ty) * (newScale / scale);
    scale = newScale;
    apply();
  }

  function applyFilter(mode) {
    activeFilter = mode;
    const sourceTree = mode === 'onboard'
      ? (pruneToOnboard(workingTree) || workingTree)
      : workingTree;
    current = renderChart(sourceTree);
    // Reset view on filter change
    if (chartEl.clientWidth > 0) {
      focusCEO();
    } else {
      didFit = false; // re-fit on next reveal
    }
  }

  // Initial render — full tree
  applyFilter('all');

  // ── Pointer handling: 1 finger pan, 2 finger pinch, mouse drag
  const pointers = new Map();
  let drag = null;
  let pinch = null;

  function onDown(e) {
    chartEl.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      drag = { x: e.clientX, y: e.clientY, tx, ty };
      chartEl.classList.add('is-dragging');
    } else if (pointers.size === 2) {
      drag = null;
      const pts = [...pointers.values()];
      pinch = {
        d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        cx: (pts[0].x + pts[1].x) / 2,
        cy: (pts[0].y + pts[1].y) / 2,
        startScale: scale, startTx: tx, startTy: ty,
      };
    }
  }
  function onMove(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinch) {
      const pts = [...pointers.values()];
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const factor = d / pinch.d;
      const newScale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, pinch.startScale * factor));
      const rect = chartEl.getBoundingClientRect();
      const px = pinch.cx - rect.left;
      const py = pinch.cy - rect.top;
      tx = px - (px - pinch.startTx) * (newScale / pinch.startScale);
      ty = py - (py - pinch.startTy) * (newScale / pinch.startScale);
      scale = newScale;
      apply();
    } else if (pointers.size === 1 && drag) {
      tx = drag.tx + (e.clientX - drag.x);
      ty = drag.ty + (e.clientY - drag.y);
      apply();
    }
  }
  function onUp(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) {
      drag = null;
      chartEl.classList.remove('is-dragging');
    }
  }

  chartEl.addEventListener('pointerdown', onDown);
  chartEl.addEventListener('pointermove', onMove);
  chartEl.addEventListener('pointerup', onUp);
  chartEl.addEventListener('pointercancel', onUp);

  chartEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = chartEl.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const factor = Math.pow(1.0015, -e.deltaY);
    zoomAt(px, py, factor);
  }, { passive: false });

  function center() {
    const rect = chartEl.getBoundingClientRect();
    return [rect.width / 2, rect.height / 2];
  }
  document.getElementById('zoom-in').addEventListener('click', () => {
    const [px, py] = center(); zoomAt(px, py, 1.25);
  });
  document.getElementById('zoom-out').addEventListener('click', () => {
    const [px, py] = center(); zoomAt(px, py, 0.8);
  });
  document.getElementById('zoom-fit').addEventListener('click', fit);

  // Filter toggle
  const btnAll      = document.getElementById('filter-all');
  const btnOnboard  = document.getElementById('filter-onboard');
  function setFilter(mode) {
    if (activeFilter === mode) return;
    applyFilter(mode);
    btnAll.classList.toggle('is-active', mode === 'all');
    btnOnboard.classList.toggle('is-active', mode === 'onboard');
    btnAll.setAttribute('aria-selected', mode === 'all');
    btnOnboard.setAttribute('aria-selected', mode === 'onboard');
  }
  btnAll && btnAll.addEventListener('click', () => setFilter('all'));
  btnOnboard && btnOnboard.addEventListener('click', () => setFilter('onboard'));

  // Initial fit when chart becomes visible
  function ensureFit() {
    if (didFit) return;
    if (chartEl.clientWidth === 0) return;
    focusCEO();
    didFit = true;
  }
  const ro = new ResizeObserver(() => {
    if (!didFit) ensureFit();
  });
  ro.observe(chartEl);

  // ── View toggle (list / chart / skills)
  const body = document.body;
  const btnList   = document.getElementById('view-list');
  const btnChart  = document.getElementById('view-chart');
  const btnSkills = document.getElementById('view-skills');
  const btnDir    = document.getElementById('view-directory');
  const wrap      = document.getElementById('chart-wrap');

  function setMode(mode) {
    body.classList.toggle('mode-chart',  mode === 'chart');
    body.classList.toggle('mode-list',   mode === 'list');
    body.classList.toggle('mode-skills', mode === 'skills');
    body.classList.toggle('mode-directory', mode === 'directory');
    btnList.classList.toggle('is-active',   mode === 'list');
    btnChart.classList.toggle('is-active',  mode === 'chart');
    if (btnSkills) btnSkills.classList.toggle('is-active', mode === 'skills');
    if (btnDir) btnDir.classList.toggle('is-active', mode === 'directory');
    btnList.setAttribute('aria-selected',  mode === 'list');
    btnChart.setAttribute('aria-selected', mode === 'chart');
    if (btnSkills) btnSkills.setAttribute('aria-selected', mode === 'skills');
    if (btnDir) btnDir.setAttribute('aria-selected', mode === 'directory');
    wrap.hidden = (mode !== 'chart');
    if (mode === 'chart') {
      requestAnimationFrame(() => {
        if (!didFit) ensureFit();
      });
    }
    try { localStorage.setItem('powerus.org.view', mode); } catch (_) {}
  }
  btnList.addEventListener('click',   () => setMode('list'));
  btnChart.addEventListener('click',  () => setMode('chart'));
  if (btnSkills) btnSkills.addEventListener('click', () => setMode('skills'));
  if (btnDir) btnDir.addEventListener('click', () => setMode('directory'));

  let stored = 'list';
  try { stored = localStorage.getItem('powerus.org.view') || 'list'; } catch (_) {}
  setMode(stored);

  // ── Public API for chart edit module ───────────────────────
  window.chartApi = {
    setTree(t) { workingTree = t; saveTree(t); applyFilter(activeFilter); },
    getTree()  { return workingTree; },
    rerender() { applyFilter(activeFilter); },
    defaultTree() { return window.ORG_TREE; },
  };
})();
