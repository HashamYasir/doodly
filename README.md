# DOODLY

A static website: no build step, no libraries. Open `index.html` to see it.

```
index.html              the homepage (logo, game cards, decorations)
assets/
  style.css             homepage look (paper texture, wobble, pixel world)
  home.js               wobble animation + click sparks (decoration only)
  pixels/*.svg          the pixel-art sprites (stars, cat, ghost, ground tile, ...)
games/
  spoon-scale/
    index.html          the game (completely self-contained)
    cover.svg           its banner on the homepage (svg/png/jpg/webp all work)
```

## Update a game
Replace `games/<name>/index.html` (and any files beside it). The homepage doesn't change.

## Add a game
1. Make a folder `games/<new-name>/` with the game's `index.html` and a `cover.svg` (banner is about 864 x 320).
2. In `index.html`, copy the `<a class="card">...</a>` block and change the folder name.
3. Delete one of the two "next doodle loading" teaser cards.

## Change the decorations
Sprites in the sky are the `<img class="px ...">` lines at the top of `index.html`
(`--x` / `--y` = position in %, `--w` = size). Swap in your own pixel SVG or PNG from `assets/pixels/`.

## Publish free
Drag the whole folder onto Netlify (app.netlify.com/drop), or push it to GitHub and turn on Pages
(Settings > Pages > main branch, root).
