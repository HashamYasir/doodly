/*
  DOODLY — game page (game.html?g=<id>)
  Builds the page from the catalogue entry and runs the game in an isolated iframe.
*/
(function () {
  'use strict';
  var D = window.Doodly;
  if (!D) return;
  var h = D.h;

  // The game runs in its own document, so its CSS and JS cannot touch the site.
  // allow-same-origin lets games use localStorage for saved scores; remove it
  // from this list if you ever host games you did not write yourself.
  var SANDBOX = 'allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-modals';

  var root = document.getElementById('game-root');
  var id = new URLSearchParams(location.search).get('g');
  var g = D.byId(id);

  var back = h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' },
    h('a', { class: 'back-link', href: 'games.html' }, '← Back to games'));

  if (!g) { renderMissing(); return; }
  renderGame();

  /* ---------- Not found ---------- */
  function renderMissing() {
    D.setMeta({ title: 'Game not found · ' + D.site.name });
    root.textContent = '';
    root.appendChild(back);
    root.appendChild(h('section', null,
      D.empty('That game isn’t here',
        id ? 'There is no game called “' + id + '”. The link may be old or mistyped.' : 'No game was picked.',
        h('a', { class: 'btn btn-primary', href: 'games.html' }, 'Browse all games'))));
    if (D.games.length) {
      root.appendChild(h('section', { class: 'more' },
        h('div', { class: 'section-head' }, h('h2', null, 'Try one of these')),
        h('div', { class: 'grid' }, D.games.slice(0, 4).map(D.card))));
    }
  }

  /* ---------- Helpers ---------- */
  function ratioOf(a) {
    if (a && typeof a === 'object' && a.width && a.height) return a.width / a.height;
    var m = String(a == null ? '' : a).match(/^\s*(\d+(?:\.\d+)?)\s*[\/:x]\s*(\d+(?:\.\d+)?)\s*$/);
    return m ? parseFloat(m[1]) / parseFloat(m[2]) : 16 / 9;
  }

  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }

  function controlRow(c) {
    var keys = (c.keys || []).map(function (k, i) {
      return [i ? h('span', { class: 'or' }, 'or') : null, h('kbd', null, k)];
    });
    return h('li', null, h('span', { class: 'keys' }, keys), h('span', { class: 'action' }, c.action || ''));
  }

  /* ---------- Page ---------- */
  function renderGame() {
    var ratioWide = ratioOf(g.aspect);
    var ratioNarrow = g.aspectNarrow ? ratioOf(g.aspectNarrow) : null;
    var narrowMq = window.matchMedia ? window.matchMedia('(max-width: 760px)') : null;
    function currentRatio() { return ratioNarrow && narrowMq && narrowMq.matches ? ratioNarrow : ratioWide; }
    var ratio = currentRatio();
    var frame = null;
    var shareLabel = 'Copy link';

    D.setMeta({
      title: g.title + ' · ' + D.site.name,
      description: g.description,
      image: g.cover ? new URL(g.cover, location.href).href : ''
    });

    /* Stage */
    var loading = h('div', { class: 'stage-loading', hidden: true, role: 'status' }, h('div', { class: 'spinner' }), 'Loading game…');
    var errorBox = h('div', { class: 'stage-error', hidden: true, role: 'alert' },
      h('strong', null, 'This game didn’t load'),
      h('p', null, 'Check that the “path” in data/games.js points to a real file, then try again.'),
      h('button', { class: 'btn btn-sm', type: 'button', onclick: function () { start(); } }, 'Try again'));
    var play = h('button', { class: 'btn btn-primary btn-lg play-big', type: 'button', onclick: function () { start(); } }, '▶ Play now');
    var poster = h('div', { class: 'poster' }, D.coverImg(g, 'Cover art for ' + g.title), play);
    poster.querySelector('img').removeAttribute('loading');
    var stage = h('div', { class: 'stage', style: '--ratio:' + ratio.toFixed(4) }, poster, loading, errorBox);

    /* Toolbar */
    var btnRestart = g.restart === false ? null : h('button', { class: 'btn btn-sm', type: 'button', disabled: true, onclick: function () { start(); } }, '↻ Restart');
    var btnFull = g.fullscreen === false ? null : h('button', { class: 'btn btn-sm', type: 'button', onclick: toggleFullscreen }, '⛶ Fullscreen');
    var btnClose = h('button', { class: 'btn btn-sm', type: 'button', disabled: true, onclick: stop }, '✕ Close game');
    var btnShare = h('button', { class: 'btn btn-sm', type: 'button', onclick: share }, '🔗 ' + shareLabel);
    var hint = h('p', { class: 'hint' }, 'Keys not responding? Click inside the game once.');
    var toolbar = h('div', { class: 'stage-toolbar' }, btnRestart, btnFull, btnClose, btnShare, hint);
    var wrap = h('div', { class: 'stage-wrap' }, stage, toolbar);

    /* Details */
    var details = h('div', { class: 'details' },
      h('section', { class: 'panel', 'aria-labelledby': 'how-title' },
        h('h2', { id: 'how-title' }, 'How to play'),
        g.instructions && g.instructions.length
          ? h('ol', null, g.instructions.map(function (t) { return h('li', null, t); }))
          : h('p', null, 'Just press Play and figure it out. That’s half the fun.')),
      h('section', { class: 'panel', 'aria-labelledby': 'controls-title' },
        h('h2', { id: 'controls-title' }, 'Controls'),
        g.controls && g.controls.length
          ? h('ul', { class: 'controls' }, g.controls.map(controlRow))
          : h('p', null, 'No special controls. Click, tap and poke around.')));

    /* Head */
    var head = h('div', null,
      h('div', { class: 'game-head' },
        h('h1', null, g.title),
        h('div', { class: 'game-meta' },
          D.pill(g.category),
          D.isNew(g) ? h('span', { class: 'tag-new' }, 'New') : null,
          g.released ? h('time', { datetime: g.released }, 'Released ' + D.formatDate(g.released)) : null)),
      h('p', { class: 'game-blurb' }, g.description));

    root.textContent = '';
    root.appendChild(back);
    root.appendChild(head);
    root.appendChild(wrap);
    root.appendChild(details);

    var others = D.games.filter(function (x) { return x.id !== g.id; }).slice(0, 4);
    if (others.length) {
      root.appendChild(h('section', { class: 'more' },
        h('div', { class: 'section-head' }, h('h2', null, 'More games')),
        h('div', { class: 'grid' }, others.map(D.card))));
    }

    /* ----- behaviour ----- */
    function applyRatio() { stage.style.setProperty('--ratio', currentRatio().toFixed(4)); }
    if (ratioNarrow && narrowMq) {
      if (narrowMq.addEventListener) narrowMq.addEventListener('change', applyRatio);
      else if (narrowMq.addListener) narrowMq.addListener(applyRatio);
    }

    function setRunning(on) {
      poster.hidden = on;
      btnClose.disabled = !on;
      if (btnRestart) btnRestart.disabled = !on;
    }

    function unmount() {
      if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
      frame = null;
    }

    function start() {
      unmount();
      errorBox.hidden = true;
      loading.hidden = false;
      frame = h('iframe', {
        class: 'game-frame', src: g.path, title: g.title + ' (game)',
        allow: 'fullscreen; gamepad; autoplay; clipboard-write',
        allowfullscreen: true, sandbox: SANDBOX
      });
      frame.addEventListener('load', onFrameLoad);
      stage.insertBefore(frame, loading);
      setRunning(true);
      D.trySafely(function () { history.replaceState(null, '', location.pathname + location.search + '#play'); });
    }

    function stop() {
      if (fsElement()) D.trySafely(exitFullscreen);
      wrap.classList.remove('is-expanded');
      unmount();
      loading.hidden = true;
      errorBox.hidden = true;
      setRunning(false);
      D.trySafely(function () { history.replaceState(null, '', location.pathname + location.search); });
      play.focus();
    }

    function onFrameLoad() {
      loading.hidden = true;
      var failed = false;
      D.trySafely(function () {
        var doc = frame.contentDocument;
        if (doc && (doc.querySelector('meta[name="doodly-404"]') || /^(404|error response|not found)/i.test(doc.title || ''))) failed = true;
      });
      if (failed) { unmount(); setRunning(false); poster.hidden = true; errorBox.hidden = false; return; }
      D.trySafely(function () { frame.focus(); frame.contentWindow.focus(); });
    }

    function exitFullscreen() {
      if (document.exitFullscreen) return document.exitFullscreen();
      if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    }

    function toggleFullscreen() {
      if (wrap.classList.contains('is-expanded')) { wrap.classList.remove('is-expanded'); updateFsLabel(); return; }
      if (fsElement()) { D.trySafely(exitFullscreen); return; }
      var req = stage.requestFullscreen || stage.webkitRequestFullscreen;
      if (req) {
        try {
          var p = req.call(stage);
          if (p && p.catch) p.catch(function () { wrap.classList.add('is-expanded'); updateFsLabel(); });
          return;
        } catch (e) { /* fall through to expanded mode */ }
      }
      wrap.classList.add('is-expanded');
      updateFsLabel();
    }

    function updateFsLabel() {
      if (!btnFull) return;
      var on = fsElement() || wrap.classList.contains('is-expanded');
      btnFull.textContent = on ? '⛶ Exit fullscreen' : '⛶ Fullscreen';
    }

    document.addEventListener('fullscreenchange', updateFsLabel);
    document.addEventListener('webkitfullscreenchange', updateFsLabel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('is-expanded')) { wrap.classList.remove('is-expanded'); updateFsLabel(); }
    });

    function share() {
      var url = location.origin && location.origin !== 'null'
        ? location.origin + location.pathname + '?g=' + encodeURIComponent(g.id)
        : location.href.split('#')[0];
      var done = function (ok) {
        btnShare.textContent = ok ? '✓ Link copied' : '🔗 ' + url;
        setTimeout(function () { btnShare.textContent = '🔗 Copy link'; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
      } else done(false);
    }

    // Direct links like game.html?g=my-first-game#play start the game straight away.
    if (location.hash === '#play') start();
  }
})();
