/*
  DOODLY — searchable, filterable game grid
  Usage: Doodly.mountBrowser(document.getElementById('browser'))
  Remembers ?q= and ?cat= in the address bar so searches can be shared.
*/
(function () {
  'use strict';
  var D = window.Doodly;
  if (!D) return;
  var h = D.h;

  var SEARCH_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="#1b1a17" stroke-width="2.6" stroke-linecap="round">' +
    '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>';

  D.mountBrowser = function (host) {
    var params = new URLSearchParams(location.search);
    var cats = D.categories();
    var state = { q: params.get('q') || '', cat: params.get('cat') || '' };
    if (cats.indexOf(state.cat) === -1) state.cat = '';

    var input = h('input', {
      type: 'search', id: 'game-search', placeholder: 'Search games…',
      autocomplete: 'off', spellcheck: 'false', value: state.q
    });
    var chipsBox = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by category' });
    var status = h('p', { class: 'status', 'aria-live': 'polite' });
    var grid = h('div', { class: 'grid' });

    var chips = [['', 'All']].concat(cats.map(function (c) { return [c, c]; })).map(function (pair) {
      var b = h('button', { class: 'chip', type: 'button', 'data-cat': pair[0] }, pair[1]);
      b.addEventListener('click', function () { state.cat = pair[0]; update(); });
      chipsBox.appendChild(b);
      return b;
    });

    input.addEventListener('input', function () { state.q = input.value; update(); });

    host.textContent = '';
    host.appendChild(h('div', { class: 'browse-bar' },
      h('label', { class: 'search', for: 'game-search' },
        h('span', { class: 'sr-only' }, 'Search games'), D.markup(SEARCH_ICON), input),
      chipsBox));
    host.appendChild(status);
    host.appendChild(grid);

    function matches(g) {
      if (state.cat && g.category !== state.cat) return false;
      var q = state.q.trim().toLowerCase();
      if (!q) return true;
      var hay = [g.title, g.description, g.category].concat(g.tags || []).join(' ').toLowerCase();
      return q.split(/\s+/).every(function (word) { return hay.indexOf(word) !== -1; });
    }

    function syncUrl() {
      D.trySafely(function () {
        var sp = new URLSearchParams();
        if (state.q.trim()) sp.set('q', state.q.trim());
        if (state.cat) sp.set('cat', state.cat);
        var qs = sp.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      });
    }

    function clearFilters() {
      state.q = ''; state.cat = ''; input.value = ''; update(); input.focus();
    }

    function update() {
      chips.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === state.cat)); });
      syncUrl();
      var list = D.games.filter(matches);
      grid.textContent = '';

      if (!D.games.length) {
        status.textContent = '';
        grid.appendChild(D.empty('The shelves are empty', 'No games have been published yet. Check back soon!'));
        return;
      }
      if (!list.length) {
        status.textContent = 'No games found.';
        grid.appendChild(D.empty(
          'Nothing matches that',
          state.q.trim() ? 'No game found for “' + state.q.trim() + '”' + (state.cat ? ' in ' + state.cat : '') + '.' : 'No games in this category yet.',
          h('button', { class: 'btn btn-sm', type: 'button', onclick: clearFilters }, 'Clear search and filters')));
        return;
      }
      status.textContent = list.length === D.games.length
        ? D.games.length + (D.games.length === 1 ? ' game' : ' games')
        : 'Showing ' + list.length + ' of ' + D.games.length + ' games';
      list.forEach(function (g) { grid.appendChild(D.card(g)); });
    }

    update();
  };
})();
