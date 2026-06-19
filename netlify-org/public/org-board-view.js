/* Powerus Org Chart — Advisory Board + Board of Directors, EDITABLE
 *
 * Renders window.ORG_ADVISORS into #adv-grid and window.ORG_BOARD into
 * #board-grid, and lets the user:
 *   • drag-and-drop cards to reorder (within a section or between the
 *     Advisory Board and the Board of Directors)
 *   • add a new member to either section
 *   • edit a member (name, role, description, prospective flag, section)
 *   • delete a member
 *
 * Mutations persist to localStorage under LS_KEY. A "RESTORE DEFAULTS"
 * action on each section restores that section from the shipped data.
 *
 * The List/Chart/Skills views are unaffected — the chart's advisor links
 * continue to read the original window.ORG_ADVISORS defaults.
 */

(() => {
  const LS_KEY = 'powerus_board_v2';

  // Section definitions — order matters (advisory first, then board).
  const SECTIONS = [
    {
      key: 'advisory',
      gridId: 'adv-grid',
      label: 'Advisory Board',
      singular: 'advisor',
      addLabel: '+ ADD ADVISOR',
      hasProspective: false,
    },
    {
      key: 'board',
      gridId: 'board-grid',
      label: 'Board of Directors',
      singular: 'board member',
      addLabel: '+ ADD MEMBER',
      hasProspective: true,
    },
  ];

  const grids = {};
  SECTIONS.forEach(s => { grids[s.key] = document.getElementById(s.gridId); });
  if (!grids.advisory && !grids.board) return;

  // ── Default state from shipped data ─────────────────────────────
  function buildDefaultState() {
    return {
      advisory: (window.ORG_ADVISORS || []).map(a => ({
        name: a.name || '', role: a.role || '', desc: a.desc || '', prospective: false,
      })),
      board: (window.ORG_BOARD || []).map(b => ({
        name: b.name || '', role: b.role || '', desc: b.desc || '', prospective: !!b.prospective,
      })),
    };
  }

  // ── Load / save persisted state ─────────────────────────────────
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !Array.isArray(s.advisory) || !Array.isArray(s.board)) return null;
      return s;
    } catch { return null; }
  }
  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
  }

  let state = loadState() || buildDefaultState();

  // ── Section header actions (ADD + RESTORE) ──────────────────────
  SECTIONS.forEach(sec => {
    const grid = grids[sec.key];
    if (!grid) return;
    const section = grid.closest('.adv-section');
    const leftCol = section && section.firstElementChild;
    if (!leftCol) return;
    const actions = document.createElement('div');
    actions.className = 'board-section-actions';
    actions.innerHTML = `
      <button type="button" class="sg-btn" data-action="add">${sec.addLabel}</button>
      <button type="button" class="sg-btn" data-action="reset" title="Discard your edits and restore the members shipped with this org chart.">RESTORE DEFAULTS</button>
    `;
    actions.querySelector('[data-action="add"]').addEventListener('click', () => openModalForNew(sec.key));
    actions.querySelector('[data-action="reset"]').addEventListener('click', () => resetSection(sec));
    leftCol.appendChild(actions);
  });

  async function resetSection(sec) {
    const ok = await openConfirm({
      title: `Restore the ${sec.label}?`,
      body: `This discards your edits to the ${sec.label} — adds, deletes, edits, and reordering — and rebuilds it from the data shipped with this chart. The other section and the List, Chart, and Skills views are unaffected.`,
      confirm: 'RESTORE DEFAULTS',
      danger: true,
    });
    if (!ok) return;
    const defaults = buildDefaultState();
    state[sec.key] = defaults[sec.key];
    saveState();
    render();
  }

  // ── Confirm modal ───────────────────────────────────────────────
  const confirmModal = document.createElement('div');
  confirmModal.className = 'skills-modal';
  confirmModal.hidden = true;
  confirmModal.innerHTML = `
    <div class="skills-modal-backdrop" data-close></div>
    <div class="skills-modal-panel skills-modal-panel-sm" role="alertdialog">
      <div class="skills-modal-head">
        <h3 class="skills-modal-title" id="board-confirm-title">Confirm</h3>
        <button type="button" class="skills-modal-x" data-close aria-label="Close">×</button>
      </div>
      <p class="sm-body" id="board-confirm-body"></p>
      <div class="sm-actions">
        <button type="button" class="ctrl-btn" data-close>CANCEL</button>
        <button type="button" class="ctrl-btn is-primary" id="board-confirm-go">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(confirmModal);
  confirmModal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => closeConfirm(false)));

  let confirmResolve = null;
  function openConfirm({ title, body, confirm = 'OK', danger = false }) {
    return new Promise(resolve => {
      confirmResolve = resolve;
      confirmModal.querySelector('#board-confirm-title').textContent = title;
      confirmModal.querySelector('#board-confirm-body').textContent = body;
      const btn = confirmModal.querySelector('#board-confirm-go');
      btn.textContent = confirm;
      btn.classList.toggle('is-danger', !!danger);
      confirmModal.hidden = false;
      setTimeout(() => btn.focus(), 0);
    });
  }
  function closeConfirm(value) {
    confirmModal.hidden = true;
    const r = confirmResolve;
    confirmResolve = null;
    if (r) r(value);
  }
  confirmModal.querySelector('#board-confirm-go').addEventListener('click', () => closeConfirm(true));

  // ── Add / edit modal ────────────────────────────────────────────
  const modal = document.createElement('div');
  modal.className = 'skills-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="skills-modal-backdrop" data-close></div>
    <form class="skills-modal-panel" id="board-form" autocomplete="off">
      <div class="skills-modal-head">
        <h3 class="skills-modal-title">Edit member</h3>
        <button type="button" class="skills-modal-x" data-close aria-label="Close">×</button>
      </div>
      <label class="sm-field">
        <span class="sm-label">Name</span>
        <input class="sm-input" name="name" type="text" required>
      </label>
      <label class="sm-field">
        <span class="sm-label">Role</span>
        <input class="sm-input" name="role" type="text" placeholder="e.g. Advisory Board Member">
      </label>
      <label class="sm-field">
        <span class="sm-label">Description / domain</span>
        <input class="sm-input" name="desc" type="text" placeholder="optional — area of expertise">
      </label>
      <label class="sm-field">
        <span class="sm-label">Section</span>
        <select class="sm-input" name="section">
          ${SECTIONS.map(s => `<option value="${s.key}">${s.label}</option>`).join('')}
        </select>
      </label>
      <label class="sm-check" id="board-prospective-wrap">
        <input type="checkbox" name="prospective">
        <span>Prospective member (not yet confirmed)</span>
      </label>
      <div class="sm-actions">
        <button type="button" class="ctrl-btn" data-close>CANCEL</button>
        <button type="submit" class="ctrl-btn is-primary" id="board-form-save">SAVE</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => closeModal()));

  const sectionSelect = modal.querySelector('select[name="section"]');
  const prospectiveWrap = modal.querySelector('#board-prospective-wrap');
  // Prospective flag only matters for sections that support it.
  function syncProspectiveVisibility() {
    const sec = SECTIONS.find(s => s.key === sectionSelect.value);
    prospectiveWrap.style.display = (sec && sec.hasProspective) ? 'flex' : 'none';
  }
  sectionSelect.addEventListener('change', syncProspectiveVisibility);

  let editing = null; // { section, idx } for edit, { newInSection } for add

  function openModalForEdit(sectionKey, idx) {
    editing = { section: sectionKey, idx };
    const p = state[sectionKey][idx];
    fillModal({ ...p, section: sectionKey });
    modal.querySelector('.skills-modal-title').textContent = 'Edit member';
    modal.querySelector('#board-form-save').textContent = 'SAVE';
    modal.hidden = false;
    modal.querySelector('input[name="name"]').focus();
  }
  function openModalForNew(sectionKey) {
    editing = { newInSection: sectionKey };
    fillModal({ name: '', role: '', desc: '', prospective: false, section: sectionKey });
    modal.querySelector('.skills-modal-title').textContent = 'Add member';
    modal.querySelector('#board-form-save').textContent = 'ADD';
    modal.hidden = false;
    modal.querySelector('input[name="name"]').focus();
  }
  function closeModal() { editing = null; modal.hidden = true; }
  function fillModal({ name, role, desc, prospective, section }) {
    const f = modal.querySelector('#board-form');
    f.name.value = name || '';
    f.role.value = role || '';
    f.desc.value = desc || '';
    f.section.value = section;
    f.prospective.checked = !!prospective;
    syncProspectiveVisibility();
  }

  modal.querySelector('#board-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const targetKey = f.section.value;
    const sec = SECTIONS.find(s => s.key === targetKey);
    const data = {
      name: f.name.value.trim(),
      role: f.role.value.trim(),
      desc: f.desc.value.trim(),
      prospective: (sec && sec.hasProspective) ? f.prospective.checked : false,
    };
    if (!data.name) { f.name.focus(); return; }
    if (!state[targetKey]) return;

    if (editing && 'idx' in editing) {
      // Remove from source, then insert into target.
      state[editing.section].splice(editing.idx, 1);
      if (editing.section === targetKey) {
        state[targetKey].splice(editing.idx, 0, data);
      } else {
        state[targetKey].push(data);
      }
    } else if (editing && 'newInSection' in editing) {
      state[targetKey].push(data);
    }
    saveState();
    closeModal();
    render();
  });

  // Esc closes whichever modal is open.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modal.hidden) closeModal();
    if (!confirmModal.hidden) closeConfirm(false);
  });

  // ── Drag and drop ───────────────────────────────────────────────
  let drag = null; // { fromSection, fromIdx }

  function attachCardDnD(cardEl, sectionKey, idx) {
    cardEl.draggable = true;
    cardEl.addEventListener('dragstart', (e) => {
      drag = { fromSection: sectionKey, fromIdx: idx };
      cardEl.classList.add('is-dragging');
      try { e.dataTransfer.setData('text/plain', `${sectionKey}:${idx}`); } catch {}
      e.dataTransfer.effectAllowed = 'move';
    });
    cardEl.addEventListener('dragend', () => {
      cardEl.classList.remove('is-dragging');
      drag = null;
      clearDropIndicators();
    });
    cardEl.addEventListener('dragover', (e) => {
      if (!drag) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const rect = cardEl.getBoundingClientRect();
      const before = (e.clientX - rect.left) < rect.width / 2;
      clearDropIndicators();
      cardEl.classList.add(before ? 'drop-before' : 'drop-after');
    });
    cardEl.addEventListener('dragleave', (e) => {
      if (e.target === cardEl) cardEl.classList.remove('drop-before', 'drop-after');
    });
    cardEl.addEventListener('drop', (e) => {
      if (!drag) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = cardEl.getBoundingClientRect();
      const before = (e.clientX - rect.left) < rect.width / 2;
      const insertIdx = idx + (before ? 0 : 1);
      applyMove(drag.fromSection, drag.fromIdx, sectionKey, insertIdx);
      drag = null;
    });
  }

  function attachGridDnD(gridEl, sectionKey) {
    gridEl.addEventListener('dragover', (e) => {
      if (!drag) return;
      if (e.target.closest('.adv-card')) return; // cards handle their own
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      gridEl.classList.add('is-drop-target');
    });
    gridEl.addEventListener('dragleave', (e) => {
      if (e.target === gridEl) gridEl.classList.remove('is-drop-target');
    });
    gridEl.addEventListener('drop', (e) => {
      if (!drag) return;
      if (e.target.closest('.adv-card')) return;
      e.preventDefault();
      gridEl.classList.remove('is-drop-target');
      applyMove(drag.fromSection, drag.fromIdx, sectionKey, state[sectionKey].length);
      drag = null;
    });
  }

  function clearDropIndicators() {
    document.querySelectorAll('.adv-card.drop-before, .adv-card.drop-after')
      .forEach(el => el.classList.remove('drop-before', 'drop-after'));
    document.querySelectorAll('.adv-grid.is-drop-target')
      .forEach(el => el.classList.remove('is-drop-target'));
  }

  function applyMove(fromSection, fromIdx, toSection, toIdx) {
    if (fromSection === toSection && (toIdx === fromIdx || toIdx === fromIdx + 1)) {
      clearDropIndicators();
      return;
    }
    const person = state[fromSection].splice(fromIdx, 1)[0];
    if (!person) return;
    // Moving INTO advisory drops the prospective flag (advisory has no such concept).
    const toSec = SECTIONS.find(s => s.key === toSection);
    if (toSec && !toSec.hasProspective) person.prospective = false;
    let adjIdx = toIdx;
    if (fromSection === toSection && fromIdx < toIdx) adjIdx = toIdx - 1;
    state[toSection].splice(adjIdx, 0, person);
    saveState();
    render();
  }

  // ── Render ──────────────────────────────────────────────────────
  function render() {
    SECTIONS.forEach(sec => {
      const grid = grids[sec.key];
      if (!grid) return;
      grid.innerHTML = '';
      const list = state[sec.key] || [];

      list.forEach((p, i) => {
        const c = document.createElement('div');
        c.className = 'adv-card is-editable' + (p.prospective ? ' is-prospective' : '');
        c.dataset.section = sec.key;
        c.dataset.idx = i;

        const grab = document.createElement('span');
        grab.className = 'bc-grab';
        grab.setAttribute('aria-hidden', 'true');
        grab.innerHTML = '⋮⋮';
        c.appendChild(grab);

        const nm = document.createElement('div');
        nm.className = 'nm';
        nm.textContent = p.name;
        c.appendChild(nm);

        const rl = document.createElement('div');
        rl.className = 'rl';
        rl.textContent = p.role || '';
        if (p.prospective) {
          const tag = document.createElement('span');
          tag.className = 'prospective-tag';
          tag.textContent = 'Prospective';
          rl.appendChild(document.createTextNode(' '));
          rl.appendChild(tag);
        }
        c.appendChild(rl);

        if (p.desc) {
          const ds = document.createElement('div');
          ds.className = 'ds';
          ds.textContent = p.desc;
          c.appendChild(ds);
        }

        const actions = document.createElement('div');
        actions.className = 'bc-actions';
        actions.innerHTML = `
          <button type="button" class="sc-btn" data-action="edit" title="Edit">EDIT</button>
          <button type="button" class="sc-btn sc-btn-danger" data-action="delete" title="Delete">DELETE</button>
        `;
        actions.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
          e.stopPropagation();
          openModalForEdit(sec.key, i);
        });
        actions.querySelector('[data-action="delete"]').addEventListener('click', async (e) => {
          e.stopPropagation();
          const ok = await openConfirm({
            title: `Remove ${p.name || 'this member'}?`,
            body: `Removes this card from the ${sec.label}. The List, Chart, and Skills views are unaffected.`,
            confirm: 'REMOVE',
            danger: true,
          });
          if (!ok) return;
          state[sec.key].splice(i, 1);
          saveState();
          render();
        });
        c.appendChild(actions);

        c.addEventListener('dblclick', () => openModalForEdit(sec.key, i));
        attachCardDnD(c, sec.key, i);
        grid.appendChild(c);
      });
    });
  }

  // Grid-level drop targets are attached once (grids persist across renders).
  SECTIONS.forEach(sec => { if (grids[sec.key]) attachGridDnD(grids[sec.key], sec.key); });

  render();
})();
