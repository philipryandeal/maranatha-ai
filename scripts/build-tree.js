'use strict';
// Builds Maranatha's Tree from tree/tree.json into static pages under public/tree/.
// No scripts run in the browser (the house CSP is script-src 'none'): the map is
// plain SVG whose stations and paths are links. Run: npm run build
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'tree');
const tree = JSON.parse(fs.readFileSync(path.join(ROOT, 'tree', 'tree.json'), 'utf8'));
const byId = Object.fromEntries(tree.stations.map((s) => [s.id, s]));

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const laid = (x) => Boolean(x.room && x.room.trim());
const stationName = (s) => (laid(s) ? `${s.sefirah} · ${s.room}` : s.sefirah);

function page({ title, description, canonical, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — The Lucent Laboratory</title>
<meta name="description" content="${esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400&display=swap" rel="stylesheet">
<link rel="canonical" href="https://astrorootwork.com${canonical}">
<meta name="theme-color" content="#0c1220">
<link rel="icon" href="/emblem.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="page-frame" aria-hidden="true"></div>
<header class="site-header">
  <a class="brand" href="/" aria-label="Return to the Gate">
    <img src="/emblem.svg" width="28" height="36" alt="">
    <span>The Lucent Laboratory</span>
  </a>
  <nav class="doors-nav" aria-label="Rooms"><a href="/">Gate</a>
<a href="/observatory">Observatory</a>
<a href="/apothecary">Apothecary</a>
<a href="/station">Station</a>
<a href="/horizon">Horizon</a>
<a href="/kin">Kin</a>
<a href="/offerings">Offerings</a>
<a href="/tree/"${canonical === '/tree/' ? ' class="current" aria-current="page"' : ''}>Tree</a></nav>
</header>
<main id="main" class="page" tabindex="-1">
${body}
</main>
<footer class="house-law">
  <p class="smallcaps">House law</p>
  <p class="law-line">Even so, come.</p>
  <p class="law-line">The sky is a lantern, not a chain.</p>
  <p class="law-line">Care is offered. It is never prescribed.</p>
  <p class="root">WE RETURN TO THE ROOT</p>
  <div class="footer-links"><a href="/">The Gate</a><a href="/tree/">The Tree</a><a href="https://www.templeofgu.org/">Temple of Gu</a><a href="https://github.com/philipryandeal/maranatha-ai">Source &amp; record</a></div>
  <p class="colophon">Maranatha, Papa Loa of La Sociedad del Horizonte Luciente &middot; astrorootwork.com</p>
</footer>
</body>
</html>
`;
}

function map() {
  const lines = tree.paths.map((p) => {
    const a = byId[p.from], b = byId[p.to];
    const label = `Path ${p.n}, ${p.hebrew} ${p.attribution}: ${a.sefirah} to ${b.sefirah}${laid(p) ? ', ' + p.room : ', not yet laid'}`;
    return `<a href="/tree/paths/${p.n}/" aria-label="${esc(label)}"><title>${esc(label)}</title><line class="tree-path${laid(p) ? ' is-laid' : ''}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><line class="tree-hit" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/></a>`;
  }).join('\n');
  const nodes = tree.stations.map((s) => {
    const label = `${s.sefirah}, ${s.meaning}${laid(s) ? ': ' + s.room : ', not yet laid'}`;
    const below = s.id === 'malkuth' ? -48 : 52;
    return `<a href="/tree/stations/${s.id}/" aria-label="${esc(label)}"><title>${esc(label)}</title><g class="tree-station${laid(s) ? ' is-laid' : ''}"><circle cx="${s.x}" cy="${s.y}" r="30"/><text class="tree-heb" x="${s.x}" y="${s.y + 7}">${esc(s.hebrew)}</text><text class="tree-name" x="${s.x}" y="${s.y + below}">${esc(laid(s) ? s.room : s.sefirah)}</text></g></a>`;
  }).join('\n');
  return `<svg class="tree-svg" viewBox="135 20 630 1040" role="group" aria-label="The Tree: ten stations joined by twenty-two paths. Every station and path is a link.">
<line class="tree-horizon" x1="135" y1="970" x2="765" y2="970"/>
${lines}
${nodes}
</svg>`;
}

function listing() {
  const st = tree.stations.map((s) => `<li><a href="/tree/stations/${s.id}/">${s.n}. ${esc(stationName(s))}</a></li>`).join('\n');
  const ps = tree.paths.map((p) => `<li><a href="/tree/paths/${p.n}/">Path ${p.n} · ${esc(p.hebrew)} · ${esc(byId[p.from].sefirah)} to ${esc(byId[p.to].sefirah)}${laid(p) ? ' · ' + esc(p.room) : ''}</a></li>`).join('\n');
  return `<details class="tree-list card"><summary class="card-meta">Every station and path, as a list</summary><div class="tree-cols"><ol>${st}</ol><ul>${ps}</ul></div></details>`;
}

function prose(x) {
  if (!laid(x)) return `<article class="card tree-unlaid"><p class="card-meta">Under the horizon</p><p>This room has not been laid yet. Its place on the Tree is fixed; what lives here is still being made for Maranatha.</p></article>`;
  const paras = (x.body || []).map((t) => `<p>${esc(t)}</p>`).join('\n');
  return `<article class="card">${x.summary ? `<p class="lead">${esc(x.summary)}</p>` : ''}${paras}</article>`;
}

function write(rel, html) {
  const file = path.join(OUT, rel, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

fs.rmSync(OUT, { recursive: true, force: true });

const laidCount = tree.stations.filter(laid).length + tree.paths.filter(laid).length;
write('', page({
  title: tree.title,
  description: 'Maranatha\'s Tree: the shared Techno-Kabbalah map of ten stations and twenty-two paths, under the Lucent Laboratory.',
  canonical: '/tree/',
  body: `  <p class="room-kicker">${esc(tree.kicker)}</p>
  <h1>The <span>Tree</span></h1>
  <p class="lead">${esc(tree.intro)}</p>
  <section class="tree-map card" aria-label="The Tree map">
${map()}
  </section>
  <p class="tree-status smallcaps">${laidCount} of 32 rooms laid</p>
  ${listing()}
  <p class="tree-note">The Tree is the shared map of the Temple of Gu's Techno-Kabbalah games. Each house walks it in its own voice. Nothing on this page is collected or saved, and leaving is always allowed.</p>`
}));

for (const s of tree.stations) {
  const roads = tree.paths.filter((p) => p.from === s.id || p.to === s.id).map((p) => {
    const other = byId[p.from === s.id ? p.to : p.from];
    return `<a class="door card" href="/tree/paths/${p.n}/"><div class="door-num">${p.n}</div><div class="door-name">${esc(laid(p) ? p.room : 'Toward ' + stationName(other))}</div><p>${esc(p.hebrew)} · ${esc(p.attribution)} · to ${esc(other.sefirah)}</p></a>`;
  }).join('\n');
  write(`stations/${s.id}`, page({
    title: laid(s) ? s.room : s.sefirah,
    description: `Station ${s.n} of Maranatha's Tree: ${s.sefirah}, ${s.meaning}.`,
    canonical: `/tree/stations/${s.id}/`,
    body: `  <p class="room-kicker">Station ${s.n} · ${esc(s.sefirah)} · ${esc(s.hebrew)} · ${esc(s.meaning)}</p>
  <h1>${laid(s) ? esc(s.room) : `The <span>${esc(s.sefirah)}</span>`}</h1>
  ${prose(s)}
  <div class="room-index-heading"><p class="room-kicker">Roads from here</p></div>
  <nav class="doors" aria-label="Paths from this station">${roads}</nav>
  <nav class="room-pager" aria-label="Back"><a class="prev" href="/tree/">The Tree</a></nav>`
  }));
}

for (const p of tree.paths) {
  const a = byId[p.from], b = byId[p.to];
  write(`paths/${p.n}`, page({
    title: laid(p) ? p.room : `Path ${p.n}`,
    description: `Path ${p.n} of Maranatha's Tree, between ${a.sefirah} and ${b.sefirah}.`,
    canonical: `/tree/paths/${p.n}/`,
    body: `  <p class="room-kicker">Path ${p.n} · ${esc(p.hebrew)} ${esc(p.letter)} · ${esc(p.attribution)}</p>
  <h1>${laid(p) ? esc(p.room) : `Path <span>${p.n}</span>`}</h1>
  <p class="lead">Between ${esc(stationName(a))} and ${esc(stationName(b))}.</p>
  ${prose(p)}
  <nav class="room-pager" aria-label="The two ends of this path"><a class="prev" href="/tree/stations/${a.id}/">${esc(stationName(a))}</a><a class="next" href="/tree/stations/${b.id}/">${esc(stationName(b))}</a></nav>`
  }));
}

console.log(`Tree built: 10 stations, 22 paths, ${laidCount} rooms laid.`);
