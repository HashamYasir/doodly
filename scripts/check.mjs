#!/usr/bin/env node
/*
  DOODLY catalogue checker.
  Run it before you publish:   node scripts/check.mjs
  It reads data/games.js and data/site.js and tells you about mistakes
  (missing files, duplicate ids, bad dates, unregistered game folders).
  Needs Node.js 18+, but the website itself does NOT need Node at all.
*/
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

function load(file, key) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  try {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
  } catch (e) {
    errors.push(`${file}: ${e.message}`);
    return undefined;
  }
  return ctx.window[key];
}

const exists = (p) => fs.existsSync(path.join(root, p));

const site = load('data/site.js', 'DOODLY_SITE') || {};
const games = load('data/games.js', 'DOODLY_GAMES');

if (!Array.isArray(games)) {
  errors.push('data/games.js must set window.DOODLY_GAMES to a list ([ ... ]).');
} else {
  const ids = new Set();
  games.forEach((g, i) => {
    const where = `games[${i}]${g && g.id ? ` ("${g.id}")` : ''}`;
    if (!g || typeof g !== 'object') { errors.push(`${where}: not an object`); return; }

    for (const f of ['id', 'title', 'description', 'category', 'released', 'path']) {
      if (!g[f] || typeof g[f] !== 'string') errors.push(`${where}: missing "${f}"`);
    }
    if (g.id) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(g.id)) errors.push(`${where}: id must be lowercase letters, numbers and dashes only`);
      if (ids.has(g.id)) errors.push(`${where}: duplicate id`);
      ids.add(g.id);
    }
    if (g.released) {
      const ok = /^\d{4}-\d{2}-\d{2}$/.test(g.released) && !Number.isNaN(Date.parse(g.released + 'T00:00:00Z'));
      if (!ok) errors.push(`${where}: "released" must look like 2026-10-18`);
    }
    if (g.path) {
      if (/^(https?:)?\/\//.test(g.path) || g.path.startsWith('/')) errors.push(`${where}: "path" must be relative, like games/${g.id || 'my-game'}/index.html`);
      else if (!exists(g.path)) errors.push(`${where}: game file not found: ${g.path}`);
      else if (g.path !== g.path.toLowerCase()) warnings.push(`${where}: path has capital letters; web hosts are case-sensitive, so double-check the spelling`);
    }
    if (g.cover) { if (!exists(g.cover)) warnings.push(`${where}: cover image not found (${g.cover}); the placeholder will be shown`); }
    else warnings.push(`${where}: no "cover" set; the placeholder will be shown`);
    if (g.aspect && !/^\s*\d+(\.\d+)?\s*[\/:x]\s*\d+(\.\d+)?\s*$/.test(String(g.aspect))) warnings.push(`${where}: "aspect" should look like "16/9" or "4/3"`);
    if (g.instructions && !Array.isArray(g.instructions)) errors.push(`${where}: "instructions" must be a list of strings`);
    if (g.controls && !Array.isArray(g.controls)) errors.push(`${where}: "controls" must be a list of { keys: [...], action: "..." }`);
    if (Array.isArray(g.controls)) g.controls.forEach((c, n) => { if (!c || !Array.isArray(c.keys) || !c.action) warnings.push(`${where}: controls[${n}] should be { keys: ["W"], action: "Move up" }`); });
    if (!g.instructions || !g.instructions.length) warnings.push(`${where}: no "instructions"; the page will show a generic line`);
  });

  // Folders in /games that nobody registered.
  const gamesDir = path.join(root, 'games');
  if (fs.existsSync(gamesDir)) {
    for (const d of fs.readdirSync(gamesDir, { withFileTypes: true })) {
      if (!d.isDirectory() || d.name.startsWith('_')) continue;
      if (!games.some((g) => g && typeof g.path === 'string' && g.path.startsWith(`games/${d.name}/`))) {
        warnings.push(`games/${d.name}/ exists but is not listed in data/games.js`);
      }
    }
  }
}

if (!site.contact || /example\.com/.test(site.contact)) warnings.push('data/site.js: "contact" is still the placeholder. Change it before publishing.');

for (const w of warnings) console.log(`⚠  ${w}`);
for (const e of errors) console.log(`✗  ${e}`);
if (!errors.length) console.log(`✓ Catalogue OK: ${Array.isArray(games) ? games.length : 0} game(s)${warnings.length ? `, ${warnings.length} warning(s)` : ''}.`);
process.exit(errors.length ? 1 : 0);
