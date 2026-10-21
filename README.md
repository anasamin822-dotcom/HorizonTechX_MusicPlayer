# PulsePlay — Music Player

A neon-aurora **web music player** built with plain **HTML, CSS and JavaScript** — no frameworks, no build step. Created for the Horizon TechX frontend internship (Task 4).

## Features (task checklist)

- Music player interface in HTML, styled with CSS (glassmorphism + aurora theme)
- JavaScript audio controls: **play, pause, next, previous**
- Shows **song title, artist and duration**
- **Progress bar** (click/drag to seek) and **volume control** (slider + mute)
- **Bonus: playlist support** — 6 tracks, click any row to play it
- **Bonus: autoplay** — the next track starts automatically when one ends
- Extra: live audio visualizer (Web Audio API), shuffle, repeat all/one, keyboard shortcuts, spinning vinyl artwork, scroll animations, fully responsive (phone → desktop)

## Run it

Open `index.html` in a browser — or serve the folder (recommended, so the live visualizer can read the audio):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

> On `file://` some browsers block the analyser from reading audio data; PulsePlay detects that and falls back to a simulated visualizer. Everything else works the same.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / pause |
| `→` / `←` | Next / previous track |
| `↑` / `↓` | Volume up / down |

## Music & artwork

All 6 tracks were **generated in-house for this project** (procedurally synthesised) and are copyright-free — safe to publish. Cover art was generated for this project too.

| # | Track | Artist | Vibe |
| - | ----- | ------ | ---- |
| 1 | Midnight Drive | Neon District | Synthwave |
| 2 | Neon Skyline | City Lights | Uplifting electronic |
| 3 | Lo-Fi Rain | Cafe Static | Chill lo-fi |
| 4 | Solar Bloom | Golden Hour | Warm house |
| 5 | Night Circuit | Voltage Club | Dark techno |
| 6 | Aurora Drift | Polar Glow | Ambient |

## Project structure

```
├── index.html
├── css/style.css
├── js/script.js
└── assets/
    ├── audio/    # 6 generated .mp3 tracks
    └── covers/   # 6 generated .jpg covers
```
