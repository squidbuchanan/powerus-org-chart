/* Powerus Org Chart — chart edit mode
 * Activated by the EDIT toggle in the chart controls.
 * Slide-in inspector panel: click any node → edit name/role/type/dept,
 * add a child, or delete the subtree. Changes persist to localStorage.
 */

(() => {
  // ── Tree helpers ─────────────────────────────────────────────
  function findByUid(node, uid) {
    if (node._uid === uid) return node;
    for (const c of (node.children || [])) {
      const r = findByUid(c, uid);
      if (r) return r;
    }
    return null;
  }

  function findParent(node, uid) {
    for (const c of (node.children || [])) {
      if (c._uid === uid) return node;
      const r = findParent(c, uid);
      if (r) return r;
    }
    return null;
  }

  function removeByUid(node, uid) {
    node.children = (node.children || []).filter(c => c._uid !== uid);
    node.children.forEach(c => removeByUid(c, uid));
  }

  function assignUid(node) {
    node._uid = 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    return node;
  }

  // Count direct + indirect descendants
  function subtreeSize(node) {
    return (node.children || []).reduce((s, c) => s + 1 + subtreeSize(c), 0);
  }

  // ── Inspector panel init ─────────────────────────────────────
  function init() {
    const api = window.chartApi;
    if (!api) { console.warn('[edit] chartApi not ready'); return; }

    const panel    = document.getElementById('chart-inspector');
    const btnEdit  = document.getElementById('chart-edit-btn');
    const btnClose = document.getElementById('ci-close');
    const fName    = document.getElementById('ci-name');
    const fRole    = document.getElementById('ci-role');
    const fType    = document.getElementById('ci-type');
    const fDept    = document.getElementById('ci-dept');
    const fDotted  = document.getElementById('ci-dotted');
    const btnSave  = document.getElementById('ci-save');
    const btnAdd   = document.getElementById('ci-add-child');
    const btnDel   = document.getElementById('ci-delete');
    const btnMove  = document.getElementById('ci-move-up');
    const btnMoveD = document.getElementById('ci-move-down');
    const btnRestore = document.getElementById('ci-restore');
    const ciSubCount = document.getElementById('ci-sub-count');

    if (!panel || !btnEdit) return;

    let selectedUid = null;

    // ── Panel open / close ────────────────────────────────────
    function openPanel(uid) {
      const tree = api.getTree();
      const node = findByUid(tree, uid);
      if (!node) return;
      selectedUid = uid;

      fName.value   = node.name  || '';
      fRole.value   = node.role  || '';
      fType.value   = node.type  || 'open';
      fDept.value   = node.dept  || '';
      fDotted.checked = !!node.dotted;

      const isRoot = tree._uid === uid;
      btnDel.style.display = isRoot ? 'none' : '';

      const parent = isRoot ? null : findParent(tree, uid);
      const siblings = parent ? (parent.children || []) : [];
      const idx = siblings.findIndex(c => c._uid === uid);
      if (btnMove)  btnMove.style.display  = (parent && idx > 0)                   ? '' : 'none';
      if (btnMoveD) btnMoveD.style.display = (parent && idx < siblings.length - 1) ? '' : 'none';

      const sc = subtreeSize(node);
      if (ciSubCount) ciSubCount.textContent = sc > 0 ? `${sc} report${sc !== 1 ? 's' : ''} beneath` : 'No reports';

      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
    }

    function closePanel() {
      selectedUid = null;
      panel.classList.remove('is-open');
      document.querySelectorAll('.chart-card.is-selected').forEach(c => c.classList.remove('is-selected'));
      setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 210);
    }

    function refreshPanel() {
      if (selectedUid) openPanel(selectedUid);
    }

    // ── Edit mode toggle ──────────────────────────────────────
    btnEdit.addEventListener('click', () => {
      const on = document.body.classList.toggle('chart-edit-mode');
      btnEdit.classList.toggle('is-active', on);
      btnEdit.textContent = on ? 'DONE' : 'EDIT';
      if (!on) closePanel();
    });

    btnClose.addEventListener('click', closePanel);

    // Click outside cards (on chart bg) to deselect
    document.getElementById('chart').addEventListener('pointerdown', (e) => {
      if (!document.body.classList.contains('chart-edit-mode')) return;
      if (!e.target.closest('.chart-card')) closePanel();
    });

    // ── Save ──────────────────────────────────────────────────
    btnSave.addEventListener('click', () => {
      if (!selectedUid) return;
      const tree = api.getTree();
      const node = findByUid(tree, selectedUid);
      if (!node) return;
      const newName = fName.value.trim();
      node.name   = newName || node.name;
      node.role   = fRole.value.trim();
      node.type   = fType.value;
      node.dept   = fDept.value;
      if (fDotted.checked) node.dotted = true; else delete node.dotted;
      api.setTree(tree);
      refreshPanel();
    });

    // Allow Enter key to save
    [fName, fRole].forEach(el => {
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); btnSave.click(); }
        if (e.key === 'Escape') closePanel();
      });
    });

    // ── Add child ─────────────────────────────────────────────
    btnAdd.addEventListener('click', () => {
      if (!selectedUid) return;
      const tree = api.getTree();
      const node = findByUid(tree, selectedUid);
      if (!node) return;
      if (!node.children) node.children = [];
      const child = assignUid({ name: 'Open', role: 'New Role', type: 'open', dept: node.dept || '', children: [] });
      node.children.push(child);
      api.setTree(tree);
      // Auto-select new child after rerender
      setTimeout(() => {
        openPanel(child._uid);
        document.querySelectorAll('.chart-card').forEach(c => {
          c.classList.toggle('is-selected', c.dataset.uid === child._uid);
        });
      }, 80);
    });

    // ── Delete ────────────────────────────────────────────────
    btnDel.addEventListener('click', () => {
      if (!selectedUid) return;
      const tree = api.getTree();
      const node = findByUid(tree, selectedUid);
      if (!node) return;
      const sc = subtreeSize(node);
      const msg = sc > 0
        ? `Delete "${node.name || 'Open'}" and its ${sc} report${sc !== 1 ? 's' : ''}?`
        : `Delete "${node.name || 'Open'}"?`;
      if (!confirm(msg)) return;
      removeByUid(tree, selectedUid);
      api.setTree(tree);
      closePanel();
    });

    // ── Move up / down within siblings ───────────────────────
    function moveNode(dir) {
      if (!selectedUid) return;
      const tree = api.getTree();
      const parent = findParent(tree, selectedUid);
      if (!parent) return;
      const kids = parent.children;
      const idx = kids.findIndex(c => c._uid === selectedUid);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= kids.length) return;
      [kids[idx], kids[swapIdx]] = [kids[swapIdx], kids[idx]];
      api.setTree(tree);
      setTimeout(() => {
        openPanel(selectedUid);
        document.querySelectorAll('.chart-card').forEach(c => {
          c.classList.toggle('is-selected', c.dataset.uid === selectedUid);
        });
      }, 80);
    }

    if (btnMove)  btnMove.addEventListener('click',  () => moveNode(-1));
    if (btnMoveD) btnMoveD.addEventListener('click',  () => moveNode(1));

    // ── Restore defaults ─────────────────────────────────────
    btnRestore.addEventListener('click', () => {
      if (!confirm('Restore org chart to its original structure? All edits will be lost.')) return;
      try { localStorage.removeItem('powerus_chart_tree_v1'); } catch (_) {}
      location.reload();
    });

    // ── Node click events from chart-view ────────────────────
    document.addEventListener('chart:nodeclick', (e) => {
      if (!document.body.classList.contains('chart-edit-mode')) return;
      const { uid } = e.detail;
      document.querySelectorAll('.chart-card').forEach(c => {
        c.classList.toggle('is-selected', c.dataset.uid === uid);
      });
      openPanel(uid);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
