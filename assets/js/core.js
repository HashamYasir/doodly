/*
  DOODLY — core helpers and shared components
  Exposes one global: window.Doodly
*/
(function () {
  'use strict';

  var DEFAULTS = { name: 'DOODLY', author: '', contact: '', sourceUrl: '', showEmptySections: true, newDays: 90 };
  var site = Object.assign({}, DEFAULTS, window.DOODLY_SITE || {});
  var PLACEHOLDER = 'assets/img/covers/placeholder.svg';
  var PILL_COLOURS = ['#ffc83d', '#5fe0b0', '#8cbcff', '#ffa6d5', '#bba0ff', '#ff8a7d'];

  /* ---------- Catalogue ---------- */
  var games = (Array.isArray(window.DOODLY_GAMES) ? window.DOODLY_GAMES : [])
    .filter(function (g) {
      var ok = g && g.id && g.title && g.path;
      if (!ok && window.console) console.warn('DOODLY: skipping an invalid catalogue entry (needs id, title, path):', g);
      return ok;
    })
    .sort(function (a, b) { return String(b.released || '').localeCompare(String(a.released || '')); });

  function byId(id) {
    for (var i = 0; i < games.length; i++) if (games[i].id === id) return games[i];
    return null;
  }

  function categories() {
    var seen = {};
    games.forEach(function (g) { if (g.category) seen[g.category] = true; });
    return Object.keys(seen).sort();
  }

  function randomGame() {
    return games.length ? games[Math.floor(Math.random() * games.length)] : null;
  }

  function gameUrl(g, autoplay) {
    return 'game.html?g=' + encodeURIComponent(g.id) + (autoplay ? '#play' : '');
  }

  function daysSince(iso) {
    return (Date.now() - Date.parse(iso + 'T00:00:00Z')) / 864e5;
  }

  function isNew(g) {
    if (typeof g.new === 'boolean') return g.new;
    var d = daysSince(g.released);
    return isFinite(d) && d <= site.newDays;
  }

  function formatDate(iso) {
    var t = Date.parse(iso + 'T00:00:00Z');
    if (isNaN(t)) return iso || '';
    return new Date(t).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  /* ---------- DOM helpers ---------- */
  function append(el, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(el, c); }); return; }
    el.appendChild(child.nodeType ? child : document.createTextNode(String(child)));
  }

  // h('div', {class: 'x', onclick: fn}, 'text', childNode, [more, children])
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }

  function markup(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function trySafely(fn) { try { return fn(); } catch (e) { return undefined; } }

  /* ---------- Components ---------- */
  function pill(text) {
    if (!text) return null;
    var sum = 0;
    for (var i = 0; i < text.length; i++) sum += text.charCodeAt(i);
    return h('span', { class: 'pill', style: '--c:' + PILL_COLOURS[sum % PILL_COLOURS.length] }, text);
  }

  function coverImg(g, alt, className) {
    return h('img', {
      class: className || null,
      src: g.cover || PLACEHOLDER,
      alt: alt || '',
      width: 640, height: 400,
      loading: 'lazy', decoding: 'async',
      onerror: function () {
        if (this.getAttribute('data-fallback')) return;
        this.setAttribute('data-fallback', '1');
        this.src = PLACEHOLDER;
      }
    });
  }

  function card(g) {
    var url = gameUrl(g);
    return h('article', { class: 'card' },
      h('a', { class: 'card-cover', href: url, tabindex: '-1', 'aria-hidden': 'true' }, coverImg(g, '')),
      h('div', { class: 'card-body' },
        h('div', { class: 'card-meta' }, pill(g.category), isNew(g) ? h('span', { class: 'tag-new' }, 'New') : null),
        h('h3', { class: 'card-title' }, h('a', { href: url }, g.title)),
        h('p', { class: 'card-desc' }, g.description || ''),
        h('div', { class: 'card-foot' },
          h('a', { class: 'btn btn-sm btn-primary', href: gameUrl(g, true), 'aria-label': 'Play ' + g.title }, 'Play ▶'),
          g.released ? h('time', { datetime: g.released }, formatDate(g.released)) : null
        )
      )
    );
  }

  function empty(title, text, action) {
    return h('div', { class: 'empty' }, h('strong', null, title), text ? h('span', null, text) : null, action || null);
  }

  var LOGO_SVG =
    '<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
    '<circle cx="20" cy="20" r="17" fill="#ffc83d" stroke="#1b1a17" stroke-width="3"/>' +
    '<circle cx="14" cy="17" r="2.6" fill="#1b1a17"/><circle cx="26" cy="17" r="2.6" fill="#1b1a17"/>' +
    '<path d="M12 24q8 8 16 0" fill="none" stroke="#1b1a17" stroke-width="3" stroke-linecap="round"/></svg>';

  function renderHeader() {
    var host = document.getElementById('site-header');
    if (!host) return;
    var page = document.body.getAttribute('data-page');
    var active = page === 'game' ? 'games' : page;
    var links = [['home', 'Home', 'index.html'], ['games', 'Games', 'games.html'], ['about', 'About', 'about.html']];
    host.appendChild(h('div', { class: 'wrap bar' },
      h('a', { class: 'logo', href: 'index.html', 'aria-label': site.name + ' — home' }, markup(LOGO_SVG), h('span', { class: 'logo-word' }, site.name)),
      h('nav', { 'aria-label': 'Main' },
        h('ul', { class: 'nav' }, links.map(function (l) {
          return h('li', null, h('a', { href: l[2], 'aria-current': l[0] === active ? 'page' : null }, l[1]));
        })))
    ));
  }

  function renderFooter() {
    var host = document.getElementById('site-footer');
    if (!host) return;
    var contact = site.contact && (site.contact.indexOf('@') > -1 && !/^(mailto:|https?:)/.test(site.contact) ? 'mailto:' + site.contact : site.contact);
    host.appendChild(h('div', { class: 'wrap foot' },
      h('p', null,
        '© ' + new Date().getFullYear() + ' ' + site.name + '. Made with ', h('span', { class: 'heart', 'aria-label': 'love' }, '♥'),
        site.author ? ' by ' + site.author : ' by one person', '. No ads, no tracking.'),
      h('ul', { class: 'foot-links' },
        contact ? h('li', null, h('a', { href: contact }, 'Contact')) : null,
        site.sourceUrl ? h('li', null, h('a', { href: site.sourceUrl, rel: 'noopener' }, 'Source')) : null,
        h('li', null, h('a', { href: '#main' }, 'Back to top'))
      )
    ));
  }

  function setMeta(opts) {
    if (opts.title) document.title = opts.title;
    function meta(attr, key, value) {
      if (!value) return;
      var el = document.querySelector('meta[' + attr + '="' + key + '"]');
      if (!el) { el = h('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', value);
    }
    meta('name', 'description', opts.description);
    meta('property', 'og:title', opts.title);
    meta('property', 'og:description', opts.description);
    meta('property', 'og:image', opts.image);
  }

  function init() {
    renderHeader();
    renderFooter();
    var surprise = document.getElementById('random-game');
    var pick = randomGame();
    if (surprise && pick) surprise.setAttribute('href', gameUrl(pick, true));
  }

  window.Doodly = {
    site: site, games: games, byId: byId, categories: categories, randomGame: randomGame,
    gameUrl: gameUrl, isNew: isNew, formatDate: formatDate,
    h: h, markup: markup, trySafely: trySafely,
    pill: pill, coverImg: coverImg, card: card, empty: empty, setMeta: setMeta,
    PLACEHOLDER: PLACEHOLDER
  };

  init();
})();
