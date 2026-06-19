/* Powerus Org Chart — Directory view (contact directory from member spreadsheet)
 * Self-contained: own search + division filters, renders into #directory-wrap.
 * Mirrors the standalone Powerus Directory.html. */
(function () {
  const PEOPLE = [{"first":"Shivansh","last":"Agrawal","email":"shivansh@power.us","phone":"","company":"","division":"Engineering","title":"Propulsion Engineering","location":""},{"first":"Brent","last":"Anderson","email":"brent@power.us","phone":"980-704-6546","company":"","division":"Engineering","title":"Manufacturing Manager, Charlotte 1","location":""},{"first":"Thejas","last":"Aradhya","email":"thejas@power.us","phone":"","company":"","division":"Engineering","title":"Hardware Engineer","location":""},{"first":"Jason","last":"Barahona","email":"jason21b@icloud.com","phone":"661-593-8526","company":"Kaizen","division":"Engineering","title":"Team Engineer","location":""},{"first":"Jonathan","last":"Barahona","email":"johnbarahona0211@gmial.com","phone":"323-252-1404","company":"","division":"Engineering","title":"Team Engineer","location":""},{"first":"Jim","last":"Biehl","email":"jim@power.us","phone":"609-638-9168","company":"Powerus","division":"Legal","title":"Chief Legal Officer","location":"PA"},{"first":"Amy","last":"Bove","email":"amy@power.us","phone":"908-400-5944","company":"Powerus","division":"Operations","title":"Head of Operations - EVP","location":"New Jersey"},{"first":"Dominick","last":"Brooks","email":"dbrooks@tandemdefense.com","phone":"971-409-7685","company":"Tandem","division":"Engineering","title":"Production Manager","location":""},{"first":"Michael","last":"Buchanan","email":"squid@power.us","phone":"260-271-9707","company":"Powerus","division":"Marketing","title":"Chief Brand Officer","location":""},{"first":"Sam","last":"Cousins","email":"","phone":"","company":"","division":"Operations","title":"Demo Team Lead","location":""},{"first":"Troy","last":"Curtis","email":"troy@power.us","phone":"917-515-0076","company":"Powerus","division":"Marketing","title":"Social Media/Marketing","location":"Puerto Rico"},{"first":"Rajiv","last":"Dandona","email":"rajiv@power.us","phone":"","company":"","division":"","title":"","location":""},{"first":"Lo","last":"Dominguez","email":"lo@power.us","phone":"","company":"","division":"Operations","title":"Operations Coordinator","location":""},{"first":"Ryan","last":"Donahue","email":"ryan@power.us","phone":"","company":"","division":"Marketing","title":"Social Media Manager","location":""},{"first":"Max","last":"Eshkenazy","email":"maxim@power.us","phone":"626-202-9369","company":"Kaizen","division":"Engineering","title":"VP of Technology","location":""},{"first":"Matt","last":"Farr","email":"matt@power.us","phone":"","company":"","division":"Legal","title":"Assistant General Counsel","location":""},{"first":"Andrew","last":"Fox","email":"a@power.us","phone":"212-991-8881","company":"Powerus","division":"Operations","title":"Founder & Chief Executive","location":"Miami, FL"},{"first":"Jordan","last":"Fox","email":"jordan@power.us","phone":"(718) 594-4405","company":"Powerus","division":"Finance","title":"M&A Analyst","location":"New York City"},{"first":"Ed","last":"Jordan","email":"ed@power.us","phone":"609-577-9999","company":"Powerus","division":"Finance","title":"Chief Financial Officer","location":"PA"},{"first":"Charlie","last":"Keebaugh","email":"charlie@power.us","phone":"850-797-8619","company":"Tandem","division":"Sales","title":"EVP of Sales","location":"Florida"},{"first":"Max","last":"Keebaugh","email":"max@power.us","phone":"(850) 797‑8372‬","company":"Tandem","division":"Sales","title":"Business Manager","location":""},{"first":"Ziv","last":"Marom","email":"ziv@power.us","phone":"(646) 765-6691","company":"Kaizen","division":"Engineering","title":"CTO","location":"San Francisco"},{"first":"Lily","last":"Monterroso","email":"lily@power.us","phone":"646-513-0731","company":"Powerus","division":"Operations","title":"Excecutive Assistant","location":"Guatemala"},{"first":"Nicole","last":"Nan","email":"nicole@power.us","phone":"513-432-3775","company":"Powerus","division":"Legal","title":"General Counsel","location":""},{"first":"Jake","last":"Norris","email":"jake@power.us","phone":"","company":"","division":"Finance","title":"VP, Corporate Control","location":""},{"first":"Patrick","last":"O’Hara","email":"patrick@power.us","phone":"44 7417 497795","company":"Powerus","division":"Operations","title":"Managing Director/Strategic Growth","location":"West Palm Beach, FL / UK"},{"first":"Jared","last":"Paul","email":"jared@power.us","phone":"914-329-4976","company":"Powerus","division":"Operations","title":"Logistics Manager","location":"New York, NY"},{"first":"Chris","last":"Pratt","email":"chris@power.us","phone":"","company":"","division":"","title":"SVP of Government Relations","location":""},{"first":"Nathan","last":"Reim","email":"nathan@power.us","phone":"","company":"","division":"Operations","title":"Tactical Pilot Lead","location":""},{"first":"Natalie","last":"Ross","email":"natalie@power.us","phone":"203-807-1153","company":"Tandem","division":"Engineering","title":"Executive Operations Coordinator","location":""},{"first":"Andrew","last":"Schmidt","email":"schmidt@power.us","phone":"401-954-1981","company":"Powerus","division":"Operations","title":"Chief of Staff","location":"Rhode Island"},{"first":"Jeremy","last":"Schnipke","email":"jschnipke@tandemdefense.com","phone":"419-203-3215","company":"Tandem","division":"Operations","title":"COO Tandem Group","location":""},{"first":"Michael","last":"Sinensky","email":"m@power.us","phone":"646-533-2360","company":"Powerus","division":"Marketing","title":"SVP Marketing","location":"Puerto Rico"},{"first":"Arielle","last":"Sinensky","email":"arielle@power.us","phone":"","company":"","division":"","title":"","location":""},{"first":"Aaron","last":"Smith","email":"asmith@tandemdefense.com","phone":"352-208-2355","company":"Tandem","division":"Sales","title":"Senior Inside Sales Manager/Tandem Defense","location":"West Palm Beach, FL"},{"first":"Andrew","last":"Valkenburg","email":"Avalkenburg@power.us","phone":"484-225-9132","company":"Tandem","division":"Sales","title":"CEO of Tandem Group","location":""},{"first":"Brett","last":"Velicovich","email":"brett@power.us","phone":"202-297-4322","company":"Agile","division":"Sales","title":"President and COO","location":""},{"first":"Roman","last":"Vinfield","email":"roman@power.us","phone":"917-664-7200","company":"Powerus","division":"Sales","title":"Co-Founder & Head of Sales","location":"Puerto Rico"},{"first":"Scott","last":"Wolff","email":"scott@power.us","phone":"(406) 308-9529","company":"Tandem","division":"Sales","title":"Training Coordinator","location":""}];
  const ADVISORS = [{"first":"Matt","last":"Bielski","phone":"","email":"matt@defianceetfs.com","title":"","location":""},{"first":"CQ","last":"Brown","phone":"","email":"cq@cqbrownjrstrategies.com","title":"Strategic Advisor/Government Defense","location":""},{"first":"Squid","last":"Buchanan","phone":"","email":"squidbuchanan@gmail.com","title":"","location":""},{"first":"Jesse","last":"Ferrara","phone":"","email":"jesse@aautonomy.com","title":"","location":""},{"first":"Jason","last":"Finger","phone":"(917) 509-4510","email":"jason.finger@gmail.com","title":"","location":""},{"first":"Hogan","last":"Gidley","phone":"803-727-8564","email":"hgidley@gmail.com","title":"Communications, Political & Marketing Consultant","location":""},{"first":"Steve","last":"Hoffman","phone":"","email":"mrstevehoff@me.com","title":"","location":""},{"first":"Keith","last":"Kellogg","phone":"","email":"jkeithkellogg@gmail.com","title":"","location":""},{"first":"James","last":"Lee","phone":"","email":"james@jameswgroup.com","title":"","location":""}];

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
  const DIV_ORDER = ["Operations","Engineering","Sales","Marketing","Finance","Legal","Unassigned"];

  const wrap = document.getElementById('directory-wrap');
  if (!wrap) return;

  function divOf(p){ return p.division && p.division.trim() ? p.division.trim() : "Unassigned"; }
  function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function telHref(p){ return "tel:" + (p||"").replace(/[^+\d]/g,""); }

  function contactRow(k, val, href){
    if(!val) return '<span class="empty"><span class="ck">'+k+'</span>—</span>';
    return '<a href="'+href+'"><span class="ck">'+k+'</span>'+esc(val)+'</a>';
  }

  function cardHtml(p, color){
    const div = divOf(p);
    const tags = [];
    if(p.division) tags.push('<span class="dtag div" style="--c:'+color+'">'+esc(p.division)+'</span>');
    if(p.company)  tags.push('<span class="dtag">'+esc(p.company)+'</span>');
    if(p.location) tags.push('<span class="dtag loc">'+esc(p.location)+'</span>');
    return '<article class="dcard" style="--c:'+color+'" '+
      'data-search="'+esc((p.first+' '+p.last+' '+(p.title||'')+' '+(p.email||'')+' '+(p.company||'')+' '+(p.location||'')+' '+div).toLowerCase())+'" '+
      'data-div="'+esc(div)+'">'+
      '<div class="dwho"><span class="dname">'+esc(p.first+' '+p.last)+'</span>'+
      (p.title?'<span class="dtitle">'+esc(p.title)+'</span>':'')+'</div>'+
      (tags.length?'<div class="dtags">'+tags.join('')+'</div>':'')+
      '<div class="dcontact">'+
        contactRow('E', p.email, 'mailto:'+p.email)+
        contactRow('P', p.phone, telHref(p.phone))+
      '</div>'+
    '</article>';
  }

  let activeFilter = 'all';

  function build(){
    const groups = {};
    PEOPLE.forEach(p => { const d = divOf(p); (groups[d] = groups[d] || []).push(p); });
    const adv = ADVISORS.slice().sort((a,b)=> (a.last||'').localeCompare(b.last||''));

    // toolbar
    const filterItems = [['all','All',null]];
    DIV_ORDER.forEach(d => { if(groups[d] && groups[d].length) filterItems.push([d,d,DIV_COLORS[d]]); });
    if(adv.length) filterItems.push(['Advisors & Board','Advisors',DIV_COLORS['Advisors & Board']]);

    let html = '<div class="dir-toolbar">'+
      '<div class="dfilters" id="dir-filters">'+
      filterItems.map(([key,label,color])=>
        '<button class="ctrl-btn'+(key===activeFilter?' is-active':'')+'" data-filter="'+esc(key)+'">'+
        (color?'<span class="ddot" style="--c:'+color+'"></span>':'')+esc(label)+'</button>'
      ).join('')+
      '</div></div>';

    // groups
    DIV_ORDER.forEach(d => {
      if(!groups[d] || !groups[d].length) return;
      const color = DIV_COLORS[d];
      const list = groups[d].slice().sort((a,b)=> (a.last||'').localeCompare(b.last||''));
      html += '<section class="dgroup" data-group="'+esc(d)+'">'+
        '<div class="dgroup-head"><span class="dbar" style="--c:'+color+'"></span>'+
        '<h3>'+esc(d)+'</h3><span class="dn">'+list.length+'</span><span class="drule"></span></div>'+
        '<div class="dgrid">'+ list.map(p=>cardHtml(p,color)).join('') +'</div>'+
      '</section>';
    });
    const advColor = DIV_COLORS["Advisors & Board"];
    html += '<section class="dgroup" data-group="Advisors & Board">'+
      '<div class="dgroup-head"><span class="dbar" style="--c:'+advColor+'"></span>'+
      '<h3>Advisors &amp; Board</h3><span class="dn">'+adv.length+'</span><span class="drule"></span></div>'+
      '<div class="dgrid">'+ adv.map(p=>cardHtml({...p, division:'', company:''}, advColor)).join('') +'</div>'+
    '</section>';
    html += '<div class="dempty hidden" id="dir-empty">No matches</div>';

    wrap.innerHTML = html;

    // Reuse the shared toolbar search so the search bar stays put across tabs
    const mainSearch = document.getElementById('search');
    if (mainSearch && !mainSearch.dataset.dirBound) {
      mainSearch.addEventListener('input', applyFilters);
      mainSearch.dataset.dirBound = '1';
    }
    // Re-apply when the Directory tab is opened (and clear stale tree highlights)
    const dirTab = document.getElementById('view-directory');
    if (dirTab && !dirTab.dataset.dirBound) {
      dirTab.addEventListener('click', () => requestAnimationFrame(applyFilters));
      dirTab.dataset.dirBound = '1';
    }
    document.getElementById('dir-filters').querySelectorAll('.ctrl-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        activeFilter = btn.dataset.filter;
        document.getElementById('dir-filters').querySelectorAll('.ctrl-btn').forEach(b=>b.classList.toggle('is-active', b===btn));
        applyFilters();
      });
    });
    applyFilters();
  }

  function applyFilters(){
    const input = document.getElementById('search');
    const q = (input && input.value || '').trim().toLowerCase();
    let shown = 0;
    wrap.querySelectorAll('.dgroup').forEach(group => {
      const gKey = group.dataset.group;
      const divMatch = (activeFilter === 'all' || activeFilter === gKey);
      let groupShown = 0;
      group.querySelectorAll('.dcard').forEach(card => {
        const hit = divMatch && (!q || card.dataset.search.indexOf(q) !== -1);
        card.classList.toggle('hidden', !hit);
        if(hit){ groupShown++; shown++; }
      });
      group.classList.toggle('hidden', groupShown === 0);
    });
    const e = document.getElementById('dir-empty');
    if(e) e.classList.toggle('hidden', shown !== 0);
    // Own the toolbar count only while the Directory tab is active
    if (document.body.classList.contains('mode-directory')) {
      const c = document.getElementById('search-count');
      if(c) c.textContent = shown + (shown===1?' result':' results');
    }
  }

  build();
})();