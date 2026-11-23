"use strict";
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
const fmt = (v, g) => (g.decimals != null ? v.toFixed(g.decimals) : String(Math.round(v))).replace(".", ",") + (g.unit || "");
function toast(t) { const e = $("#toast"); e.textContent = t; e.classList.add("on"); setTimeout(() => e.classList.remove("on"), 1600); }
async function copy(t) {
  try { await navigator.clipboard.writeText(t); toast("Copié !"); }
  catch (e) { const a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); toast("Copié !"); } catch (_) {} a.remove(); }
}
const url = id => location.origin + location.pathname + "#" + id;

function cardHTML(c, i) {
  const g = c.guess;
  const guess = g ? `<div class="napkin">
      <p class="nq"><span class="pen">votre pari sur la serviette :</span> ${esc(g.q)}</p>
      <div class="gctl"><input type="range" min="${g.min}" max="${g.max}" step="${g.step}" value="${g.start ?? (g.min + g.max) / 2}" aria-label="votre estimation">
        <span class="gval"></span><button class="btn go">Je parie</button></div>
      <button class="skip">pas de pari, l'addition directement</button>
      <div class="gout" hidden></div></div>`
    : `<div class="napkin"><button class="btn go">L'addition, s'il vous plaît</button></div>`;
  const [vt, vs] = VERDICT[c.verdict];
  return `<article class="card" id="${c.id}">
    <div class="slate"><div class="kick">entendu au comptoir · n°${i + 1}</div><q>${esc(c.claim)}</q></div>
    ${guess}
    <div class="body"><div class="receipt">
      <div class="rhead"><b>CAFÉ DES FAITS</b><span>ticket ${esc(c.id)} · ${DATA.updated}</span></div>
      <p class="short">${c.short}</p>
      <div class="lines">${c.nums.map(n => `<div class="line"><span>${n[1]}</span><b>${n[0]}</b></div>`).join("")}</div>
      <div class="sec"><h4>— la nuance qui compte —</h4><p>${c.nuance}</p></div>
      ${c.steel ? `<div class="sec"><h4>— l'argument le plus solide d'en face —</h4><p class="steel">${c.steel}</p></div>` : ""}
      <div class="verdict ${c.verdict}"><b class="stamp">${vt}</b><span>${c.vnote || vs}</span></div>
      <div class="srcs"><h4>sources</h4><ol>${c.src.map(s => `<li>${s[1] ? `<a href="${s[1]}" target="_blank" rel="noopener">${s[0]}</a>` : s[0]}</li>`).join("")}</ol></div>
      <div class="share"><button class="btn ghost cp-link">Copier le lien</button><button class="btn ghost cp-msg">Copier pour un message</button></div>
      <p class="merci">merci de votre visite · à bientôt au comptoir</p>
    </div></div></article>`;
}

function wire(card, c) {
  const g = c.guess, el = card;
  const open = () => { el.classList.add("open"); };
  const go = el.querySelector(".go");
  if (g) {
    const r = el.querySelector("input"), v = el.querySelector(".gval"), out = el.querySelector(".gout");
    const show = () => { v.textContent = fmt(+r.value, g); };
    r.addEventListener("input", show); show();
    const reveal = (mine, animate) => {
      const span = g.max - g.min, pos = x => Math.max(0, Math.min(100, (x - g.min) / span * 100));
      let mk = "", leg = [];
      if (mine != null) { mk += `<div class="mk you" style="left:${pos(mine)}%">vous<i></i></div>`; leg.push(`vous : <b>${fmt(mine, g)}</b>`); }
      if (g.pub != null) { mk += `<div class="mk pub" style="left:${pos(g.pub)}%">moyenne<i></i></div>`; leg.push(`${esc(g.pubLabel || "estimation moyenne")} : <b>${fmt(g.pub, g)}</b>`); }
      mk += `<div class="mk truth" style="left:${pos(g.a)}%"><i></i>réalité</div>`;
      leg.push(`<span style="color:#d7262b">réalité : <b>${fmt(g.a, g)}</b></span>`);
      let msg = "";
      if (mine != null) {
        const err = Math.abs(mine - g.a) / (span || 1);
        msg = err < 0.05 ? "Dans le mille." : err < 0.15 ? "Pas loin." : mine > g.a ? "Vous avez surestimé." : "Vous avez sous-estimé.";
      }
      out.innerHTML = `<div class="scale"><div class="bar"></div>${mk}</div><p class="legend">${leg.join(" · ")}</p><p class="gres"><b>${msg}</b> ${g.note || ""}</p>`;
      out.hidden = false;
      el.querySelector(".gctl").style.display = "none";
      el.querySelector(".skip").style.display = "none";
      open();
    };
    go.addEventListener("click", () => { const m = +r.value; store.set("g-" + c.id, m); reveal(m); });
    el.querySelector(".skip").addEventListener("click", () => reveal(null));
    const prev = store.get("g-" + c.id);
    if (prev != null) reveal(prev);
    el._reveal = () => { if (!el.classList.contains("open")) reveal(null); };
  } else {
    go.addEventListener("click", () => { open(); go.style.display = "none"; });
    el._reveal = () => { open(); go.style.display = "none"; };
  }
  el.querySelector(".cp-link").addEventListener("click", () => copy(url(c.id)));
  el.querySelector(".cp-msg").addEventListener("click", () => {
    const plain = c.short.replace(/<[^>]+>/g, "");
    copy(`« ${c.claim} »\n→ ${plain}\nSources et détails : ${url(c.id)}`);
  });
}

function render(topicId) {
  const T = DATA.topics.find(t => t.id === topicId) || DATA.topics[0];
  document.body.dataset.topic = T.id;
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("on", b.dataset.t === T.id));
  const on = document.querySelector(".tab.on"); if (on) { const n = on.parentElement; n.scrollLeft = on.offsetLeft - n.offsetLeft - 16; }
  $("#tintro").innerHTML = `<div class="plat">au menu</div><h2>${esc(T.name)}</h2><p>${T.intro}</p>`;
  const box = $("#cards");
  box.innerHTML = T.cards.map((c, i) => cardHTML(c, i)).join("");
  T.cards.forEach(c => wire(document.getElementById(c.id), c));
  store.set("topic", T.id);
}

{
  const nav = $("#tabs");
  nav.innerHTML = DATA.topics.map(t => `<button class="tab" data-t="${t.id}">${esc(t.name)}<span class="n">${t.cards.length}</span></button>`).join("")
;
  nav.addEventListener("click", e => { const b = e.target.closest(".tab"); if (b) { render(b.dataset.t); history.replaceState(null, "", location.pathname); } });
  const fromHash = () => {
    const id = location.hash.slice(1);
    const T = id && DATA.topics.find(t => t.id === id || t.cards.some(c => c.id === id));
    if (T) {
      render(T.id);
      const el = document.getElementById(id);
      if (el && el.classList.contains("card")) { el._reveal(); el.scrollIntoView(); }
      return true;
    }
    return false;
  };
  if (!fromHash()) render(store.get("topic") || DATA.topics[0].id);
  addEventListener("hashchange", fromHash);
}
{ const u = document.getElementById("upd"); if (u) u.textContent = DATA.updated; }
