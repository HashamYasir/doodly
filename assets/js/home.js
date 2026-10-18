/*
  DOODLY — homepage: featured game, grid, and curated rows
*/
(function () {
  'use strict';
  var D = window.Doodly;
  if (!D) return;
  var h = D.h, site = D.site, games = D.games;

  /* ---------- Featured ---------- */
  var featuredSlot = document.getElementById('featured-slot');
  if (featuredSlot) {
    var pick = games.filter(function (g) { return g.featured; })[0] || games[0];
    if (!pick) {
      featuredSlot.appendChild(D.empty('No featured game yet', 'The first game is still being drawn.'));
    } else {
      featuredSlot.appendChild(h('article', { class: 'feature' },
        h('a', { class: 'feature-cover', href: D.gameUrl(pick), tabindex: '-1', 'aria-hidden': 'true' }, D.coverImg(pick, '')),
        h('div', { class: 'feature-body' },
          h('div', { class: 'feature-meta' }, D.pill('Featured'), D.pill(pick.category), D.isNew(pick) ? h('span', { class: 'tag-new' }, 'New') : null),
          h('h2', null, pick.title),
          h('p', null, pick.description),
          h('div', { class: 'feature-actions' },
            h('a', { class: 'btn btn-primary btn-lg', href: D.gameUrl(pick, true) }, '▶ Play now'),
            h('a', { class: 'btn btn-lg', href: D.gameUrl(pick) }, 'How to play'))
        )
      ));
    }
  }

  /* ---------- Full grid with search + filters ---------- */
  var browser = document.getElementById('browser');
  if (browser && D.mountBrowser) D.mountBrowser(browser);

  /* ---------- Curated rows ---------- */
  var rows = document.getElementById('rows');
  if (!rows) return;

  var WEIRD = 'Weird & Experimental';
  var sections = [
    {
      title: 'New releases', colour: '#ff8a7d', note: 'Fresh from the drawing board.',
      list: games.filter(D.isNew), emptyIcon: '✏️', emptyText: 'Nothing new right now. The next game is being scribbled.'
    },
    {
      title: 'Popular', colour: '#ffc83d', note: 'Hand-picked favourites. Real play counts need a backend (a future feature).',
      list: games.filter(function (g) { return g.popular === true; }), emptyIcon: '⭐', emptyText: 'Hand-picked favourites will land here.'
    },
    {
      title: WEIRD, colour: '#bba0ff', note: 'Strange ideas, tiny experiments.',
      list: games.filter(function (g) { return g.category === WEIRD; }), emptyIcon: '🧪', emptyText: 'The strange stuff is still cooking.'
    }
  ];

  sections.forEach(function (s) {
    if (!s.list.length && !site.showEmptySections) return;
    var body = s.list.length
      ? h('div', { class: 'grid' }, s.list.slice(0, 4).map(D.card))
      : h('div', { class: 'slot' }, h('span', { 'aria-hidden': 'true' }, s.emptyIcon), s.emptyText);
    rows.appendChild(h('section', { 'aria-label': s.title },
      h('div', { class: 'section-head', style: '--c:' + s.colour }, h('h2', null, s.title), h('p', null, s.note)),
      body));
  });
})();
