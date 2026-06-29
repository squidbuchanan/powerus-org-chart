/* Powerus Org Chart — skills view data (updated June 2026)
 * Categorizes individuals by the skill they bring to the company,
 * cutting across the formal reporting tree. A person may appear in
 * exactly one skill bucket.
 *
 * Names are matched against ORG_TREE for role/dept lookup; if no match,
 * a fallback role/dept is used (for individuals not yet in the tree).
 *
 * Titles: an explicit `role` on a person here OVERRIDES the role looked
 * up from ORG_TREE — so the skills chart can carry the official titles
 * from the Signature Directory without disturbing the List / Chart views.
 */

window.ORG_SKILLS = [
  {
    group: "Office of the CEO",
    people: [
      { name: "Andrew Fox",       role: "Founder & CEO" },
      { name: "Brett Velicovich", role: "Co-founder & President" },
      { name: "Olivia Mcquail" },
      { name: "Roman Vinfeld",    role: "Co-Founder & Chief Revenue Officer" },
      { name: "Amy Bove",         role: "Operations, EVP" },
      { name: "Andrew Schmidt",   role: "Chief of Staff" },
      { name: "Lily Monterroso",  role: "Executive Assistant" },
    ],
  },
  {
    group: "Revenue",
    people: [
      { name: "Bob Harward" },
      { name: "Charlie Keebaugh", role: "EVP of Sales" },
      { name: "Aaron Smith",      role: "Senior Inside Sales Manager" },
      { name: "Brian Baswell" },
      { name: "Ryder McKee" },
    ],
  },
  {
    group: "Talent and Real Estate",
    people: [
      { name: "Patrick O'Hara", role: "EVP Strategic Growth" },
      { name: "Jordan Fox",     role: "Strategic Growth Analyst" },
    ],
  },
  {
    group: "Government Relations",
    people: [
      { name: "Chris Pratt",   role: "SVP of Government Relations" },
      { name: "Hogan Gidley",  role: "Advisor, Government Relations" },
      { name: "Jessica Lycos" },
      { name: "Laura Saunders" },
      { name: "Allen Rubin" },
    ],
  },
  {
    group: "Legal",
    people: [
      { name: "Jim Biehl",  role: "Chief Legal Officer" },
      { name: "Nicole Nan", role: "General Counsel" },
      { name: "Matt Farr",  role: "Assistant General Counsel" },
    ],
  },
  {
    group: "Finance",
    people: [
      { name: "Ed Jordan",   role: "Chief Financial Officer" },
      { name: "Jake Norris", role: "Corporate Control" },
      { name: "Silas" },
      { name: "Addy Alderman" },
    ],
  },
  {
    group: "Operations",
    people: [
      { name: "EVP of Operations", fallback: { role: "EVP of Operations", type: "open", dept: "ops" } },
      { name: "Scott Wolff", role: "Training Coordinator" },
      { name: "Max Keebaugh", role: "Business Manager" },
      { name: "Daniel Lauer" },
    ],
  },
  {
    group: "Logistics",
    people: [
      { name: "Jared Paul",   role: "Logistics Manager" },
      { name: "Natalie Ross", role: "Executive Operations Coordinator" },
    ],
  },
  {
    group: "Flight",
    people: [
      { name: "Nathan Reim",  role: "Flight Lead, International" },
      { name: "Sam Cousins",  role: "Flight Lead, US" },
      { name: "Corey Tapp" },
      { name: "Dax Neal" },
    ],
  },
  {
    group: "Comms & Marketing",
    people: [
      { name: "Michael \u201CSquid\u201D Buchanan", role: "Chief Brand Officer" },
      { name: "Michael Sinensky", role: "Co-founder & EVP, Marketing" },
      { name: "Troy Curtis",  role: "Social Media/Marketing" },
      { name: "Ryan Donahue", role: "Content & Media Manager" },
      { name: "Caleb Wright" },
      { name: "Erik Long" },
      { name: "Defiance Analytics", fallback: { role: "ETF Marketing & Social Media", type: "contract", dept: "marketing" } },
    ],
  },
  {
    group: "Investor Relations",
    people: [
      { name: "Jason Assad" },
    ],
  },
  {
    group: "Hardware Engineering",
    people: [
      { name: "Andrew Valkenburg", role: "EVP, Manufacturing & Technology" },
      { name: "Maxim Eschenazy",   role: "VP, Technology" },
      { name: "Thejas Aradhya",    role: "Hardware Engineer" },
      { name: "Shivansh Agrawal",  role: "Director, Engineering" },
      { name: "Noah Lambert" },
      { name: "Jason Barahona",    role: "Team Engineer" },
      { name: "Jonathan Barahona", role: "Team Engineer" },
      { name: "Boris Illev" },
      { name: "Maxim Poe" },
    ],
  },
  {
    group: "Software / Tech",
    people: [
      { name: "Mohammed Farooq" },
      { name: "Josef Dahari" },
      { name: "Lo Dominguez", role: "Operations Coordinator" },
    ],
  },
  {
    group: "Manufacturing",
    people: [
      { name: "Robert Sigmon" },
      { name: "Brent Anderson", role: "Manufacturing Manager, Charlotte 1" },
    ],
  },
  {
    group: "R&D",
    people: [
      { name: "Ziv Marom",      role: "VP, R&D" },
      { name: "Jeremy Schnipke", role: "Director, R&D" },
    ],
  },
  {
    group: "AGH",
    people: [
      { name: "AGH Caretaker", fallback: { role: "Caretaker", type: "open", dept: "agh" } },
    ],
  },
];

// ── Skill → slug + helpers ─────────────────────────────────────
window.ORG_SKILL_SLUG = function(label) {
  return (label || '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[/]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Skill palette — one color per skill group.
window.ORG_SKILL_COLORS = {
  "office-of-the-ceo":    "#FF6200",
  "revenue":              "#C8344C",
  "talent-and-real-estate": "#C9A427",
  "government-relations": "#5C4FA8",
  "legal":                "#7D3FA6",
  "finance":              "#4A5A6A",
  "operations":           "#2C8A4A",
  "logistics":            "#8E7A2A",
  "flight":               "#1E8FB8",
  "comms-marketing":      "#C1428A",
  "investor-relations":   "#5E9D2C",
  "hardware-engineering": "#2B2925",
  "software-tech":        "#2864C3",
  "manufacturing":        "#7A5C4A",
  "r-d":                  "#1E9E92",
  "agh":                  "#6B7A8D",
};

// Name → skill slug map (built from ORG_SKILLS at load time).
window.ORG_SKILL_OF = (() => {
  const map = new Map();
  (window.ORG_SKILLS || []).forEach(g => {
    const sl = window.ORG_SKILL_SLUG(g.group);
    g.people.forEach(p => map.set(p.name, sl));
  });
  return (name) => name ? (map.get(name) || '') : '';
})();
