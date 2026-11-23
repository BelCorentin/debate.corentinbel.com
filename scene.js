"use strict";
/* Café des Faits — façade at golden hour. Hand-built SVG, procedural vines/cobbles with a seeded RNG
   so the street looks the same on every visit. viewBox 0 0 1600 1000. */
(function () {
  const svg = document.getElementById("facadeSvg");
  if (!svg) return;
  svg.style.overflow = "visible";
  const fit = () => { const r = svg.getBoundingClientRect(); svg.setAttribute("preserveAspectRatio", r.width / Math.max(r.height, 1) > 1.6 ? "xMidYMax meet" : "xMidYMax slice"); };
  fit(); addEventListener("resize", fit);
  const NS = "http://www.w3.org/2000/svg";
  let seed = 20270410;
  const R = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const rr = (a, b) => a + (b - a) * R();
  const el = (tag, a, p, txt) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; (p || svg).appendChild(e); return e; };
  const g = (a, p) => el("g", a || {}, p);

  /* ---------- defs ---------- */
  const defs = el("defs", {});
  defs.innerHTML = `
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d4a8a"/><stop offset=".45" stop-color="#c9708a"/><stop offset=".8" stop-color="#f6a56b"/><stop offset="1" stop-color="#ffd59a"/></linearGradient>
  <linearGradient id="stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9c7a6"/><stop offset=".5" stop-color="#f0e2c6"/><stop offset="1" stop-color="#d6c19d"/></linearGradient>
  <linearGradient id="stoneDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9a786"/><stop offset="1" stop-color="#9c8a6c"/></linearGradient>
  <linearGradient id="zinc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f6d7c"/><stop offset="1" stop-color="#8e9aa6"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6a3"/><stop offset=".6" stop-color="#ffb453"/><stop offset="1" stop-color="#e07d2a"/></linearGradient>
  <linearGradient id="glassUp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7b6aa6"/><stop offset=".5" stop-color="#e7a07e"/><stop offset="1" stop-color="#5a4a7c"/></linearGradient>
  <linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f5a43"/><stop offset="1" stop-color="#123a2b"/></linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".45" stop-color="#e9c25a"/><stop offset="1" stop-color="#a87a1e"/></linearGradient>
  <linearGradient id="pave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9b1a6"/><stop offset="1" stop-color="#8f877e"/></linearGradient>
  <linearGradient id="street" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d6670"/><stop offset="1" stop-color="#4a4450"/></linearGradient>
  <radialGradient id="warm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf73" stop-opacity=".75"/><stop offset="1" stop-color="#ffcf73" stop-opacity="0"/></radialGradient>
  <radialGradient id="lampGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3c4" stop-opacity=".95"/><stop offset=".35" stop-color="#ffd27a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
  <radialGradient id="marble" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e8e4dc"/><stop offset="1" stop-color="#c9c3b8"/></radialGradient>
  <pattern id="weave" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#e9d7b0"/><path d="M0 2h8M0 6h8" stroke="#c0392b" stroke-width="2"/><path d="M2 0v8" stroke="#2c6e49" stroke-width="1.4"/></pattern>
  <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="shadowF" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#2a1a10" flood-opacity=".35"/></filter>`;

  /* ---------- sky + neighbours ---------- */
  el("rect", { x: -1200, y: -400, width: 4000, height: 1400, fill: "url(#sky)" });
  el("circle", { cx: 1430, cy: 120, r: 46, fill: "#ffe7b0", opacity: .9 });
  el("circle", { cx: 1430, cy: 120, r: 110, fill: "url(#lampGlow)", opacity: .6 });
  for (let i = 0; i < 6; i++) { const x = rr(0, 1600), y = rr(40, 220), w = rr(80, 200); el("ellipse", { cx: x, cy: y, rx: w, ry: w * .12, fill: "#ffd1b3", opacity: rr(.15, .35) }); }
  // neighbour buildings
  const nb = (x, w, top, col) => {
    const G = g({});
    el("rect", { x, y: top, width: w, height: 1000 - top, fill: col }, G);
    el("path", { d: `M${x - 6} ${top} h${w + 12} l-14 -50 h${-(w - 16)} z`, fill: "#55606d" }, G);
    for (let yy = top + 40; yy < 820; yy += 130) for (let xx = x + 30; xx < x + w - 60; xx += 95) {
      const lit = R() < .45;
      el("rect", { x: xx, y: yy, width: 46, height: 80, fill: lit ? "#ffc56b" : "#4d4660", opacity: lit ? .9 : .85 }, G);
      el("path", { d: `M${xx + 23} ${yy}v80M${xx} ${yy + 34}h46`, stroke: "#2e2a38", "stroke-width": 2 }, G);
      el("rect", { x: xx - 4, y: yy + 80, width: 54, height: 6, fill: "#3a3442" }, G);
    }
    return G;
  };
  nb(-1000, 340, 150, "#8f8279"); nb(-660, 330, 70, "#a1918a"); nb(-340, 320, 130, "#958781"); nb(-40, 300, 120, "#9d8f86");
  nb(1340, 300, 90, "#a39189"); nb(1640, 320, 140, "#978a83"); nb(1960, 330, 60, "#a0938c"); nb(2290, 340, 130, "#8e817a");

  /* ---------- the café building ---------- */
  const B = g({ id: "bldg" });
  // mansard roof
  el("path", { d: "M262 172 L300 62 H1300 L1338 172 Z", fill: "url(#zinc)" }, B);
  for (let x = 300; x < 1300; x += 14) el("path", { d: `M${x} 64 L${x - 4 + (x - 800) * .04} 170`, stroke: "#4d5966", "stroke-width": 1, opacity: .5 }, B);
  for (const x of [380, 800, 1220]) { // chimneys
    el("rect", { x: x - 30, y: 18, width: 60, height: 50, fill: "#b4a08a", stroke: "#6f5d4c", "stroke-width": 2 }, B);
    for (let k = 0; k < 3; k++) el("rect", { x: x - 24 + k * 18, y: 6, width: 12, height: 16, fill: "#c46a4a", stroke: "#6f3a2a", "stroke-width": 1.5 }, B);
  }
  for (const x of [480, 690, 910, 1120]) { // dormers
    el("path", { d: `M${x - 36} 168 V100 Q${x} 62 ${x + 36} 100 V168 Z`, fill: "#e8dcc4", stroke: "#8f7f66", "stroke-width": 2 }, B);
    el("path", { d: `M${x - 22} 164 V108 Q${x} 82 ${x + 22} 108 V164 Z`, fill: R() < .5 ? "#ffcf7a" : "url(#glassUp)" }, B);
    el("path", { d: `M${x} 92 V164 M${x - 22} 130 H${x + 22}`, stroke: "#6b5b48", "stroke-width": 2 }, B);
  }
  // facade
  el("rect", { x: 262, y: 170, width: 1076, height: 450, fill: "url(#stone)" }, B);
  el("rect", { x: 250, y: 166, width: 1100, height: 14, fill: "#cdb995", stroke: "#8f7f66", "stroke-width": 1.5 }, B); // cornice
  for (let y = 200; y < 620; y += 26) el("path", { d: `M262 ${y} H1338`, stroke: "#bfae8e", "stroke-width": 1, opacity: .7 }, B);
  for (let y = 200, row = 0; y < 620; y += 26, row++) for (let x = 262 + (row % 2) * 60; x < 1338; x += 120) el("path", { d: `M${x} ${y - 26} V${y}`, stroke: "#c9b898", "stroke-width": 1, opacity: .5 }, B);
  el("rect", { x: 250, y: 380, width: 1100, height: 10, fill: "#d8c6a3", stroke: "#a8977a", "stroke-width": 1 }, B);
  const winX = [360, 580, 800, 1020, 1240];
  const windows = (y0, h, balc) => {
    for (const cx of winX) {
      const lit = R() < .55;
      el("rect", { x: cx - 62, y: y0 - 10, width: 124, height: h + 22, fill: "#d1bf9c", stroke: "#a8977a", "stroke-width": 1.5 }, B);
      el("path", { d: `M${cx - 70} ${y0 - 10} h140 l-8 -16 h-124 z`, fill: "#cdb995", stroke: "#a08f72", "stroke-width": 1.2 }, B);
      el("rect", { x: cx - 52, y: y0, width: 104, height: h, fill: lit ? "url(#glass)" : "url(#glassUp)" }, B);
      if (lit) el("rect", { x: cx - 52, y: y0, width: 104, height: h, fill: "#fff2c4", opacity: .25 }, B);
      el("path", { d: `M${cx} ${y0}V${y0 + h} M${cx - 52} ${y0 + h * .33}H${cx + 52} M${cx - 52} ${y0 + h * .66}H${cx + 52}`, stroke: "#f3ead6", "stroke-width": 3.5 }, B);
      el("rect", { x: cx - 52, y: y0, width: 104, height: h, fill: "none", stroke: "#f3ead6", "stroke-width": 4 }, B);
      if (lit && R() < .5) { el("path", { d: `M${cx - 46} ${y0 + 4} q14 ${h * .4} 0 ${h - 8} M${cx + 46} ${y0 + 4} q-14 ${h * .4} 0 ${h - 8}`, stroke: "#fff8e6", "stroke-width": 10, fill: "none", opacity: .55 }, B); }
      if (balc) {
        const by = y0 + h - 34;
        el("rect", { x: cx - 64, y: by - 4, width: 128, height: 6, fill: "#1d1d22" }, B);
        for (let x = cx - 60; x <= cx + 60; x += 10) el("path", { d: `M${x} ${by} v34`, stroke: "#1d1d22", "stroke-width": 2 }, B);
        for (let x = cx - 55; x <= cx + 45; x += 20) el("path", { d: `M${x} ${by + 17} q5 -12 10 0 q5 12 10 0`, stroke: "#1d1d22", "stroke-width": 1.6, fill: "none" }, B);
        el("rect", { x: cx - 58, y: by + 34, width: 116, height: 14, fill: "#9a5b3a", stroke: "#5f3420", "stroke-width": 1.5 }, B);
        // geraniums
        for (let k = 0; k < 14; k++) { const fx = cx - 54 + k * 8 + rr(-2, 2), fy = by + 30 + rr(-8, 4); el("circle", { cx: fx, cy: fy, r: rr(4, 6.5), fill: R() < .7 ? "#2f7a3e" : "#3f8f4a" }, B); }
        for (let k = 0; k < 9; k++) el("circle", { cx: cx - 50 + k * 12 + rr(-3, 3), cy: by + 22 + rr(-6, 4), r: rr(3.5, 5), fill: R() < .75 ? "#e23b3b" : "#ff7aa8" }, B);
      }
    }
  };
  windows(210, 150, true);
  windows(420, 160, false);
  // continuous wrought-iron balcony on the 1st floor
  el("rect", { x: 270, y: 560, width: 1060, height: 7, fill: "#1d1d22" }, B);
  el("rect", { x: 270, y: 598, width: 1060, height: 5, fill: "#1d1d22" }, B);
  for (let x = 274; x < 1330; x += 9) el("path", { d: `M${x} 566v32`, stroke: "#1d1d22", "stroke-width": 1.6 }, B);
  for (let x = 280; x < 1320; x += 36) el("path", { d: `M${x} 582 q9 -14 18 0 q9 14 18 0`, stroke: "#1d1d22", "stroke-width": 2, fill: "none" }, B);
  el("rect", { x: 262, y: 603, width: 1076, height: 14, fill: "#cdb995", stroke: "#8f7f66", "stroke-width": 1.2 }, B);

  /* ---------- ground floor: shopfront ---------- */
  const S = g({ id: "shop" });
  el("rect", { x: 262, y: 617, width: 1076, height: 300, fill: "url(#stoneDark)" }, S);
  el("rect", { x: 292, y: 622, width: 1016, height: 290, fill: "url(#green)", stroke: "#0b2219", "stroke-width": 3 }, S);
  // fascia sign
  el("rect", { x: 300, y: 628, width: 1000, height: 66, fill: "#0f3325", stroke: "url(#gold)", "stroke-width": 4 }, S);
  el("rect", { x: 308, y: 636, width: 984, height: 50, fill: "none", stroke: "#c9a43c", "stroke-width": 1.2, opacity: .8 }, S);
  el("text", { x: 800, y: 676, "text-anchor": "middle", "font-family": "Playfair Display SC, Playfair Display, Georgia, serif", "font-weight": 700, "font-size": 38, "letter-spacing": 10, fill: "url(#gold)", stroke: "#5b4210", "stroke-width": .8 }, S, "CAFÉ DES FAITS");
  for (const x of [340, 1260]) el("text", { x, y: 670, "text-anchor": "middle", "font-family": "Georgia, serif", "font-size": 20, fill: "#e9c25a" }, S, "❦");
  // windows with interior
  const interior = (x, y, w, h) => {
    const G = g({}, S);
    el("rect", { x, y, width: w, height: h, fill: "url(#glass)" }, G);
    el("rect", { x, y: y + h * .52, width: w, height: h * .48, fill: "#8a2f2a", opacity: .55 }, G); // red banquette
    el("rect", { x, y: y + h * .5, width: w, height: 6, fill: "#c99a3d", opacity: .8 }, G);
    for (let k = 0; k < Math.floor(w / 90); k++) { // mirrors
      const mx = x + 18 + k * 90; el("rect", { x: mx, y: y + 16, width: 64, height: h * .38, rx: 30, fill: "#ffe9b5", opacity: .45, stroke: "#c99a3d", "stroke-width": 2 }, G);
    }
    for (let k = 0; k < Math.floor(w / 120); k++) { // globe lamps
      const lx = x + 60 + k * 120; el("path", { d: `M${lx} ${y} v${18}`, stroke: "#5a3a1e", "stroke-width": 1.5 }, G);
      el("circle", { cx: lx, cy: y + 26, r: 30, fill: "url(#lampGlow)" }, G); el("circle", { cx: lx, cy: y + 26, r: 9, fill: "#fff6d8" }, G);
    }
    for (let k = 0; k < Math.floor(w / 110); k++) { // people
      const px = x + 40 + k * 110 + rr(-15, 15), py = y + h * .62;
      el("ellipse", { cx: px, cy: py + 34, rx: 26, ry: 30, fill: "#4a2a24", opacity: .55 }, G);
      el("circle", { cx: px, cy: py, r: 14, fill: "#4a2a24", opacity: .6 }, G);
    }
    el("path", { d: `M${x + w / 2} ${y}V${y + h} M${x} ${y + h * .3}H${x + w}`, stroke: "#c9a43c", "stroke-width": 3 }, G);
    el("rect", { x, y, width: w, height: h, fill: "none", stroke: "url(#gold)", "stroke-width": 5 }, G);
    el("path", { d: `M${x + 10} ${y + h - 10} L${x + w * .45} ${y + 10}`, stroke: "#fff", "stroke-width": 16, opacity: .08 }, G);
    return G;
  };
  interior(318, 704, 386, 196);
  interior(896, 704, 386, 196);
  el("text", { x: 511, y: 862, "text-anchor": "middle", "font-family": "Pinyon Script, cursive", "font-size": 30, fill: "#fff3c4", opacity: .9 }, S, "Faits frais du jour");
  el("text", { x: 1089, y: 862, "text-anchor": "middle", "font-family": "Pinyon Script, cursive", "font-size": 30, fill: "#fff3c4", opacity: .9 }, S, "Débats & sources");
  // door
  const D = g({ id: "door", class: "hot", tabindex: 0, role: "button", "aria-label": "Entrer et voir la carte" }, S);
  el("rect", { x: 722, y: 700, width: 156, height: 212, fill: "#0f3325", stroke: "url(#gold)", "stroke-width": 4 }, D);
  el("rect", { x: 734, y: 712, width: 62, height: 130, fill: "url(#glass)" }, D);
  el("rect", { x: 804, y: 712, width: 62, height: 130, fill: "url(#glass)" }, D);
  el("rect", { x: 734, y: 850, width: 62, height: 54, fill: "#164a36", stroke: "#c9a43c", "stroke-width": 1.5 }, D);
  el("rect", { x: 804, y: 850, width: 62, height: 54, fill: "#164a36", stroke: "#c9a43c", "stroke-width": 1.5 }, D);
  el("circle", { cx: 792, cy: 846, r: 4, fill: "#e9c25a" }, D); el("circle", { cx: 808, cy: 846, r: 4, fill: "#e9c25a" }, D);
  // menu card pinned on the door glass
  el("rect", { x: 744, y: 744, width: 42, height: 50, fill: "#fbf6ea", stroke: "#8a6a2a", "stroke-width": 1.5, transform: "translate(0 50) rotate(-4 765 773)" }, D);
  el("text", { x: 765, y: 762, "text-anchor": "middle", "font-family": "Pinyon Script, cursive", "font-size": 11, fill: "#5b1720", transform: "translate(0 50) rotate(-4 765 773)" }, D, "La Carte");
  for (let k = 0; k < 4; k++) el("path", { d: `M${750} ${770 + k * 6}h30`, stroke: "#8a6a2a", "stroke-width": 1, transform: "translate(0 50) rotate(-4 765 773)" }, D);
  el("text", { x: 835, y: 820, "text-anchor": "middle", "font-family": "Oswald, sans-serif", "font-size": 13, "letter-spacing": 2, fill: "#5b1720" }, D, "OUVERT");
  el("rect", { x: 810, y: 806, width: 50, height: 20, fill: "none", stroke: "#5b1720", "stroke-width": 1.5, rx: 3 }, D);

  /* ---------- awning ---------- */
  const A = g({ id: "awning" });
  const aw = (x0, x1, y0, y1, sp) => { // stripes in light perspective
    const n = 22;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n;
      const tx0 = x0 + (x1 - x0) * t0, tx1 = x0 + (x1 - x0) * t1;
      const bx0 = x0 - sp + (x1 - x0 + 2 * sp) * t0, bx1 = x0 - sp + (x1 - x0 + 2 * sp) * t1;
      el("path", { d: `M${tx0} ${y0} L${tx1} ${y0} L${bx1} ${y1} L${bx0} ${y1} Z`, fill: i % 2 ? "#f7f1e3" : "#c81e2a" }, A);
    }
    el("path", { d: `M${x0} ${y0} L${x1} ${y0} L${x1 + sp} ${y1} L${x0 - sp} ${y1} Z`, fill: "url(#sky)", opacity: .06 }, A);
    // scalloped valance
    const vx0 = x0 - sp, vx1 = x1 + sp, step = (vx1 - vx0) / n;
    for (let i = 0; i < n; i++) {
      const a = vx0 + i * step;
      el("path", { d: `M${a} ${y1} h${step} v16 q${-step / 2} 18 ${-step} 0 z`, fill: i % 2 ? "#f7f1e3" : "#c81e2a", stroke: "#7a1018", "stroke-width": .8 }, A);
    }
    el("text", { x: 800, y: y1 + 13, "text-anchor": "middle", "font-family": "Oswald, sans-serif", "font-weight": 700, "font-size": 12, "letter-spacing": 6, fill: "#1b1b1b", opacity: .8 }, A, "DÉBATS · FAITS · SOURCES · DEPUIS 2026");
    el("path", { d: `M${x0 - sp} ${y1 + 16} L${x1 + sp} ${y1 + 16}`, stroke: "#000", "stroke-width": 6, opacity: .12 }, A);
  };
  aw(296, 1304, 696, 760, 46);

  /* ---------- vines & wisteria ---------- */
  const V = g({ id: "vines" });
  const leaf = (x, y, s, rot, col, P) => el("path", { d: `M0 0 q${6 * s} ${-6 * s} ${12 * s} 0 q${-6 * s} ${6 * s} ${-12 * s} 0 z`, transform: `translate(${x} ${y}) rotate(${rot})`, fill: col }, P);
  const vine = (pts, P) => {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) { const [x, y] = pts[i], [px, py] = pts[i - 1]; d += ` Q${(px + x) / 2 + rr(-30, 30)} ${(py + y) / 2 + rr(-30, 30)} ${x} ${y}`; }
    el("path", { d, stroke: "#5b4a2e", "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, P);
    const path = P.lastChild, L = path.getTotalLength ? path.getTotalLength() : 600;
    for (let s = 0; s < L; s += 9) {
      const p = path.getPointAtLength(s);
      const cols = ["#2f6b33", "#3f8a3a", "#5aa144", "#246030"];
      leaf(p.x + rr(-8, 8), p.y + rr(-8, 8), rr(1, 1.8), rr(0, 360), cols[Math.floor(R() * 4)], P);
      if (R() < .25) leaf(p.x + rr(-14, 14), p.y + rr(-14, 14), rr(.8, 1.4), rr(0, 360), "#6fb84d", P);
    }
  };
  const left = g({ class: "sway" }, V), right = g({ class: "sway slow" }, V);
  vine([[276, 920], [270, 820], [284, 720], [270, 640], [300, 600], [380, 590], [470, 604], [560, 592]], left);
  vine([[1324, 920], [1332, 830], [1318, 730], [1334, 650], [1300, 600], [1220, 590], [1130, 604], [1040, 592]], right);
  vine([[300, 600], [290, 520], [300, 430], [330, 380]], left);
  vine([[1300, 600], [1312, 500], [1296, 420], [1270, 380]], right);
  // wisteria clusters hanging from the balcony
  const wist = g({ id: "wisteria" }, V);
  for (let i = 0; i < 40; i++) {
    const x = rr(300, 1300), y = rr(600, 612), len = rr(36, 74);
    if (x > 470 && x < 1130) continue;
    const C = g({ class: "cluster", style: `animation-delay:${rr(0, 3).toFixed(2)}s` }, wist);
    el("path", { d: `M${x} ${y} q2 ${len / 2} 0 ${len}`, stroke: "#4c6b33", "stroke-width": 1.2, fill: "none" }, C);
    for (let k = 0; k < 18; k++) {
      const t = k / 18, r = (1 - t) * 9 + 2;
      el("circle", { cx: x + rr(-r, r), cy: y + t * len, r: rr(2.6, 4.2), fill: ["#9b7ad6", "#b79ae8", "#7d5fc0", "#d1bdf3"][Math.floor(R() * 4)] }, C);
    }
    leaf(x + 6, y + 4, 1.4, rr(0, 90), "#4f8f3e", C);
  }
  // planters
  for (const x of [276, 1324]) {
    el("path", { d: `M${x - 34} 880 h68 l-8 40 h-52 z`, fill: "#7a8a8f", stroke: "#3d474b", "stroke-width": 2 }, V);
    for (let k = 0; k < 10; k++) el("circle", { cx: x + rr(-30, 30), cy: 878 + rr(-10, 2), r: rr(6, 10), fill: R() < .5 ? "#2f6b33" : "#4b8f3c" }, V);
  }

  /* ---------- pavement, street ---------- */
  el("rect", { x: -1200, y: 912, width: 4000, height: 52, fill: "url(#pave)" });
  for (let x = -1200; x < 2800; x += 80) el("path", { d: `M${x} 912 l-10 52`, stroke: "#857d74", "stroke-width": 1.2, opacity: .6 });
  el("rect", { x: -1200, y: 962, width: 4000, height: 8, fill: "#d8d1c6" });
  el("rect", { x: -1200, y: 970, width: 4000, height: 30, fill: "url(#street)" });
  for (let y = 974; y < 1000; y += 9) for (let x = (y % 2) * 9 - 1200; x < 2800; x += rr(16, 22)) el("rect", { x, y, width: rr(12, 17), height: 7, rx: 3, fill: R() < .5 ? "#5c5661" : "#68626d", opacity: .9 });
  el("ellipse", { cx: 800, cy: 935, rx: 520, ry: 26, fill: "url(#warm)", opacity: .7 }); // light spill

  /* ---------- terrace ---------- */
  const T = g({ id: "terrace" });
  const chair = (x, y, flip) => {
    const C = g({ transform: `translate(${x} ${y}) scale(${flip ? -1 : 1} 1)` }, T);
    el("path", { d: "M-16 -58 q16 -14 32 0 v34 h-32 z", fill: "url(#weave)", stroke: "#5b3a1e", "stroke-width": 2.4 }, C);
    el("path", { d: "M-20 -24 h40 v7 h-40 z", fill: "url(#weave)", stroke: "#5b3a1e", "stroke-width": 2 }, C);
    el("path", { d: "M-16 -17 l-5 40 M16 -17 l5 40 M-10 -17 l-2 40 M10 -17 l2 40", stroke: "#5b3a1e", "stroke-width": 2.6 }, C);
  };
  const table = (x, y, cup) => {
    el("ellipse", { cx: x, cy: y + 52, rx: 34, ry: 5, fill: "#000", opacity: .2 }, T);
    el("path", { d: `M${x} ${y + 6} V${y + 48} M${x - 18} ${y + 50} H${x + 18}`, stroke: "#1d1d22", "stroke-width": 4 }, T);
    el("ellipse", { cx: x, cy: y, rx: 36, ry: 9, fill: "url(#marble)", stroke: "#8f8a80", "stroke-width": 1.5 }, T);
    if (cup) {
      el("path", { d: `M${x - 10} ${y - 12} h16 l-2 10 h-12 z`, fill: "#fff", stroke: "#555", "stroke-width": 1 }, T);
      el("ellipse", { cx: x - 2, cy: y - 2, rx: 12, ry: 3, fill: "#fff", stroke: "#888", "stroke-width": 1 }, T);
      const st = g({ class: "steam" }, T);
      el("path", { d: `M${x - 4} ${y - 16} q-6 -10 0 -18 q6 -8 0 -16`, stroke: "#fff", "stroke-width": 2.2, fill: "none", opacity: .7 }, st);
    } else {
      el("path", { d: `M${x + 6} ${y - 30} q-8 10 0 18 q8 -8 0 -18 z M${x + 6} ${y - 12} v10 M${x} ${y - 2} h12`, fill: "#b2182b", stroke: "#444", "stroke-width": 1 }, T);
    }
  };
  chair(470, 930); table(520, 878, true); chair(572, 930, true);
  chair(1030, 930); table(1080, 878, false); chair(1132, 930, true);
  chair(1210, 930); table(1258, 880, true);
  // A-frame chalkboard (clickable)
  const SB = g({ id: "board", class: "hot", tabindex: 0, role: "button", "aria-label": "Voir la carte du jour" }, T);
  el("path", { d: "M902 958 l14 -110 h82 l14 110", fill: "none", stroke: "#6b4a2a", "stroke-width": 5 }, SB);
  el("rect", { x: 914, y: 846, width: 86, height: 100, fill: "#1f2d27", stroke: "#8a6a3a", "stroke-width": 4 }, SB);
  el("text", { x: 957, y: 868, "text-anchor": "middle", "font-family": "Caveat Brush, cursive", "font-size": 16, fill: "#f2f0e6" }, SB, "Aujourd'hui");
  el("text", { x: 957, y: 890, "text-anchor": "middle", "font-family": "Caveat, cursive", "font-size": 14, fill: "#ffd23f" }, SB, "13 sujets");
  el("text", { x: 957, y: 908, "text-anchor": "middle", "font-family": "Caveat, cursive", "font-size": 14, fill: "#f2f0e6" }, SB, "88 tickets");
  el("text", { x: 957, y: 930, "text-anchor": "middle", "font-family": "Caveat Brush, cursive", "font-size": 15, fill: "#ff8a8a" }, SB, "entrez ! →");
  // street lamp
  const LP = g({ id: "lamp" });
  el("circle", { cx: 160, cy: 640, r: 130, fill: "url(#lampGlow)", class: "flicker" }, LP);
  el("path", { d: "M160 968 V660", stroke: "#1d1d22", "stroke-width": 9 }, LP);
  el("path", { d: "M144 968 h32 l-6 -40 h-20 z", fill: "#1d1d22" }, LP);
  el("path", { d: "M140 664 h40 l-6 -48 h-28 z", fill: "#fff1c4", stroke: "#1d1d22", "stroke-width": 4 }, LP);
  el("path", { d: "M136 616 h48 l-24 -20 z", fill: "#1d1d22" }, LP);
  el("circle", { cx: 160, cy: 592, r: 5, fill: "#1d1d22" }, LP);
  // pigeon
  const PG = g({ class: "pigeon", transform: "translate(640 952)" });
  el("ellipse", { cx: 0, cy: 0, rx: 13, ry: 8, fill: "#8b8f9a" }, PG);
  el("circle", { cx: 11, cy: -7, r: 5.5, fill: "#7b7f8a" }, PG);
  el("path", { d: "M15 -7 l5 1.5 l-5 1.5 z", fill: "#e0a040" }, PG);
  el("path", { d: "M-12 -2 l-9 -3 l2 6 z", fill: "#6c707a" }, PG);
  el("path", { d: "M-2 7 v6 M3 7 v6", stroke: "#d06a5a", "stroke-width": 1.5 }, PG);
  el("circle", { cx: 12.5, cy: -8, r: 1, fill: "#111" }, PG);
})();
