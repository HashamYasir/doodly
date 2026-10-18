/*
  DOODLY — 404 page.
  Header, footer and the "Surprise me" button are wired up by core.js.
  Nothing else is needed here; the file exists so the page can be extended later.
*/
(function () {
  'use strict';
  if (window.Doodly && window.Doodly.setMeta) window.Doodly.setMeta({ title: 'Page not found · ' + window.Doodly.site.name });
})();
