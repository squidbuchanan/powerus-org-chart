/* Powerus Org Chart — Directory view (contact directory), EDITABLE.
 *
 * One flat, fully alphabetical list of everyone. Supports:
 *   • add a person      • edit a person      • delete a person
 *   • filter by division (chips)  • search (shared toolbar input)
 *
 * Edits persist to localStorage under LS_KEY and sync to the shared backend
 * via org-store.js. "RESTORE DEFAULTS" rebuilds from the seed data below.
 */
(function () {
  const LS_KEY = 'powerus_directory_v1';

  const SEED_PEOPLE = [{"first":"Shivansh","last":"Agrawal","email":"shivansh@power.us","phone":"","company":"","division":"Engineering","title":"Propulsion Engineering","location":""},{"first":"Brent","last":"Anderson","email":"brent@power.us","phone":"980-704-6546","company":"","division":"Engineering","title":"Manufacturing Manager, Charlotte 1","location":""},{"first":"Thejas","last":"Aradhya","email":"thejas@power.us","phone":"","company":"","division":"Engineering","title":"Hardware Engineer","location":""},{"first":"Jason","last":"Barahona","email":"jason21b@icloud.com","phone":"661-593-8526","company":"Kaizen","division":"Engineering","title":"Team Engineer","location":""},{"first":"Jonathan","last":"Barahona","email":"johnbarahona0211@gmial.com","phone":"323-252-1404","company":"","division":"Engineering","title":"Team Engineer","location":""},{"first":"Jim","last":"Biehl","email":"jim@power.us","phone":"609-638-9168","company":"Powerus","division":"Legal","title":"Chief Legal Officer","location":"PA"},{"first":"Amy","last":"Bove","email":"amy@power.us","phone":"908-400-5944","company":"Powerus","division":"Operations","title":"Head of Operations - EVP","location":"New Jersey"},{"first":"Dominick","last":"Brooks","email":"dbrooks@tandemdefense.com","phone":"971-409-7685","company":"Tandem","division":"Engineering","title":"Production Manager","location":""},{"first":"Michael","last":"Buchanan","email":"squid@power.us","phone":"260-271-9707","company":"Powerus","division":"Marketing","title":"Chief Brand Officer","location":""},{"first":"Sam","last":"Cousins","email":"","phone":"","company":"","division":"Operations","title":"Demo Team Lead","location":""},{"first":"Troy","last":"Curtis","email":"troy@power.us","phone":"917-515-0076","company":"Powerus","division":"Marketing","title":"Social Media/Marketing","location":"Puerto Rico"},{"first":"Rajiv","last":"Dandona","email":"rajiv@power.us","phone":"","company":"","division":"","title":"","location":""},{"first":"Lo","last":"Dominguez","email":"lo@power.us","phone":"","company":"","division":"Operations","title":"Operations Coordinator","location":""},{"first":"Ryan","last":"Donahue","email":"ryan@power.us","phone":"","company":"","division":"Marketing","title":"Social Media Manager","location":""},{"first":"Max","last":"Eshkenazy","email":"maxim@power.us","phone":"626-202-9369","company":"Kaizen","division":"Engineering","title":"VP of Technology","location":""},{"first":"Matt","last":"Farr","email":"matt@power.us","phone":"","company":"","division":"Legal","title":"Assistant General Counsel","location":""},{"first":"Andrew","last":"Fox","email":"a@power.us","phone":"212-991-8881","company":"Powerus","division":"Operations","title":"Founder & Chief Executive","location":"Miami, FL"},{"first":"Jordan","last":"Fox","email":"jordan@power.us","phone":"(718) 594-4405","company":"Powerus","division":"Finance","title":"M&A Analyst","location":"New York City"},{"first":"Ed","last":"Jordan","email":"ed@power.us","phone":"609-577-9999","company":"Powerus","division":"Finance","title":"Chief Financial Officer","location":"PA"},{"first":"Charlie","last":"Keebaugh","email":"charlie@power.us","phone":"850-797-8619","company":"Tandem","division":"Sales","title":"EVP of Sales","location":"Florida"},{"first":"Max","last":"Keebaugh","email":"max@power.us","phone":"(850) 797‑8372‬","company":"Tandem","division":"Sales","title":"Business Manager","location":""},{"first":"Ziv","last":"Marom","email":"ziv@power.us","phone":"(646) 765-6691","company":"Kaizen","division":"Engineering","title":"CTO","location":"San Francisco"},{"first":"Lily","last":"Monterroso","email":"lily@power.us","phone":"646-513-0731","company":"Powerus","division":"Operations","title":"Excecutive Assistant","location":"Guatemala"},{"first":"Nicole","last":"Nan","email":"nicole@power.us","phone":"513-432-3775","company":"Powerus","division":"Legal","title":"General Counsel","location":""},{"first":"Jake","last":"Norris","email":"jake@power.us","phone":"","company":"","division":"Finance","title":"VP, Corporate Control","location":""},{"first":"Patrick","last":"O’Hara","email":"patrick@power.us","phone":"44 7417 497795","company":"Powerus","division":"Operations","title":"Managing Director/Strategic Growth","location":"West Palm Beach, FL / UK"},{"first":"Jared","last":"Paul","email":"jared@power.us","phone":"914-329-4976","company":"Powerus","division":"Operations","title":"Logistics Manager","location":"New York, NY"},{"first":"Chris","last":"Pratt","email":"chris@power.us","phone":"","company":"","division":"","title":"SVP of Government Relations","location":""},{"first":"Nathan","last":"Reim","email":"nathan@power.us","phone":"","company":"","division":"Operations","title":"Tactical Pilot Lead","location":""},{"first":"Natalie","last":"Ross","email":"natalie@power.us","phone":"203-807-1153","company":"Tandem","division":"Engineering","title":"Executive Operations Coordinator","location":""},{"first":"Andrew","last":"Schmidt","email":"schmidt@power.us","phone":"401-954-1981","company":"Powerus","division":"Operations","title":"Chief of Staff","location":"Rhode Island"},{"first":"Jeremy","last":"Schnipke","email":"jschnipke@tandemdefense.com","phone":"419-203-3215","company":"Tandem","division":"Operations","title":"COO Tandem Group","location":""},{"first":"Michael","last":"Sinensky","email":"m@power.us","phone":"646-533-2360","company":"Powerus","division":"Marketing","title":"SVP Marketing","location":"Puerto Rico"},{"first":"Arielle","last":"Sinensky","email":"arielle@power.us","phone":"","company":"","division":"","title":"","location":""},{"first":"Aaron","last":"Smith","email":"asmith@tandemdefense.com","phone":"352-208-2355","company":"Tandem","division":"Sales","title":"Senior Inside Sales Manager/Tandem Defense","location":"West Palm Beach, FL"},{"first":"Andrew","last":"Valkenburg","email":"Avalkenburg@power.us","phone":"484-225-9132","company":"Tandem","division":"Sales","title":"CEO of Tandem Group","location":""},{"first":"Brett","last":"Velicovich","email":"brett@power.us","phone":"202-297-4322","company":"Agile","division":"Sales","title":"President and COO","location":""},{"first":"Roman","last":"Vinfield","email":"roman@power.us","phone":"917-664-7200","company":"Powerus","division":"Sales","title":"Co-Founder & Head of Sales","location":"Puerto Rico"},{"first":"Scott","last":"Wolff","email":"scott@power.us","phone":"(406) 308-9529","company":"Tandem","division":"Sales","title":"Training Coordinator","location":""}];
  const SEED_ADVISORS = [{"first":"Matt","last":"Bielski","phone":"","email":"matt@defianceetfs.com","title":"","location":""},{"first":"CQ","last":"Brown","phone":"","email":"cq@cqbrownjrstrategies.com","title":"Strategic Advisor/Government Defense","location":""},{"first":"Squid","last":"Buchanan","phone":"","email":"squidbuchanan@gmail.com","title":"","location":""},{"first":"Jesse","last":"Ferrara","phone":"","email":"jesse@aautonomy.com","title":"","location":""},{"first":"Jason","last":"Finger","phone":"(917) 509-4510","email":"jason.finger@gmail.com","title":"","location":""},{"first":"Hogan","last":"Gidley","phone":"803-727-8564","email":"hgidley@gmail.com","title":"Communications, Political & Marketing Consultant","location":""},{"first":"Steve","last":"Hoffman","phone":"","email":"mrstevehoff@me.com","title":"","location":""},{"first":"Keith","last":"Kellogg","phone":"","email":"jkeithkellogg@gmail.com","title":"","location":""},{"first":"James","last":"Lee","phone":"","email":"james@jameswgroup.com","title":"","location":""}];

  const DIV_COLORS = {
    "Operations": "#2C8A4A",
    "Engineering": "#2864C3",
    "Sales": "#C8344C",
    "Marketing": "#C1428A",
    "Finance": "#4A5A6A",
    "Legal": "#7D3FA6",
    "Unassigned": "#9A938A",
    "Advisors & Board": "#5C4FA8"
  };
  // Order divisions appear in the filter row + the edit dropdown.
  const DIV_ORDER = ["Operations","Engineering","Sales","Marketing","Finance","Legal","Advisors & Board","Unassigned"];

  const wrap = document.getElementById('directory-wrap');
  if (!wrap) return;

  function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function telHref(p){ return "tel:" + (p||"").replace(/[^+\\d]/g,""); }
  function divOf(p){ return p.division && String(p.division).trim() ? String(p.division).trim() : "Unassigned"; }
  function colorOf(div){ return DIV_COLORS[div] || DIV_COLORS.Unassigned; }
  function newId(){ return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  // ── Default state (seed) ─────────────────────────────────────────
  function buildDefaultState(){
    const entries = [];
    SEED_PEOPLE.forEach(p => entries.push({
      id: newId(), first: p.first||'', last: p.last||'', title: p.title||'',
      division: p.division||'', company: p.company||'', location: p.location||'',
      email: p.email||'', phone: p.phone||''
    }));
    SEED_ADVISORS.forEach(p => entries.push({
      id: newId(), first: p.first||'', last: p.last||'', title: p.title||'',
      division: 'Advisors & Board', company: '', location: p.location||'',
      email: p.email||'', phone: p.phone||''
    }));
    return entries;
  }

  // ── Load / save ──────────────────────────────────────────────────
  function loadState(){
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !Array.isArray(s.entries)) return null;
      // ensure ids
      s.entries.forEach(e => { if (!e.id) e.id = newId(); });
      return s.entries;
    } catch { return null; }
  }
  function saveState(){
    try { localStorage.setItem(LS_KEY, JSON.stringify({ entries: state })); } catch {}
  }

  let state = loadState() || buildDefaultState();
  let activeFilter = 'all';

  // ── Card markup ──────────────────────────────────────────────────
  function contactRow(k, val, href){
    if(!val) return '<span class="empty"><span class="ck">'+k+'</span>—</span>';
    return '<a href="'+href+'"><span class="ck">'+k+'</span>'+esc(val)+'</a>';
  }
  function cardHtml(e){
    const div = divOf(e);
    const color = colorOf(div);
    const tags = [];
    if(e.division) tags.push('<span class="dtag div" style="--c:'+color+'">'+esc(div)+'</span>');
    if(e.company)  tags.push('<span class="dtag">'+esc(e.company)+'</span>');
    if(e.location) tags.push('<span class="dtag loc">'+esc(e.location)+'</span>');
    return '<article class="dcard is-editable" style="--c:'+color+'" '+
      'data-id="'+esc(e.id)+'" '+
      'data-search="'+esc(((e.first||'')+' '+(e.last||'')+' '+(e.title||'')+' '+(e.email||'')+' '+(e.company||'')+' '+(e.location||'')+' '+div).toLowerCase())+'" '+
      'data-div="'+esc(div)+'">'+
      '<div class="dwho"><span class="dname">'+esc((e.last ? (e.last + (e.first ? ', ' + e.first : '')) : (e.first || 'Unnamed')))+'</span>'+
      (e.title?'<span class="dtitle">'+esc(e.title)+'</span>':'')+'</div>'+
      '<div class="dtags">'+tags.join('')+'</div>'+
      '<div class="dcontact">'+
        contactRow('E', e.email, 'mailto:'+e.email)+
        contactRow('P', e.phone, telHref(e.phone))+
      '</div>'+
      '<div class="dc-actions">'+
        '<button type="button" class="sc-btn" data-action="edit" title="Edit">EDIT</button>'+
        '<button type="button" class="sc-btn sc-btn-danger" data-action="delete" title="Delete">DEL</button>'+
      '</div>'+
    '</article>';
  }

  // ── Render ───────────────────────────────────────────────────────
  function render(){
    const sorted = state.slice().sort((a,b)=>
      (a.last||'').localeCompare(b.last||'') || (a.first||'').localeCompare(b.first||''));

    const present = {};
    state.forEach(e => { present[divOf(e)] = true; });
    const filterItems = [['all','All',null]];
    DIV_ORDER.forEach(d => { if(present[d]) filterItems.push([d, d==='Advisors & Board'?'Advisors':d, DIV_COLORS[d]]); });

    let html = '<div class="dir-toolbar">'+
      '<div class="dfilters" id="dir-filters">'+
      filterItems.map(([key,label,color])=>
        '<button class="ctrl-btn'+(key===activeFilter?' is-active':'')+'" data-filter="'+esc(key)+'">'+
        (color?'<span class="ddot" style="--c:'+color+'"></span>':'')+esc(label)+'</button>'
      ).join('')+
      '</div>'+
      '<div class="dir-edit-actions">'+
        '<button type="button" class="ctrl-btn" id="dir-add">+ ADD PERSON</button>'+
        '<button type="button" class="ctrl-btn" id="dir-reset" title="Discard your edits and restore the directory shipped with this chart.">RESTORE DEFAULTS</button>'+
      '</div>'+
    '</div>';
    html += '<div class="dgrid">'+ sorted.map(cardHtml).join('') +'</div>';
    html += '<div class="dempty hidden" id="dir-empty">No matches</div>';
    wrap.innerHTML = html;

    // Shared toolbar search (so the bar stays put across tabs)
    const mainSearch = document.getElementById('search');
    if (mainSearch && !mainSearch.dataset.dirBound) {
      mainSearch.addEventListener('input', applyFilters);
      mainSearch.dataset.dirBound = '1';
    }
    const dirTab = document.getElementById('view-directory');
    if (dirTab && !dirTab.dataset.dirBound) {
      dirTab.addEventListener('click', () => requestAnimationFrame(applyFilters));
      dirTab.dataset.dirBound = '1';
    }

    wrap.querySelector('#dir-filters').querySelectorAll('.ctrl-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        activeFilter = btn.dataset.filter;
        wrap.querySelectorAll('#dir-filters .ctrl-btn').forEach(b=>b.classList.toggle('is-active', b===btn));
        applyFilters();
      });
    });
    wrap.querySelector('#dir-add').addEventListener('click', () => openModalForNew());
    wrap.querySelector('#dir-reset').addEventListener('click', resetAll);

    wrap.querySelectorAll('.dcard').forEach(card => {
      const id = card.dataset.id;
      card.querySelector('[data-action="edit"]').addEventListener('click', (e)=>{ e.stopPropagation(); openModalForEdit(id); });
      card.querySelector('[data-action="delete"]').addEventListener('click', async (e)=>{
        e.stopPropagation();
        const entry = state.find(x=>x.id===id);
        const nm = entry ? ((entry.first||'')+' '+(entry.last||'')).trim() : 'this person';
        const ok = await openConfirm({ title: 'Remove '+(nm||'this person')+'?', body: 'Removes this person from the directory. Other views are unaffected.', confirm: 'REMOVE', danger: true });
        if(!ok) return;
        state = state.filter(x=>x.id!==id);
        saveState();
        render();
      });
      card.addEventListener('dblclick', ()=> openModalForEdit(id));
    });

    applyFilters();
  }

  function applyFilters(){
    const input = document.getElementById('search');
    const q = (input && input.value || '').trim().toLowerCase();
    let shown = 0;
    wrap.querySelectorAll('.dcard').forEach(card => {
      const divMatch = (activeFilter === 'all' || card.dataset.div === activeFilter);
      const hit = divMatch && (!q || card.dataset.search.indexOf(q) !== -1);
      card.classList.toggle('hidden', !hit);
      if(hit) shown++;
    });
    const e = document.getElementById('dir-empty');
    if(e) e.classList.toggle('hidden', shown !== 0);
    if (document.body.classList.contains('mode-directory')) {
      const c = document.getElementById('search-count');
      if(c) c.textContent = shown + (shown===1?' result':' results');
    }
  }

  async function resetAll(){
    const ok = await openConfirm({
      title: 'Restore the directory?',
      body: 'This discards all your directory edits — adds, deletes, and changes — and rebuilds it from the data shipped with this chart. Other views are unaffected.',
      confirm: 'RESTORE DEFAULTS', danger: true,
    });
    if(!ok) return;
    state = buildDefaultState();
    saveState();
    render();
  }

  // ── Confirm modal (reuses shared .skills-modal styles) ───────────
  const confirmModal = document.createElement('div');
  confirmModal.className = 'skills-modal';
  confirmModal.hidden = true;
  confirmModal.innerHTML =
    '<div class="skills-modal-backdrop" data-close></div>'+
    '<div class="skills-modal-panel skills-modal-panel-sm" role="alertdialog">'+
      '<div class="skills-modal-head"><h3 class="skills-modal-title" id="dir-confirm-title">Confirm</h3>'+
      '<button type="button" class="skills-modal-x" data-close aria-label="Close">×</button></div>'+
      '<p class="sm-body" id="dir-confirm-body"></p>'+
      '<div class="sm-actions"><button type="button" class="ctrl-btn" data-close>CANCEL</button>'+
      '<button type="button" class="ctrl-btn is-primary" id="dir-confirm-go">OK</button></div>'+
    '</div>';
  document.body.appendChild(confirmModal);
  confirmModal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => closeConfirm(false)));
  let confirmResolve = null;
  function openConfirm({ title, body, confirm='OK', danger=false }){
    return new Promise(resolve => {
      confirmResolve = resolve;
      confirmModal.querySelector('#dir-confirm-title').textContent = title;
      confirmModal.querySelector('#dir-confirm-body').textContent = body;
      const btn = confirmModal.querySelector('#dir-confirm-go');
      btn.textContent = confirm; btn.classList.toggle('is-danger', !!danger);
      confirmModal.hidden = false; setTimeout(()=>btn.focus(),0);
    });
  }
  function closeConfirm(v){ confirmModal.hidden = true; const r = confirmResolve; confirmResolve = null; if(r) r(v); }
  confirmModal.querySelector('#dir-confirm-go').addEventListener('click', () => closeConfirm(true));

  // ── Add / edit modal ─────────────────────────────────────────────
  const DIV_OPTIONS = ["Operations","Engineering","Sales","Marketing","Finance","Legal","Advisors & Board","Unassigned"];
  const modal = document.createElement('div');
  modal.className = 'skills-modal';
  modal.hidden = true;
  modal.innerHTML =
    '<div class="skills-modal-backdrop" data-close></div>'+
    '<form class="skills-modal-panel" id="dir-form" autocomplete="off">'+
      '<div class="skills-modal-head"><h3 class="skills-modal-title">Edit person</h3>'+
      '<button type="button" class="skills-modal-x" data-close aria-label="Close">×</button></div>'+
      '<div class="sm-row">'+
        '<label class="sm-field"><span class="sm-label">First name</span><input class="sm-input" name="first" type="text" required></label>'+
        '<label class="sm-field"><span class="sm-label">Last name</span><input class="sm-input" name="last" type="text"></label>'+
      '</div>'+
      '<label class="sm-field"><span class="sm-label">Title</span><input class="sm-input" name="title" type="text" placeholder="e.g. Head of Operations"></label>'+
      '<div class="sm-row">'+
        '<label class="sm-field"><span class="sm-label">Division</span><select class="sm-input" name="division">'+
          DIV_OPTIONS.map(d=>'<option value="'+esc(d)+'">'+esc(d)+'</option>').join('')+
        '</select></label>'+
        '<label class="sm-field"><span class="sm-label">Company</span><input class="sm-input" name="company" type="text" placeholder="e.g. Powerus"></label>'+
      '</div>'+
      '<label class="sm-field"><span class="sm-label">Location</span><input class="sm-input" name="location" type="text" placeholder="optional"></label>'+
      '<div class="sm-row">'+
        '<label class="sm-field"><span class="sm-label">Email</span><input class="sm-input" name="email" type="email" placeholder="name@power.us"></label>'+
        '<label class="sm-field"><span class="sm-label">Phone</span><input class="sm-input" name="phone" type="text" placeholder="optional"></label>'+
      '</div>'+
      '<div class="sm-actions"><button type="button" class="ctrl-btn" data-close>CANCEL</button>'+
      '<button type="submit" class="ctrl-btn is-primary" id="dir-form-save">SAVE</button></div>'+
    '</form>';
  document.body.appendChild(modal);
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => closeModal()));

  let editingId = null;
  function fillModal(e){
    const f = modal.querySelector('#dir-form');
    f.first.value = e.first||''; f.last.value = e.last||''; f.title.value = e.title||'';
    f.division.value = DIV_OPTIONS.indexOf(e.division)>=0 ? e.division : (e.division ? 'Unassigned' : 'Unassigned');
    f.company.value = e.company||''; f.location.value = e.location||'';
    f.email.value = e.email||''; f.phone.value = e.phone||'';
  }
  function openModalForEdit(id){
    const e = state.find(x=>x.id===id); if(!e) return;
    editingId = id;
    fillModal(e);
    modal.querySelector('.skills-modal-title').textContent = 'Edit person';
    modal.querySelector('#dir-form-save').textContent = 'SAVE';
    modal.hidden = false;
    modal.querySelector('input[name="first"]').focus();
  }
  function openModalForNew(){
    editingId = null;
    fillModal({ division: 'Unassigned' });
    modal.querySelector('.skills-modal-title').textContent = 'Add person';
    modal.querySelector('#dir-form-save').textContent = 'ADD';
    modal.hidden = false;
    modal.querySelector('input[name="first"]').focus();
  }
  function closeModal(){ editingId = null; modal.hidden = true; }

  modal.querySelector('#dir-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const f = ev.currentTarget;
    const data = {
      first: f.first.value.trim(), last: f.last.value.trim(), title: f.title.value.trim(),
      division: f.division.value === 'Unassigned' ? '' : f.division.value,
      company: f.company.value.trim(), location: f.location.value.trim(),
      email: f.email.value.trim(), phone: f.phone.value.trim(),
    };
    if(!data.first && !data.last){ f.first.focus(); return; }
    if(editingId){
      const e = state.find(x=>x.id===editingId);
      if(e) Object.assign(e, data);
    } else {
      state.push({ id: newId(), ...data });
    }
    saveState();
    closeModal();
    render();
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key !== 'Escape') return;
    if(!modal.hidden) closeModal();
    if(!confirmModal.hidden) closeConfirm(false);
  });

  render();
})();
