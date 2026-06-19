/* Powerus Org Chart — skills (capability) view, EDITABLE
 *
 * Renders ORG_SKILLS into #skills-wrap as a grid of cards grouped by skill,
 * and lets the user:
 *   • drag-and-drop cards between groups (or reorder within a group)
 *   • add a new person to any group
 *   • edit a person (name, role, type, dept)
 *   • delete a person
 *
 * Mutations persist to localStorage under POWERUS_SKILLS_LS_KEY. A "RESET"
 * action in the skills-view toolbar restores defaults from ORG_SKILLS.
 *
 * The bundled default state is computed once from window.ORG_SKILLS by
 * resolving each entry against ORG_TREE / ORG_ADVISORS (same logic as the
 * read-only view used to use). After that, the persisted state is the
 * source of truth — edits don't have to refer back to the tree.
 */

(() => {
  const LS_KEY = 'powerus_skills_v4';

  const SKILL_SLUG = window.ORG_SKILL_SLUG || (s => (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''));

  const TYPE_OPTIONS = [
    ['onboard',   'On board'],
    ['exec',      'Exec'],
    ['urgent',    'Urgent hire'],
    ['candidate', 'Candidate'],
    ['agent',     'Agent'],
    ['open',      'Open'],
    ['contract',  'Contractor'],
    ['advisor',   'Advisor'],
  ];

  // Dept options — pulled from departments referenced in ORG_TREE, plus a couple of common labels.
  const DEPT_OPTIONS = [
    ['',          '—'],
    ['office',    'Office'],
    ['growth',    'Growth'],
    ['sales',     'Sales'],
    ['strategy',  'Strategy'],
    ['marketing', 'Marketing'],
    ['ops',       'Operations'],
    ['tech',      'Technology'],
    ['mfg',       'Manufacturing'],
    ['finance',   'Finance'],
    ['legal',     'Legal'],
    ['rd',        'R&D'],
    ['agh',       'AGH'],
  ];

  const wrap = document.getElementById('skills-wrap');
  if (!wrap) return;

  // ── Default state from ORG_SKILLS ───────────────────────────────
  function buildDefaultState() {
    // Flatten ORG_TREE for name → person lookup
    const byName = new Map();
    (function walk(n) {
      if (!n) return;
      if (n.name) byName.set(n.name.toLowerCase(), n);
      (n.children || []).forEach(walk);
    })(window.ORG_TREE);
    (window.ORG_ADVISORS || []).forEach(a => {
      if (!byName.has(a.name.toLowerCase())) {
        byName.set(a.name.toLowerCase(), { name: a.name, role: a.role, type: 'advisor', dept: 'office' });
      }
    });

    function resolve(p) {
      const m = byName.get((p.name||'').toLowerCase());
      if (m) return { name: m.name, role: m.role || '', type: m.type || 'onboard', dept: m.dept || '' };
      if (p.fallback) return { name: p.name, role: p.fallback.role || '', type: p.fallback.type || 'onboard', dept: p.fallback.dept || '' };
      return { name: p.name, role: '—', type: 'onboard', dept: '' };
    }

    return {
      groups: (window.ORG_SKILLS || []).map(g => ({
        id: SKILL_SLUG(g.group),
        label: g.group,
        people: g.people.map(resolve),
      })),
    };
  }

  // ── Load / save persisted state ─────────────────────────────────
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !Array.isArray(s.groups)) return null;
      return s;
    } catch { return null; }
  }
  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
  }

  let state = loadState() || buildDefaultState();

  // ── Toolbar (RESET) ─────────────────────────────────────────────
  // Inject a small bar above the grid; only visible on the skills tab
  // (the body.mode-skills class scopes it).
  const bar = document.createElement('div');
  bar.className = 'skills-bar';
  bar.innerHTML = `
    <div class="skills-bar-actions">
      <button class="ctrl-btn" id="skills-add-group" type="button">+ ADD GROUP</button>
      <button class="ctrl-btn" id="skills-reset" type="button" title="Discard your edits and restore the skill groups and people that were shipped with this org chart.">RESTORE DEFAULTS</button>
    </div>
  `;
  wrap.parentNode.insertBefore(bar, wrap);

  bar.querySelector('#skills-reset').addEventListener('click', async () => {
    const ok = await openConfirm({
      title: 'Restore default skills layout?',
      body: 'This discards every edit on this tab — adds, deletes, renames, drag-reorders, and any new groups — and rebuilds the skill groups and people from the org data shipped with this chart. The List and Chart views are unaffected.',
      confirm: 'RESTORE DEFAULTS',
      danger: true,
    });
    if (!ok) return;
    state = buildDefaultState();
    saveState();
    render();
  });
  bar.querySelector('#skills-add-group').addEventListener('click', async () => {
    const label = await openPrompt({
      title: 'New skill group',
      label: 'Group name',
      saveLabel: 'ADD GROUP',
      validate: (v) => state.groups.some(g => g.id === SKILL_SLUG(v)) ? 'A group with that name already exists.' : null,
    });
    if (!label) return;
    state.groups.push({ id: SKILL_SLUG(label), label, people: [] });
    saveState();
    render();
  });

  // ── Confirm modal (replaces native confirm()) ──────────────────
  const confirmModal = document.createElement('div');
  confirmModal.className = 'skills-modal';
  confirmModal.hidden = true;
  confirmModal.innerHTML = `
    <div class="skills-modal-backdrop" data-close></div>
    <div class="skills-modal-panel skills-modal-panel-sm" role="alertdialog">
      <div class="skills-modal-head">
        <h3 class="skills-modal-title" id="skills-confirm-title">Confirm</h3>
        <button type="button" class="skills-modal-x" data-close aria-label="Close">×</button>
      </div>
      <p class="sm-body" id="skills-confirm-body"></p>
      <div class="sm-actions">
        <button type="button" class="ctrl-btn" data-close>CANCEL</button>
        <button type="button" class="ctrl-btn is-primary" id="skills-confirm-go">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(confirmModal);
  confirmModal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => closeConfirm(false)));

  let confirmResolve = null;
  function openConfirm({ title, body, confirm = 'OK', danger = false }) {
    return new Promise(resolve => {
      confirmResolve = resolve;
      confirmModal.querySelector('#skills-confirm-title').textContent = title;
      confirmModal.querySelector('#skills-confirm-body').textContent = body;
      const btn = confirmModal.querySelector('#skills-confirm-go');
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
  confirmModal.querySelector('#skills-confirm-go').addEventListener('click', () => closeConfirm(true));

  // ── Text-prompt modal (used for Add/Rename group) ───────────────
  const promptModal = document.createElement('div');
  promptModal.className = 'skills-modal';
  promptModal.hidden = true;
  promptModal.innerHTML = `
    <div class="skills-modal-backdrop" data-close></div>
    <form class="skills-modal-panel skills-modal-panel-sm" id="skills-prompt-form" autocomplete="off">
      <div class="skills-modal-head">
        <h3 class="skills-modal-title" id="skills-prompt-title">Name</h3>
        <button type="button" class="skills-modal-x" data-close aria-label="Close">×</button>
      </div>
      <label class="sm-field">
        <span class="sm-label" id="skills-prompt-label">Label</span>
        <input class="sm-input" id="skills-prompt-input" type="text" required>
      </label>
      <div class="sm-error" id="skills-prompt-error" hidden></div>
      <div class="sm-actions">
        <button type="button" class="ctrl-btn" data-close>CANCEL</button>
        <button type="submit" class="ctrl-btn is-primary" id="skills-prompt-save">SAVE</button>
      </div>
    </form>
  `;
  document.body.appendChild(promptModal);
  promptModal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => closePrompt()));

  let promptResolve = null;
  function openPrompt({ title, label, initial = '', saveLabel = 'SAVE', validate }) {
    return new Promise(resolve => {
      promptResolve = resolve;
      promptModal.querySelector('#skills-prompt-title').textContent = title;
      promptModal.querySelector('#skills-prompt-label').textContent = label;
      const input = promptModal.querySelector('#skills-prompt-input');
      input.value = initial;
      promptModal.querySelector('#skills-prompt-save').textContent = saveLabel;
      promptModal.querySelector('#skills-prompt-error').hidden = true;
      promptModal._validate = validate;
      promptModal.hidden = false;
      setTimeout(() => { input.focus(); input.select(); }, 0);
    });
  }
  function closePrompt(value = null) {
    promptModal.hidden = true;
    const r = promptResolve;
    promptResolve = null;
    if (r) r(value);
  }
  promptModal.querySelector('#skills-prompt-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const value = promptModal.querySelector('#skills-prompt-input').value.trim();
    if (!value) return;
    const err = promptModal._validate && promptModal._validate(value);
    if (err) {
      const ee = promptModal.querySelector('#skills-prompt-error');
      ee.textContent = err;
      ee.hidden = false;
      return;
    }
    closePrompt(value);
  });

  // ── Modal for add / edit ────────────────────────────────────────
  const modal = document.createElement('div');
  modal.className = 'skills-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="skills-modal-backdrop" data-close></div>
    <form class="skills-modal-panel" id="skills-form" autocomplete="off">
      <div class="skills-modal-head">
        <h3 class="skills-modal-title">Edit person</h3>
        <button type="button" class="skills-modal-x" data-close aria-label="Close">×</button>
      </div>
      <label class="sm-field">
        <span class="sm-label">Name</span>
        <input class="sm-input" name="name" type="text" required>
      </label>
      <label class="sm-field">
        <span class="sm-label">Role</span>
        <input class="sm-input" name="role" type="text">
      </label>
      <div class="sm-row">
        <label class="sm-field">
          <span class="sm-label">Status</span>
          <select class="sm-input" name="type">
            ${TYPE_OPTIONS.map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}
          </select>
        </label>
        <label class="sm-field">
          <span class="sm-label">Department</span>
          <select class="sm-input" name="dept">
            ${DEPT_OPTIONS.map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}
          </select>
        </label>
      </div>
      <label class="sm-field">
        <span class="sm-label">Skill group</span>
        <select class="sm-input" name="group"></select>
      </label>
      <div class="sm-actions">
        <button type="button" class="ctrl-btn" data-close>CANCEL</button>
        <button type="submit" class="ctrl-btn is-primary" id="skills-form-save">SAVE</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => closeModal()));

  let editing = null; // { groupIdx, personIdx } or { newInGroupIdx } or null

  function openModalForEdit(groupIdx, personIdx) {
    editing = { groupIdx, personIdx };
    const p = state.groups[groupIdx].people[personIdx];
    fillModal({ name: p.name, role: p.role, type: p.type, dept: p.dept || '', group: state.groups[groupIdx].id });
    modal.querySelector('.skills-modal-title').textContent = 'Edit person';
    modal.querySelector('#skills-form-save').textContent = 'SAVE';
    modal.hidden = false;
    modal.querySelector('input[name="name"]').focus();
  }
  function openModalForNew(groupIdx) {
    editing = { newInGroupIdx: groupIdx };
    fillModal({ name: '', role: '', type: 'onboard', dept: '', group: state.groups[groupIdx].id });
    modal.querySelector('.skills-modal-title').textContent = 'Add person';
    modal.querySelector('#skills-form-save').textContent = 'ADD';
    modal.hidden = false;
    modal.querySelector('input[name="name"]').focus();
  }
  function closeModal() { editing = null; modal.hidden = true; }
  function fillModal({ name, role, type, dept, group }) {
    const f = modal.querySelector('#skills-form');
    f.name.value = name || '';
    f.role.value = role || '';
    f.type.value = type || 'onboard';
    f.dept.value = dept || '';
    const sel = f.group;
    sel.innerHTML = state.groups.map(g => `<option value="${g.id}">${g.label}</option>`).join('');
    sel.value = group;
  }

  modal.querySelector('#skills-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const data = {
      name: f.name.value.trim(),
      role: f.role.value.trim(),
      type: f.type.value,
      dept: f.dept.value,
    };
    if (!data.name) { f.name.focus(); return; }
    const targetGroupIdx = state.groups.findIndex(g => g.id === f.group.value);
    if (targetGroupIdx < 0) return;

    if (editing && 'personIdx' in editing) {
      // Edit existing — remove from source, insert into target group
      const src = state.groups[editing.groupIdx];
      src.people.splice(editing.personIdx, 1);
      // If we just removed from the same group that's the target, position becomes the original; otherwise append.
      if (editing.groupIdx === targetGroupIdx) {
        state.groups[targetGroupIdx].people.splice(editing.personIdx, 0, data);
      } else {
        state.groups[targetGroupIdx].people.push(data);
      }
    } else if (editing && 'newInGroupIdx' in editing) {
      state.groups[targetGroupIdx].people.push(data);
    }
    saveState();
    closeModal();
    render();
  });

  // Esc closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modal.hidden) closeModal();
    if (!promptModal.hidden) closePrompt();
    if (!confirmModal.hidden) closeConfirm(false);
  });

  // ── Drag and drop ───────────────────────────────────────────────
  let drag = null; // { fromGroup, fromIdx, ghost }

  function attachDnD(cardEl, groupIdx, personIdx, gridEl) {
    cardEl.draggable = true;
    cardEl.addEventListener('dragstart', (e) => {
      drag = { fromGroup: groupIdx, fromIdx: personIdx };
      cardEl.classList.add('is-dragging');
      try { e.dataTransfer.setData('text/plain', `${groupIdx}:${personIdx}`); } catch {}
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
      const before = (e.clientY - rect.top) < rect.height / 2;
      showDropIndicatorOnCard(cardEl, before);
    });
    cardEl.addEventListener('dragleave', (e) => {
      // Only clear when leaving the card entirely
      if (e.target === cardEl) hideDropIndicatorOnCard(cardEl);
    });
    cardEl.addEventListener('drop', (e) => {
      if (!drag) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = cardEl.getBoundingClientRect();
      const before = (e.clientY - rect.top) < rect.height / 2;
      // Compute insertion index relative to TARGET group:
      const targetGroupIdx = state.groups.findIndex(g => g.id === cardEl.closest('.skill-group').dataset.groupId);
      let insertIdx = personIdx + (before ? 0 : 1);
      applyMove(drag.fromGroup, drag.fromIdx, targetGroupIdx, insertIdx);
      drag = null;
    });
  }

  function attachGridDnD(gridEl, groupIdx) {
    gridEl.addEventListener('dragover', (e) => {
      if (!drag) return;
      // Only handle if not over a card (cards handle their own dragover)
      if (e.target.closest('.skill-card')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      gridEl.classList.add('is-drop-target');
    });
    gridEl.addEventListener('dragleave', (e) => {
      if (e.target === gridEl) gridEl.classList.remove('is-drop-target');
    });
    gridEl.addEventListener('drop', (e) => {
      if (!drag) return;
      if (e.target.closest('.skill-card')) return; // card handled it
      e.preventDefault();
      gridEl.classList.remove('is-drop-target');
      // Append to end of target group
      applyMove(drag.fromGroup, drag.fromIdx, groupIdx, state.groups[groupIdx].people.length);
      drag = null;
    });
  }

  function showDropIndicatorOnCard(cardEl, before) {
    clearDropIndicators();
    cardEl.classList.add(before ? 'drop-before' : 'drop-after');
  }
  function hideDropIndicatorOnCard(cardEl) {
    cardEl.classList.remove('drop-before', 'drop-after');
  }
  function clearDropIndicators() {
    wrap.querySelectorAll('.drop-before, .drop-after').forEach(el => el.classList.remove('drop-before', 'drop-after'));
    wrap.querySelectorAll('.is-drop-target').forEach(el => el.classList.remove('is-drop-target'));
  }

  function applyMove(fromGroup, fromIdx, toGroup, toIdx) {
    if (fromGroup === toGroup && (toIdx === fromIdx || toIdx === fromIdx + 1)) {
      // No-op (dropped onto itself)
      clearDropIndicators();
      return;
    }
    const person = state.groups[fromGroup].people.splice(fromIdx, 1)[0];
    if (!person) return;
    // Adjust target idx if same group and target is after source
    let adjIdx = toIdx;
    if (fromGroup === toGroup && fromIdx < toIdx) adjIdx = toIdx - 1;
    state.groups[toGroup].people.splice(adjIdx, 0, person);
    saveState();
    render();
  }

  // ── Group head actions: delete group, rename ────────────────────
  async function deleteGroup(idx) {
    const g = state.groups[idx];
    if (!g) return;
    const ok = await openConfirm({
      title: `Delete group "${g.label}"?`,
      body: g.people.length
        ? `This removes the group and all ${g.people.length} ${g.people.length === 1 ? 'person' : 'people'} in it from the skills view.`
        : `This removes the empty group from the skills view.`,
      confirm: 'DELETE',
      danger: true,
    });
    if (!ok) return;
    state.groups.splice(idx, 1);
    saveState();
    render();
  }
  async function renameGroup(idx) {
    const g = state.groups[idx];
    if (!g) return;
    const next = await openPrompt({
      title: 'Rename group',
      label: 'Group name',
      initial: g.label,
      saveLabel: 'SAVE',
    });
    if (!next) return;
    g.label = next;
    // Keep id stable so persisted colors / data-attrs don't shift on rename
    saveState();
    render();
  }

  // ── Render ──────────────────────────────────────────────────────
  function render() {
    wrap.innerHTML = '';
    let total = 0;
    state.groups.forEach((group, gi) => {
      const section = document.createElement('section');
      section.className = 'skill-group';
      section.dataset.groupId = group.id;

      const head = document.createElement('div');
      head.className = 'skill-group-head';
      head.innerHTML = `
        <h3 class="skill-group-title" data-action="rename" title="Click to rename">${escapeHtml(group.label)}</h3>
        <span class="skill-group-count mono">${group.people.length} ${group.people.length === 1 ? 'PERSON' : 'PEOPLE'}</span>
        <div class="skill-group-actions">
          <button type="button" class="sg-btn" data-action="add" title="Add person">+ ADD</button>
          <button type="button" class="sg-btn sg-btn-danger" data-action="delete-group" title="Delete group">DELETE GROUP</button>
        </div>
      `;
      head.querySelector('[data-action="add"]').addEventListener('click', () => openModalForNew(gi));
      head.querySelector('[data-action="delete-group"]').addEventListener('click', () => deleteGroup(gi));
      head.querySelector('[data-action="rename"]').addEventListener('click', () => renameGroup(gi));
      section.appendChild(head);

      const grid = document.createElement('div');
      grid.className = 'skill-grid';
      attachGridDnD(grid, gi);

      group.people.forEach((p, pi) => {
        total++;
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.dataset.dept = p.dept || '';
        card.dataset.skill = group.id;
        card.dataset.type = p.type || '';
        card.dataset.name = (p.name || '').toLowerCase();
        card.dataset.role = (p.role || '').toLowerCase();

        const drag = document.createElement('span');
        drag.className = 'sc-grab';
        drag.setAttribute('aria-hidden', 'true');
        drag.innerHTML = '⋮⋮';
        card.appendChild(drag);

        const isOpen = (p.type === 'open' || p.type === 'urgent');
        const nm = document.createElement('div');
        nm.className = 'sc-name' + (isOpen ? ' is-open' : '');
        nm.textContent = isOpen ? 'Open' : (p.name || '');
        const rl = document.createElement('div');
        rl.className = 'sc-role';
        rl.textContent = p.role || '';
        card.appendChild(nm);
        card.appendChild(rl);

        const actions = document.createElement('div');
        actions.className = 'sc-actions';
        actions.innerHTML = `
          <button type="button" class="sc-btn" data-action="edit" title="Edit">EDIT</button>
          <button type="button" class="sc-btn sc-btn-danger" data-action="delete" title="Delete">DELETE</button>
        `;
        actions.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
          e.stopPropagation();
          openModalForEdit(gi, pi);
        });
        actions.querySelector('[data-action="delete"]').addEventListener('click', async (e) => {
          e.stopPropagation();
          const label = isOpen ? `Open — ${p.role || 'role'}` : (p.name || 'this person');
          const ok = await openConfirm({
            title: `Remove ${label}?`,
            body: `Removes this card from "${group.label}". The List and Chart views are unaffected.`,
            confirm: 'REMOVE',
            danger: true,
          });
          if (!ok) return;
          state.groups[gi].people.splice(pi, 1);
          saveState();
          render();
        });
        card.appendChild(actions);

        // Double-click to edit
        card.addEventListener('dblclick', () => openModalForEdit(gi, pi));

        attachDnD(card, gi, pi, grid);
        grid.appendChild(card);
      });

      section.appendChild(grid);
      wrap.appendChild(section);
    });

    // ── Search hook: dim non-matching skill cards ───────────────
    const input = document.getElementById('search');
    if (input) {
      applySearch(input.value);
    }

    window.__SKILLS_TOTAL = total;

    // Update the name-to-skill map used by other views so left-bars
    // reflect post-edit assignments after a Skills change.
    rebuildSkillOfMap();
  }

  function rebuildSkillOfMap() {
    const map = new Map();
    state.groups.forEach(g => g.people.forEach(p => { if (p.name) map.set(p.name, g.id); }));
    window.ORG_SKILL_OF = (name) => name ? (map.get(name) || '') : '';
  }

  // ── Search ──────────────────────────────────────────────────────
  function applySearch(q) {
    q = (q || '').trim().toLowerCase();
    wrap.querySelectorAll('.skill-card').forEach(c => {
      c.classList.remove('is-match', 'is-dim');
      c.querySelectorAll('mark').forEach(m => m.replaceWith(document.createTextNode(m.textContent)));
      c.querySelector('.sc-name').normalize();
      c.querySelector('.sc-role').normalize();
      if (!q) return;
      const matches = (c.dataset.name || '').includes(q) || (c.dataset.role || '').includes(q) || (c.dataset.dept || '').includes(q);
      if (matches) {
        c.classList.add('is-match');
        highlight(c.querySelector('.sc-name'), q);
        highlight(c.querySelector('.sc-role'), q);
      } else {
        c.classList.add('is-dim');
      }
    });
    wrap.querySelectorAll('.skill-group').forEach(g => {
      const anyHit = g.querySelector('.skill-card.is-match');
      g.style.display = (q && !anyHit) ? 'none' : '';
    });
  }
  function highlight(el, q) {
    const txt = el.textContent;
    const i = txt.toLowerCase().indexOf(q);
    if (i < 0) return;
    el.textContent = '';
    el.append(document.createTextNode(txt.slice(0, i)));
    const m = document.createElement('mark');
    m.textContent = txt.slice(i, i + q.length);
    el.append(m);
    el.append(document.createTextNode(txt.slice(i + q.length)));
  }
  const searchInput = document.getElementById('search');
  if (searchInput) {
    let t = 0;
    searchInput.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => applySearch(searchInput.value), 80);
    });
  }

  // ── Utilities ───────────────────────────────────────────────────
  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ── Boot ────────────────────────────────────────────────────────
  render();
})();
