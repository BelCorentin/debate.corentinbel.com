"use strict";
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
/* debate.corentinbel.com — claim cards. Data in data.js (window.DATA). */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const VERDICT = {
  facts: ["désaccord de faits", "Les chiffres peuvent trancher : la question est de savoir ce qui est vrai."],
  values: ["désaccord de valeurs", "Les chiffres éclairent, mais ne tranchent pas : la question est de savoir ce qu'on trouve juste."],
  both: ["faits + valeurs", "Une partie se tranche avec des chiffres, une autre relève de ce qu'on trouve juste."],
};
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
const fmt = (v, g) => (g.decimals != null ? v.toFixed(g.decimals) : String(Math.round(v))).replace(".", ",") + (g.unit === " ans" && v < 2 ? " an" : (g.unit || ""));
function toast(t) { const e = $("#toast"); e.textContent = t; e.classList.add("on"); setTimeout(() => e.classList.remove("on"), 1600); }
async function copy(t) {
  try { await navigator.clipboard.writeText(t); toast("Copié !"); }
  catch (e) { const a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); toast("Copié !"); } catch (_) {} a.remove(); }
}
const url = id => location.origin + location.pathname + "#" + id;

function cardHTML(c, i) {
  const g = c.guess;
  const [vt, vs] = VERDICT[c.verdict];
  const guess = g ? `<div class="napkin">
      <p class="nq"><span class="pen">votre pari</span>${esc(g.q)}</p>
      <div class="gctl"><input type="range" min="${g.min}" max="${g.max}" step="${g.step}" value="${g.start ?? (g.min + g.max) / 2}" aria-label="votre estimation">
        <output class="gval"></output></div>
      <div class="gbtns"><button class="btn go">Je parie</button><button class="skip">pas de pari, l'addition directement</button></div>
      <div class="gout" hidden></div></div>`
    : `<div class="napkin nog"><p class="nq"><span class="pen">pas de pari ici</span>Le chiffre dépend trop de la méthode pour un seul nombre.</p><div class="gbtns"><button class="btn go">L'addition, s'il vous plaît</button></div></div>`;
  return `<article class="card" id="${c.id}">
    <header class="slate"><div class="kick"><span class="cnum">${String(i + 1).padStart(2, "0")}</span> entendu au comptoir <span class="vpill ${c.verdict}">${vt}</span></div><h3 class="claimq">${esc(c.claim)}</h3></header>
    ${guess}
    <div class="body"><div class="receipt">
      <div class="rhead"><b>CAFÉ DES FAITS</b><span>ticket ${esc(c.id)} · ${DATA.updated}</span></div>
      <p class="short">${c.short}</p>
      <div class="tiles">${c.nums.map(n => `<div class="tile"><b class="tv">${n[0]}</b><span>${n[1]}</span></div>`).join("")}</div>
      <div class="sec nuance"><h4>la nuance qui compte</h4><p>${c.nuance}</p></div>
      ${c.steel ? `<div class="sec steelbox"><h4>l'argument le plus solide d'en face</h4><p>${c.steel}</p></div>` : ""}
      <div class="verdict ${c.verdict}"><b class="stamp">${vt}</b><span>${c.vnote || vs}</span></div>
      <details class="srcs"><summary>sources (${c.src.length})</summary><ol>${c.src.map(s => `<li>${s[1] ? `<a href="${s[1]}" target="_blank" rel="noopener">${s[0]}</a>` : s[0]}</li>`).join("")}</ol></details>
      <div class="share"><button class="btn ghost cp-link">Copier le lien</button><button class="btn ghost cp-msg">Copier pour un message</button></div>
      <p class="merci">merci de votre visite · à bientôt au comptoir</p>
    </div></div></article>`;
}

/* count-up for "−21,8 %", "271 848", "≈ 11 %"… (single number only) */
function countUp(elm) {
  const txt = elm.textContent, m = txt.match(/^([^\d]*?)(\d[\d\u00a0\u202f ]*(?:,\d+)?)([^\d]*)$/);
  if (!m || REDUCED) return;
  const raw = m[2].replace(/[\s\u00a0\u202f]/g, ""), dec = (raw.split(",")[1] || "").length, target = parseFloat(raw.replace(",", "."));
  const grp = /[\s\u00a0\u202f]/.test(m[2]);
  const f = v => { let s = v.toFixed(dec).replace(".", ","); if (grp) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f"); return m[1] + s + m[3]; };
  const t0 = performance.now(), D = 900;
  const step = t => { const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3); elm.textContent = f(target * e); if (k < 1) requestAnimationFrame(step); else elm.textContent = txt; };
  requestAnimationFrame(step);
}
function served() {
  const all = document.querySelectorAll("#cards .card").length, n = document.querySelectorAll("#cards .card.open").length;
  const p = document.getElementById("served"); if (p) p.innerHTML = `<b>${n}</b>/${all} servis`;
}

function wire(card, c) {
  const g = c.guess, el = card;
  const open = () => {
    if (el.classList.contains("open")) return;
    el.classList.add("open");
    el.querySelectorAll(".tv").forEach((t, k) => setTimeout(() => countUp(t), 250 + k * 120));
    served();
  };
  const go = el.querySelector(".go");
  if (g) {
    const r = el.querySelector("input"), v = el.querySelector(".gval"), out = el.querySelector(".gout");
    const show = () => { v.textContent = fmt(+r.value, g); };
    r.addEventListener("input", show); show();
    const reveal = (mine, animate) => {
      const span = g.max - g.min, pos = x => Math.max(0, Math.min(100, (x - g.min) / span * 100));
      let mk = "", leg = [];
      if (mine != null) { mk += `<div class="mk you" style="left:${pos(mine)}%"><em>vous</em><i></i></div>`; leg.push(`vous : <b>${fmt(mine, g)}</b>`); }
      if (g.pub != null) { mk += `<div class="mk pub" style="left:${pos(g.pub)}%">moyenne<i></i></div>`; leg.push(`${esc(g.pubLabel || "estimation moyenne")} : <b>${fmt(g.pub, g)}</b>`); }
      const from = mine != null ? pos(mine) : pos(g.a);
      mk += `<div class="mk truth" data-to="${pos(g.a)}" style="left:${from}%"><i></i><em>réalité</em></div>`;
      leg.push(`<span style="color:#d7262b">réalité : <b>${fmt(g.a, g)}</b></span>`);
      let msg = "";
      if (mine != null) {
        const err = Math.abs(mine - g.a) / (span || 1);
        msg = err < 0.05 ? "Dans le mille." : err < 0.15 ? "Pas loin." : mine > g.a ? "Vous avez surestimé." : "Vous avez sous-estimé.";
      }
      out.innerHTML = `<div class="scale"><div class="bar"></div>${mk}</div><p class="legend">${leg.join("<span class=sep>·</span>")}</p><p class="gres">${msg ? `<b>${msg}</b> ` : ""}${g.note || ""}</p>`;
      out.hidden = false;
      const tm = out.querySelector(".mk.truth");
      requestAnimationFrame(() => requestAnimationFrame(() => { tm.style.left = tm.dataset.to + "%"; }));
      el.querySelector(".gctl").style.display = "none";
      el.querySelector(".gbtns").style.display = "none";
      open();
    };
    go.addEventListener("click", () => { const m = +r.value; store.set("g-" + c.id, m); reveal(m); });
    el.querySelector(".skip").addEventListener("click", () => reveal(null));
    const prev = store.get("g-" + c.id);
    if (prev != null) reveal(prev);
    el._reveal = () => { if (!el.classList.contains("open")) reveal(null); };
  } else {
    go.addEventListener("click", () => { open(); el.querySelector(".napkin").classList.add("done"); });
    el._reveal = () => { open(); el.querySelector(".napkin").classList.add("done"); };
  }
  el.querySelector(".cp-link").addEventListener("click", () => copy(url(c.id)));
  el.querySelector(".cp-msg").addEventListener("click", () => {
    const plain = c.short.replace(/<[^>]+>/g, "");
    copy(`« ${c.claim} »\n→ ${plain}\nSources et détails : ${url(c.id)}`);
  });
}

const COURSES = [
  ["Entrées", "société", ["femmes", "immigration", "laicite", "ecole"]],
  ["Plats", "l'argent de tous", ["retraites", "dette", "impots", "assistanat"]],
  ["Plats du jour", "l'État au quotidien", ["securite", "sante"]],
  ["Desserts", "le monde et nous", ["climat", "europe", "democratie"]],
];
const topicById = id => DATA.topics.find(t => t.id === id);
const ORDER = COURSES.flatMap(c => c[2]).filter(topicById).concat(DATA.topics.map(t => t.id).filter(id => !COURSES.some(c => c[2].includes(id))));

function buildMenu() {
  const extra = ORDER.filter(id => !COURSES.some(c => c[2].includes(id)));
  const courses = extra.length ? COURSES.concat([["Suggestions", "nouveautés", extra]]) : COURSES;
  $("#courses").innerHTML = courses.map(([name, sub, ids]) => {
    const items = ids.map(topicById).filter(Boolean);
    if (!items.length) return "";
    return `<section class="course-sec"><h2 class="course">${name}<small>${sub}</small></h2>${items.map(t =>
      `<a class="dish" href="#${t.id}" data-t="${t.id}"><span class="dname">${esc(t.name)}</span><span class="dots"></span><span class="dprice">${t.cards.length}<small> tickets</small></span><span class="ddesc">${t.intro.split(". ")[0].replace(/\.$/, "")}.</span></a>`).join("")}</section>`;
  }).join("");
}

function render(topicId) {
  const T = topicById(topicId) || topicById(ORDER[0]);
  document.body.dataset.topic = T.id;
  $("#tbname").textContent = T.name;
  const i = ORDER.indexOf(T.id);
  const prev = ORDER[(i - 1 + ORDER.length) % ORDER.length], next = ORDER[(i + 1) % ORDER.length];
  $("#prevT").onclick = () => { location.hash = prev; };
  $("#nextT").onclick = $("#nextT2").onclick = () => { location.hash = next; };
  $("#nextT2").textContent = "plat suivant : " + topicById(next).name + " →";
  $("#tintro").innerHTML = `<div class="plat">${esc(COURSES.find(c => c[2].includes(T.id))?.[0] || "au menu")}</div><h2>${esc(T.name)}</h2><p>${T.intro}</p>`;
  $("#cards").innerHTML = T.cards.map((c, k) => cardHTML(c, k)).join("");
  T.cards.forEach(c => wire(document.getElementById(c.id), c));
  served();
  if ("IntersectionObserver" in window && !REDUCED) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    requestAnimationFrame(() => document.querySelectorAll("#cards .card").forEach(c => { if (c.getBoundingClientRect().top > innerHeight * .9) { c.classList.add("pre"); io.observe(c); } }));
  }
  store.set("topic", T.id);
}

/* ---------- views + transitions ---------- */
let current = null;
function show(view, after) {
  const from = current;
  current = view;
  const curtain = $("#curtain");
  const swap = () => {
    document.body.dataset.view = view;
    window.scrollTo(0, 0);
    if (after) after();
  };
  if (REDUCED || !from) { swap(); return; }
  if (from === "dehors" && view !== "dehors") {
    document.body.classList.add("entering");
    setTimeout(() => { swap(); document.body.classList.remove("entering"); document.body.classList.add("arrived"); setTimeout(() => document.body.classList.remove("arrived"), 700); }, 950);
  } else if (from !== view) {
    curtain.classList.add("on");
    setTimeout(() => { swap(); curtain.classList.remove("on"); }, 320);
  } else swap();
}

function route() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id || id === "dehors") return show("dehors");
  if (id === "carte" || id === "methode") return show("carte", () => { if (id === "methode") document.getElementById("methode").scrollIntoView(); });
  const T = DATA.topics.find(t => t.id === id || t.cards.some(c => c.id === id));
  if (!T) return show("dehors");
  if (document.body.dataset.topic !== T.id || !$("#cards").children.length) render(T.id);
  show("table", () => {
    const el = document.getElementById(id);
    if (el && el.classList.contains("card")) { el._reveal(); requestAnimationFrame(() => el.scrollIntoView()); }
  });
}

buildMenu();
const enter = () => { location.hash = "carte"; };
$("#enter").addEventListener("click", enter);
for (const id of ["door", "board"]) {
  const e = document.getElementById(id);
  if (e) { e.addEventListener("click", enter); e.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); enter(); } }); }
}
document.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) { e.preventDefault(); location.hash = b.dataset.go; } });
addEventListener("hashchange", route);
route();
{ const u = document.getElementById("upd"); if (u) u.textContent = DATA.updated; }
