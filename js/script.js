/* ============ PulsePlay player logic ============ */
"use strict";

const TRACKS = [
  { file: "midnight-drive", title: "Midnight Drive", artist: "Neon District", fallback: 44.7 },
  { file: "neon-skyline",  title: "Neon Skyline",  artist: "City Lights",   fallback: 38.1 },
  { file: "lofi-rain",     title: "Lo-Fi Rain",    artist: "Cafe Static",   fallback: 41.5 },
  { file: "solar-bloom",   title: "Solar Bloom",   artist: "Golden Hour",   fallback: 41.5 },
  { file: "night-circuit", title: "Night Circuit", artist: "Voltage Club",  fallback: 36.9 },
  { file: "aurora-drift",  title: "Aurora Drift",  artist: "Polar Glow",    fallback: 31.5 },
];

const audio   = document.getElementById("audio");
const disc    = document.getElementById("disc");
const discWrap = document.querySelector(".disc-wrap");
const coverArt = document.getElementById("coverArt");
const elTitle  = document.getElementById("trackTitle");
const elArtist = document.getElementById("trackArtist");
const seek     = document.getElementById("seek");
const vol      = document.getElementById("volume");
const tCur     = document.getElementById("timeCurrent");
const tTot     = document.getElementById("timeTotal");
const btnPlay  = document.getElementById("btnPlay");
const icPlay   = btnPlay.querySelector(".ic-play");
const icPause  = btnPlay.querySelector(".ic-pause");
const listEl   = document.getElementById("trackList");
const viz      = document.getElementById("visualizer");

let index = 0, isPlaying = false, shuffle = false, repeatMode = 0; // 0 off, 1 all, 2 one
let seeking = false;

const fmt = (s) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

/* ---------- playlist render ---------- */
TRACKS.forEach((t, i) => {
  const li = document.createElement("li");
  li.className = "track";
  li.dataset.index = i;
  li.setAttribute("role", "button");
  li.tabIndex = 0;
  li.innerHTML = `
    <span class="track-num">${String(i + 1).padStart(2, "0")}</span>
    <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
    <img class="track-thumb" src="assets/covers/${t.file}.jpg" alt="${t.title} cover" loading="lazy" />
    <div class="track-info"><h4>${t.title}</h4><p>${t.artist}</p></div>
    <span class="track-dur">${fmt(t.fallback)}</span>`;
  const activate = () => { load(i); play(); };
  li.addEventListener("click", activate);
  li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); } });
  listEl.appendChild(li);

  // fetch true duration in the background
  const probe = new Audio();
  probe.preload = "metadata";
  probe.src = `assets/audio/${t.file}.mp3`;
  probe.addEventListener("loadedmetadata", () => {
    li.querySelector(".track-dur").textContent = fmt(probe.duration);
    if (i === index && !isPlaying) tTot.textContent = fmt(probe.duration);
  });
});

function markActive() {
  [...listEl.children].forEach((li, i) => {
    li.classList.toggle("active", i === index);
    li.classList.toggle("paused", i === index && !isPlaying);
  });
}

/* ---------- load / play / pause ---------- */
function load(i) {
  index = (i + TRACKS.length) % TRACKS.length;
  const t = TRACKS[index];
  audio.src = `assets/audio/${t.file}.mp3`;
  coverArt.src = `assets/covers/${t.file}.jpg`;
  coverArt.alt = `${t.title} cover`;
  elTitle.textContent = t.title;
  elArtist.textContent = t.artist;
  tCur.textContent = "0:00";
  tTot.textContent = fmt(t.fallback);
  seek.value = 0;
  seek.style.setProperty("--fill", "0%");
  markActive();
}

function play() {
  initAnalyser();
  audio.play().then(() => {
    isPlaying = true;
    disc.classList.add("playing");
    discWrap.classList.add("playing");
    icPlay.style.display = "none";
    icPause.style.display = "block";
    btnPlay.setAttribute("aria-label", "Pause");
    markActive();
  }).catch(() => { isPlaying = false; });
}

function pause() {
  audio.pause();
  isPlaying = false;
  disc.classList.remove("playing");
  discWrap.classList.remove("playing");
  icPlay.style.display = "block";
  icPause.style.display = "none";
  btnPlay.setAttribute("aria-label", "Play");
  markActive();
}

const toggle = () => (isPlaying ? pause() : play());

function next(auto = false) {
  if (shuffle) {
    let n = index;
    while (n === index && TRACKS.length > 1) n = Math.floor(Math.random() * TRACKS.length);
    load(n);
  } else if (index === TRACKS.length - 1 && repeatMode === 0 && auto) {
    load(0); return; // stop at playlist end when repeat is off
  } else {
    load(index + 1);
  }
  play();
}
const prev = () => { load(audio.currentTime > 3 ? index : index - 1); play(); };

/* ---------- wiring ---------- */
btnPlay.addEventListener("click", toggle);
document.getElementById("btnNext").addEventListener("click", () => next());
document.getElementById("btnPrev").addEventListener("click", prev);

const btnShuffle = document.getElementById("btnShuffle");
btnShuffle.addEventListener("click", () => {
  shuffle = !shuffle;
  btnShuffle.classList.toggle("active", shuffle);
});

const btnRepeat = document.getElementById("btnRepeat");
btnRepeat.addEventListener("click", () => {
  repeatMode = (repeatMode + 1) % 3;
  btnRepeat.classList.toggle("active", repeatMode > 0);
  btnRepeat.classList.toggle("repeat-on", repeatMode === 2);
  btnRepeat.title = ["Repeat: off", "Repeat: all", "Repeat: one"][repeatMode];
});

const btnMute = document.getElementById("btnMute");
btnMute.addEventListener("click", () => {
  audio.muted = !audio.muted;
  btnMute.querySelector(".ic-vol").style.display = audio.muted ? "none" : "block";
  btnMute.querySelector(".ic-mute").style.display = audio.muted ? "block" : "none";
});

vol.addEventListener("input", () => {
  audio.volume = +vol.value;
  audio.muted = +vol.value === 0;
  btnMute.querySelector(".ic-vol").style.display = audio.muted ? "none" : "block";
  btnMute.querySelector(".ic-mute").style.display = audio.muted ? "block" : "none";
  vol.style.setProperty("--fill", `${vol.value * 100}%`);
});
vol.style.setProperty("--fill", "80%");
audio.volume = 0.8;

audio.addEventListener("timeupdate", () => {
  if (!seeking && audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 100;
    seek.value = pct;
    seek.style.setProperty("--fill", `${pct}%`);
  }
  tCur.textContent = fmt(audio.currentTime);
});
audio.addEventListener("loadedmetadata", () => { tTot.textContent = fmt(audio.duration); });
audio.addEventListener("ended", () => {
  if (repeatMode === 2) { audio.currentTime = 0; play(); }
  else next(true);
});

const seekTo = () => {
  if (!audio.duration) return;
  audio.currentTime = (seek.value / 100) * audio.duration;
  seek.style.setProperty("--fill", `${seek.value}%`);
};
seek.addEventListener("input", () => { seeking = true; seek.style.setProperty("--fill", `${seek.value}%`); });
seek.addEventListener("change", () => { seekTo(); seeking = false; });

/* hero + nav buttons */
document.getElementById("heroPlay").addEventListener("click", () => {
  play();
  document.getElementById("player").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("navListen").addEventListener("click", () => {
  play();
  document.getElementById("player").scrollIntoView({ behavior: "smooth" });
});

/* keyboard */
document.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA"].includes(e.target.tagName) && e.target !== seek && e.target !== vol) return;
  switch (e.code) {
    case "Space": e.preventDefault(); toggle(); break;
    case "ArrowRight": e.preventDefault(); next(); break;
    case "ArrowLeft": e.preventDefault(); prev(); break;
    case "ArrowUp": e.preventDefault(); vol.value = Math.min(1, +vol.value + 0.05); vol.dispatchEvent(new Event("input")); break;
    case "ArrowDown": e.preventDefault(); vol.value = Math.max(0, +vol.value - 0.05); vol.dispatchEvent(new Event("input")); break;
  }
});

/* ---------- hero music-pulse ---------- */
const heroArt = document.querySelector(".hero-art");
const heroEqBars = [...document.querySelectorAll(".hero-eq i")];
let beatSmooth = 0;
function driveHeroPulse(levels, t) {
  if (!heroArt) return;
  let bass;
  if (levels) {
    bass = (levels[1] + levels[2] + levels[3] + levels[4]) / (4 * 255);
    heroEqBars.forEach((b, i) => {
      const v = levels[2 + Math.floor((i / heroEqBars.length) * levels.length * 0.7)] / 255;
      b.style.setProperty("--h", (6 + v * 36).toFixed(0));
    });
  } else {
    bass = isPlaying ? Math.max(0, Math.sin(t * 4.4)) * 0.7 + 0.15 : 0.12;
    heroEqBars.forEach((b, i) => {
      const v = isPlaying
        ? 0.5 + 0.5 * Math.sin(t * 5 + i * 0.8)
        : 0.25 + 0.2 * Math.sin(t * 1.5 + i);
      b.style.setProperty("--h", (6 + v * 30).toFixed(0));
    });
  }
  beatSmooth += (bass - beatSmooth) * 0.25;
  heroArt.style.setProperty("--beat", beatSmooth.toFixed(3));
  heroArt.classList.toggle("playing", isPlaying);
}

/* ---------- visualizer ---------- */
let actx = null, analyser = null, freqData = null, vizLive = false, vizFrames = 0;
function initAnalyser() {
  if (actx) { actx.resume && actx.resume(); return; }
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const src = actx.createMediaElementSource(audio);
    analyser = actx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    src.connect(analyser);
    analyser.connect(actx.destination);
    freqData = new Uint8Array(analyser.frequencyBinCount);
  } catch (err) { actx = null; }
}

function drawViz() {
  requestAnimationFrame(drawViz);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = viz.clientWidth * dpr, h = viz.clientHeight * dpr;
  if (viz.width !== w) { viz.width = w; viz.height = h; }
  const ctx = viz.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  const t = performance.now() / 1000;
  const bars = 48, gap = 3 * dpr, bw = (w - gap * (bars - 1)) / bars;

  let levels = null;
  if (analyser && isPlaying) {
    analyser.getByteFrequencyData(freqData);
    if (!vizLive && ++vizFrames > 20) {
      vizLive = freqData.some((v) => v > 0); // detect CORS-silent analyser (file://)
      if (!vizLive) analyser = null;
    }
    levels = freqData;
  }

  driveHeroPulse(levels, t);

  ctx.fillStyle = "#f0e226";

  for (let i = 0; i < bars; i++) {
    let v;
    if (levels) {
      v = levels[Math.floor((i / bars) * levels.length * 0.85)] / 255;
      v = Math.max(v, 0.03);
    } else {
      // simulated idle / fallback motion
      const base = isPlaying ? 0.35 : 0.12;
      v = base * (0.55 + 0.45 * Math.sin(t * (isPlaying ? 5 : 1.6) + i * 0.55))
              * (0.6 + 0.4 * Math.sin(i * 1.7 + t * 2.3)) + 0.03;
    }
    const bh = Math.max(2 * dpr, v * h);
    const x = i * (bw + gap), y = h - bh;
    const r = Math.min(bw / 2, 3 * dpr);
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, r);
    ctx.fill();
  }
}
drawViz();

/* ---------- tilt ---------- */
const card = document.getElementById("tiltCard");
const fine = window.matchMedia("(pointer: fine)").matches;
if (fine) {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
    card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
}

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
io.observe(listEl);

/* screenshot helper mode */
if (location.search.includes("snap")) document.documentElement.classList.add("snap");

/* ---------- go ---------- */
load(0);
markActive();


/* ---------- v2: 3D hero — scroll orbit + parallax + float + beat ---------- */
const heroModelWrap = document.getElementById("heroModelWrap");
const heroModel = document.getElementById("heroModel");
const heroSection = document.querySelector(".hero");
const heroCopy = document.querySelector(".hero-copy");
const finePointer = matchMedia("(pointer: fine)").matches;

if (heroModelWrap && heroModel && heroSection) {
  const state = { px: 0, py: 0, cx: 0, cy: 0, progress: 0 };

  let scrollTicking = false;
  function heroScrollOrbit() {
    scrollTicking = false;
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const p = Math.min(1, Math.max(0, scrollY / (heroSection.offsetHeight * 0.9)));
    state.progress = p;
    heroModel.autoRotate = p < 0.02;
    if (p >= 0.02) heroModel.cameraOrbit = `${(-25 + p * 150).toFixed(1)}deg ${(72 - p * 10).toFixed(1)}deg 105%`;
  }
  addEventListener("scroll", () => {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(heroScrollOrbit); }
  }, { passive: true });

  if (finePointer) {
    heroSection.addEventListener("mousemove", (e) => {
      const r = heroSection.getBoundingClientRect();
      state.px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      state.py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
  }

  (function heroLoop(t) {
    const time = (t || 0) / 1000;
    state.cx += (state.px - state.cx) * 0.06;
    state.cy += (state.py - state.cy) * 0.06;
    const beatScale = 1 + beatSmooth * 0.045;
    const floatY = Math.sin(time * 1.15) * 9;
    const x = state.cx * 14;
    const y = floatY + state.cy * 10 + state.progress * 46;
    heroModelWrap.style.transform =
      `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${beatScale})`;
    if (heroCopy && finePointer) {
      heroCopy.style.transform = `translate(${(state.cx * -5).toFixed(2)}px, ${(state.cy * -3).toFixed(2)}px)`;
    }
    requestAnimationFrame(heroLoop);
  })();
}
