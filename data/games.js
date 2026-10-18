/*
  DOODLY — game catalogue
  ------------------------------------------------------------------
  Every game on the site is one object in this list.
  To add a game: put its folder in /games/<id>/ and add an entry below.
  Full field guide: see README.md ("Catalogue fields").

  Required: id, title, description, category, released, path
  Everything else is optional but recommended.
*/
window.DOODLY_GAMES = [
  {
    id: "spoon-scale",                           // used in the URL: game.html?g=spoon-scale
    title: "How Much Is Too Much?",
    description: "Pile up spoons, press ×2 again and again, and watch a doodle mountain outgrow cats, buses, towers, Everest, the Moon and the Sun.",
    category: "Weird & Experimental",             // any text; new categories create new filter chips
    released: "2026-10-18",                       // YYYY-MM-DD (set this to the real release date)
    path: "games/spoon-scale/index.html",         // the game's entry file
    cover: "assets/img/covers/spoon-scale.svg",   // 16:10 image works best (png, jpg, webp or svg)
    aspect: "16/10",                              // the game area's shape on computers and tablets
    aspectNarrow: "5/7",                          // optional: a taller shape on phones (screens under ~760px)
    featured: false,                              // the Featured slot on the homepage uses the first featured game
    popular: false,                               // true = hand-picked into the "Popular" row (editor's pick, not analytics)
    tags: ["spoons", "idle", "clicker", "compounding", "math", "3d", "satire"],
    restart: false,                               // the game has its own ↺ restart button, so the page's Restart is hidden
    instructions: [
      "Tap ADD +1 to drop a spoon on the pile. Hold the button to keep adding.",
      "Hit ×2, ×10 or ×1000 to multiply the whole pile in one go.",
      "Switch on AUTO and let the pile compound by itself.",
      "Watch the pile climb past a cat, a bus, the Eiffel Tower and Everest, all the way to the Sun. The 📜 button shows every milestone.",
      "Your progress saves automatically on this device."
    ],
    controls: [
      { keys: ["ADD +1"], action: "Add a spoon (hold to keep adding)" },
      { keys: ["×2", "×10", "×1000"], action: "Multiply the pile" },
      { keys: ["AUTO"], action: "Cycle automatic growth" },
      { keys: ["Drag"], action: "Orbit the camera" },
      { keys: ["Scroll", "Pinch"], action: "Zoom" },
      { keys: ["📜"], action: "Story and scale chart" }
    ]
  }
];
