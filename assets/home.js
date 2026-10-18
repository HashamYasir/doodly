/* DOODLY homepage: wobble ("line boil") + pixel sparks on click. Purely decorative. */
(function () {
  'use strict';
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm) return;

  // Wobble: re-roll the noise seed a few times a second so outlines shimmer like hand-drawn frames.
  var n = document.getElementById('wobN'), seed = 2;
  if (n) setInterval(function () { seed = seed % 7 + 1; n.setAttribute('seed', seed); }, 150);

  // Pixel sparks wherever you click or tap.
  var COLORS = ['#ff5a4d', '#ffc83d', '#5fb4ff', '#5fe0b0', '#ffa6d5', '#bba0ff', '#1b1a17'];
  addEventListener('pointerdown', function (e) {
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('i'), size = 5 + Math.floor(Math.random() * 3) * 3;
      var a = Math.random() * 6.283, d = 30 + Math.random() * 60;
      s.style.cssText = 'position:fixed;z-index:50;pointer-events:none;left:' + (e.clientX - size / 2) + 'px;top:' + (e.clientY - size / 2) + 'px;' +
        'width:' + size + 'px;height:' + size + 'px;background:' + COLORS[i % COLORS.length] + ';image-rendering:pixelated';
      document.body.appendChild(s);
      s.animate(
        [{ transform: 'translate(0,0)', opacity: 1 },
         { transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 24) + 'px)', opacity: 0 }],
        { duration: 450 + Math.random() * 250, easing: 'steps(6)' }
      ).onfinish = (function (el) { return function () { el.remove(); }; })(s);
    }
  });
})();
