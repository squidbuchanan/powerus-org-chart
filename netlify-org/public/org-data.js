/* Powerus organizational data — updated June 2026
 * Status types:
 *   exec, onboard, urgent, agent, candidate, open, contract, advisor
 */

window.ORG_ADVISORS = [
  { name: "Gen. CQ Brown Jr.",      role: "Advisory Board Member", desc: "Government / Defense — Leadership Training, Executive in Residence" },
  { name: "Lt. Gen. Keith Kellogg", role: "Advisory Board Member", desc: "Fmr. Special Envoy, Ukraine — International Business" },
  { name: "Admiral Jamie Sands",    role: "Advisory Board Member", desc: "Special Operations / Naval Warfare — Spokesperson, Public Policy" },
  { name: "Steve Hoffman",          role: "Advisory Board Member", desc: "Engineering and IP" },
  { name: "Michael Buchanan",       role: "Advisory Board Member", desc: "Creative" },
  { name: "James Lee",              role: "Advisory Board Member", desc: "Korean Market & Supply Chain" },
  { name: "Jessica Lycos",          role: "Advisory Board Member", desc: "Government Relations" },
  { name: "Hogan Gidley",           role: "Advisory Board Member", desc: "Defense & Government Communications" },
  { name: "Jesse Ferrara",          role: "Advisory Board Member", desc: "National Security & Defense Tech" },
];

window.ORG_BOARD = [
  { name: "Matthew Bielski", role: "Board of Directors", desc: "Capital Markets" },
  { name: "Marcos Cordero",  role: "Board of Directors", desc: "" },
  { name: "Matt Britton",    role: "Board of Directors", desc: "" },
  { name: "Jason Finger",    role: "Board of Directors", desc: "" },
  { name: "Meghan Welch",    role: "Board of Directors", desc: "", prospective: true },
  { name: "Open", role: "Chair, Audit Committee",          desc: "" },
  { name: "Open", role: "Chair, Remuneration Committee",   desc: "" },
  { name: "Open", role: "Chair, Governance Committee",     desc: "" },
];

// Helpers
const N = (name, role, type, dept, children) => ({ name, role, type, dept, children: children || [] });
const O = (role, dept, children) => ({ name: "Open", role, type: "open", dept, children: children || [] });
const U = (role, dept, children) => ({ name: "Open", role, type: "urgent", dept, children: children || [] });

// ── Growth / tech deep-cycle teams ────────────────────────────
const GROWTH_TEAM = [
  O("Deep Cycle Team Lead", "growth"),
  O("Deep Cycle Team Lead", "growth"),
  O("Deep Cycle Team Lead", "growth"),
  O("Data Analyst Lead",    "growth"),
  O("Deep Cycle Team Lead", "growth"),
  O("Short Cycle Team Lead","growth"),
  O("Short Cycle Team Lead","growth"),
  O("Short Cycle Team Lead","growth"),
  O("Staff Engineer",       "growth"),
  N("Jonathan Barahona", "Team Engineer", "onboard", "growth"),
  N("Jason Barahona",    "Team Engineer", "onboard", "growth"),
  O("Team Engineer", "growth"),
  O("Team Engineer", "growth"),
];

// ── Patrick O'Hara — Talent & Strategic Growth ────────────────
const STRATEGY_TEAM = [
  N("Jordan Fox", "M&A Analyst", "onboard", "strategy"),
  O("HR Administrator",  "strategy"),
  O("Talent Coordinator","strategy"),
];

// ── Chris Pratt + Government Relations ────────────────────────
const CHRIS_PRATT = {
  name: "Chris Pratt",
  role: "SVP of Government Relations",
  type: "onboard",
  dept: "legal",
  children: [
    { name: "Hogan Gidley",   role: "Government Relations & Public Policy", type: "advisor",  dept: "office", children: [] },
    N("Jessica Lycos",  "Government Relations (R)", "onboard", "office"),
    N("Laura Saunders", "Government Relations (R)", "onboard", "office"),
    N("Allen Rubin",    "Government Relations (D)", "onboard", "office"),
  ],
};

// ── Charlie Keebaugh — 4 direct reports only ──────────────────
const CHARLIE_K_TEAM = [
  CHRIS_PRATT,

  O("VP of DoW Sales", "sales", [
    O("Director of USAF",             "sales"),
    O("Director of USA",              "sales"),
    O("Director of USMC",             "sales"),
    O("Director of USN",              "sales"),
    O("Director of SOCOM",            "sales"),
    O("Director of Federal Agencies", "sales"),
  ]),

  O("VP of International Sales", "sales", [
    O("Director of Asia",         "sales"),
    O("Director of Asia",         "sales"),
    O("Director of Middle East",  "sales", [
      N("Ryder McKee", "Outside Sales Rep Regional", "onboard", "sales"),
    ]),
    O("Director of Europe",        "sales"),
    O("Director of Latin America", "sales"),
  ]),

  N("Kristin Spivey", "Director of Capture & Proposals", "onboard", "sales", [
    N("Aaron Smith", "Sr Inside Sales Mgr", "onboard", "sales", [
      N("Brian Baswell", "Sales Tech", "onboard", "sales"),
      O("Inside Sales Reps", "sales"),
    ]),
  ]),
];

// ── Marketing ─────────────────────────────────────────────────
const BUCHANAN = N("Michael \u201CSquid\u201D Buchanan", "Chief Brand Officer", "onboard", "marketing", [
  N("Ryan Donahue",  "Social Media Manager",       "onboard",  "marketing"),
  N("Caleb Wright",  "Media Manager",              "onboard",  "marketing"),
  { name: "Erik Long",           role: "Marketing Coordinator",        type: "contract", dept: "marketing", children: [] },
  { name: "Defiance Analytics",  role: "ETF Marketing & Social Media", type: "contract", dept: "marketing", children: [] },
  O("Marketing Specialist", "marketing"),
]);

// VP of Marketing holds the full marketing org
const MARKETING_TEAM = [
  BUCHANAN,
  O("Dir. of Events & PR", "marketing", [
    O("Booth Team", "marketing"),
    O("Booth Team", "marketing"),
  ]),
  N("Troy Curtis", "Director of Content", "onboard", "marketing", [
    O("Videography", "marketing"),
    O("Editor",      "marketing"),
  ]),
];

// ── Operations — split into Shared Services + Supply Chain ────
const OPS_TEAM = [
  O("VP of Shared Services", "ops", [
    O("Assistant, Operations", "ops"),
    N("Scott Wolff", "Training Coordinator", "onboard", "ops", [
      N("Sam Cousins", "Demo Team Lead", "onboard", "ops"),
      O("Flight Engineer Lead", "ops", [
        O("Flight Engineer", "ops"),
        O("Flight Engineer", "ops"),
        O("Flight Interns",  "ops"),
        { name: "Corey Tapp", role: "Contracted Pilot", type: "contract", dept: "ops", children: [] },
      ]),
      N("Nathan Reim", "Tactical Pilot Lead", "onboard", "ops", [
        O("Tactical Pilot", "ops"),
        O("Tactical Pilot", "ops"),
        O("Tactical Pilot", "ops"),
        O("Flight Interns",  "ops"),
        { name: "Dax Neal", role: "Contracted Pilot", type: "contract", dept: "ops", children: [] },
      ]),
    ]),
    N("Lo Dominguez", "Operations Coordinator", "onboard", "ops", [
      N("Max Keebaugh", "Business Manager", "onboard", "ops", [
        { name: "Addy Alderman", role: "Business Operations", type: "candidate", dept: "ops", children: [] },
      ]),
    ]),
    N("Daniel Lauer",  "Operations",        "onboard", "ops"),
    N("Josef Dahari",  "Technical Support", "onboard", "ops"),
  ]),

  O("VP of Supply Chain", "ops", [
    O("Program Management", "ops"),
    N("Natalie Ross", "Procurement Manager", "onboard", "ops"),
    N("Jared Paul", "VP of Logistics", "onboard", "ops", [
      O("Transportation Team Lead", "ops"),
    ]),
    O("Delivery", "ops", [
      O("Fulfillment & Distribution", "ops"),
    ]),
  ]),
];

// ── Technology & Manufacturing ────────────────────────────────
const TECH_MFG_TEAM = [
  O("Assistant, Technology", "tech"),
  O("VP of Manufacturing", "mfg", [
    O("Quality Assurance Superintendent",    "mfg"),
    O("Floor Manager, Assembly",             "mfg"),
    O("Floor Manager, Materials",            "mfg"),
    O("Floor Manager, Batteries",            "mfg"),
    O("Floor Manager, Motors",               "mfg"),
    O("Floor Manager, Airframes",            "mfg"),
    O("Floor Manager, Special Projects",     "mfg"),
    O("Floor Manager, Electronic Components","mfg"),
    O("Director of Mfg Processes",           "mfg"),
    O("Program Manager",                     "mfg"),
    N("Robert Sigmon",  "Manufacturing Manager",             "onboard", "mfg"),
    N("Brent Anderson", "Manufacturing Manager, Charlotte 1","onboard", "mfg"),
    O("Manufacturing Manager, Charlotte 2",  "mfg"),
  ]),
  N("Ziv Marom", "VP of R&D", "onboard", "tech", [
    N("Jeremy Schnipke", "Director of R&D", "onboard", "tech"),
  ]),
  N("Maxim Eschenazy", "VP of Technology", "onboard", "tech", [
    O("Director of Hardware", "tech", [
      O("Deep Cycle Team Lead", "tech", [
        N("Thejas Aradhya", "Hardware Engineer", "onboard", "tech"),
      ]),
    ]),
    O("Director of Software",         "tech"),
    N("Mohammed Farooq", "Director of AI & ML",   "onboard", "tech"),
    O("Director of Data & Analysis",  "tech"),
    N("Shivansh Agrawal", "Propulsion Engineering","onboard", "tech"),
    N("Noah Lambert",     "Analog Engineering",    "onboard", "tech"),
    N("Boris Illev",      "Hardware Engineer",      "onboard", "tech"),
    N("Maxim Poe",        "Hardware Engineer",      "onboard", "tech"),
    O("Optical Engineering",      "tech"),
    O("Information Security",     "tech"),
    O("Special Projects Team 1",  "tech"),
    O("Special Projects Team 2",  "tech"),
    ...GROWTH_TEAM,
  ]),
];

// ── Finance ───────────────────────────────────────────────────
const FINANCE_TEAM = [
  N("Jake Norris", "VP, Corporate Control", "onboard", "finance"),
  N("Silas",       "Finance",               "onboard", "finance"),
  O("VP of Finance", "finance", [
    O("Controller", "finance", [
      O("Operational Accountant", "finance"),
    ]),
    O("FP&A", "finance"),
  ]),
  O("Head of Capital Markets", "finance"),
  O("Financial Staff",         "finance"),
  O("VP, Investor Relations",  "finance"),
];

// ── Legal ─────────────────────────────────────────────────────
const LEGAL_TEAM = [
  O("VP of Compliance", "legal"),
  N("Nicole Nan", "VP, General Counsel", "onboard", "legal", [
    N("Matt Farr", "Assistant General Counsel", "onboard", "legal"),
    O("AI Analyst",  "legal"),
    O("Legal Staff", "legal"),
    O("Legal Staff", "legal"),
  ]),
];

// ── Top-level tree ─────────────────────────────────────────────
window.ORG_TREE = N("Andrew Fox", "CEO & Founder", "exec", "office", [

  N("Patrick O'Hara", "EVP of Strategic Growth", "exec", "strategy", STRATEGY_TEAM),

  N("Charlie Keebaugh", "EVP of Sales", "exec", "sales", CHARLIE_K_TEAM),

  N("Roman Vinfeld", "Executive Leadership, Revenue", "exec", "office", [
    N("Amy Bove",        "Chief of Staff",  "onboard", "office"),
    N("Andrew Schmidt",  "Chief of Staff",  "onboard", "office"),
    N("Lily Monterroso", "Executive Admin", "onboard", "office"),
  ]),

  { name: "Bob Harward", role: "Chief Growth Officer", type: "exec",    dept: "growth",  forceBranch: true, children: [] },
  { name: "Jason Assad", role: "Investor Relations",   type: "onboard", dept: "finance", forceBranch: true, children: [] },

  N("Brett Velicovich", "President", "exec", "office", [
    { ...N("Olivia Mcquail", "Executive Assistant", "onboard", "office"), dotted: true },
    N("Andrew Valkenburg", "EVP of Technology & Manufacturing", "exec", "tech", TECH_MFG_TEAM),
    O("EVP of Operations", "ops", OPS_TEAM),
  ]),

  // Communications (separate from Marketing)
  N("Michael Sinensky", "EVP of Marketing", "exec", "office", [
    O("VP of Corporate Comms", "office"),
  ]),

  // Marketing org under open VP of Marketing
  O("VP of Marketing", "marketing", MARKETING_TEAM),

  N("Ed Jordan", "EVP & Chief of Finance",            "exec", "finance", FINANCE_TEAM),
  N("Jim Biehl", "EVP & Chief of Legal & Compliance", "exec", "legal",   LEGAL_TEAM),
]);

// Advisor links
window.ORG_ADVISOR_LINKS = [
  { advisor: "Gen. CQ Brown Jr.",      advisesRoleOf: "Andrew Fox" },
  { advisor: "Lt. Gen. Keith Kellogg", advisesRoleOf: "Patrick O'Hara" },
  { advisor: "Admiral Jamie Sands",    advisesRoleOf: "Michael \u201CSquid\u201D Buchanan" },
  { advisor: "Steve Hoffman",          advisesRoleOf: "Andrew Valkenburg" },
];

window.ORG_DEPTS = {
  office:    { label: "Executive Office", color: "#FF6200" },
  growth:    { label: "Growth",           color: "#A8806A" },
  sales:     { label: "Sales",            color: "#6F7158" },
  strategy:  { label: "Strategic Growth", color: "#3A3A38" },
  marketing: { label: "Marketing",        color: "#C2B5A0" },
  ops:       { label: "Operations",       color: "#5A7A6E" },
  tech:      { label: "Technology",       color: "#2B2925" },
  mfg:       { label: "Manufacturing",    color: "#7A5C4A" },
  finance:   { label: "Finance",          color: "#3F4A5A" },
  legal:     { label: "Legal",            color: "#5A4A6F" },
  agh:       { label: "AGH",              color: "#6B7A8D" },
};

window.ORG_EXTRA_LINKS = [];

window.ORG_EXTRA_LATERALS = [
  { from: "Andrew Valkenburg", to: "Charlie Keebaugh" },
];
