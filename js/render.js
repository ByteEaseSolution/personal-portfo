/* Builds the whole scrollable page from the data object (chapter-based). */

(function () {
  const data = loadPortfolioData();
  const root = document.getElementById("app");
  if (!root) return;

  const rot = (i) => ((i * 37) % 7) - 3;          // pseudo-random tilt -3..+3 deg
  const has = (v) => v !== undefined && v !== null && String(v).trim() !== "";
  const kicker = (n) => String(n).padStart(2, "0");

  /* ---------- photo card (polaroid + caption + backstory) ---------- */
  function photoCard(p, i) {
    const metaBits = [p.place, p.date].filter(has).join(" · ");
    const img = has(p.src)
      ? `<span class="tape"></span><div class="photo"><img loading="lazy" src="${esc(resolvePhotoSrc(p.src))}" alt="${esc(p.caption || "")}"></div>`
      : `<div class="photo photo--empty">add a photo</div>`;
    const cap = (has(p.caption) || has(metaBits))
      ? `<figcaption>${esc(p.caption || "")}${has(metaBits) ? `<span class="meta">${esc(metaBits)}</span>` : ""}</figcaption>`
      : "";
    const story = has(p.story) ? `<p class="photo-story">${esc(p.story)}</p>` : "";
    return `
      <figure class="polaroid tilt" style="--rot:${rot(i)}deg">
        ${img}${cap}${story}
      </figure>`;
  }

  /* ---------- one chapter = one section ---------- */
  function renderChapter(ch, n) {
    const paras = (ch.paragraphs || []).filter(has);
    const facts = (ch.facts || []).filter((f) => has(f.value));
    const tags = (ch.interests || []).filter(has);
    const photos = (ch.photos || []);

    let body = "";
    if (has(ch.intro)) body += `<p class="lead center">${esc(ch.intro)}</p>`;
    if (paras.length) body += `<div class="prose">${paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`;
    if (facts.length) {
      body += `<dl class="facts facts--card">${facts
        .map((f) => `<div class="fact"><dt>${esc(f.label)}</dt><dd>${esc(f.value).replace(/\n/g, "<br>")}</dd></div>`)
        .join("")}</dl>`;
    }
    if (tags.length) {
      body += `<div class="chips center">${tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>`;
    }
    if (photos.length) {
      body += `<div class="scrapbook">${photos.map((p, i) => photoCard(p, i)).join("")}</div>`;
    } else if (!paras.length && !facts.length && !tags.length) {
      body += `<p class="empty-hint">Add photos or text for this section in the editor (admin.html).</p>`;
    }

    const id = "ch-" + n;
    return `
      <section class="section" id="${id}">
        <div class="section-head">
          <span class="kicker">${kicker(n)}</span>
          <h2 class="section-title">${esc(ch.title || "")}</h2>
          <span class="rule"></span>
        </div>
        ${body}
      </section>`;
  }

  /* ---------- cover ---------- */
  function renderCover() {
    const m = data.meta || {};
    const bg = has(m.coverPhoto)
      ? `style="background-image:linear-gradient(rgba(70,40,58,.45),rgba(70,40,58,.65)), url('${esc(resolvePhotoSrc(m.coverPhoto))}')" class="cover cover--photo"`
      : `class="cover"`;
    return `
      <header ${bg}>
        <div class="cover-inner">
          <p class="cover-eyebrow">A personal portfolio</p>
          <h1 class="cover-name">${esc(m.name || "")}</h1>
          <p class="cover-tagline">${esc(m.tagline || "")}</p>
          <span class="cover-scroll">scroll to begin ↓</span>
        </div>
      </header>`;
  }

  /* ---------- closing ---------- */
  function renderClosing() {
    const c = data.closing || {};
    const text = (c.text || []).filter(has).map((p) => `<p>${esc(p)}</p>`).join("");
    const sign = has(c.signoff) ? esc(c.signoff).replace(/\n/g, "<br>") : "";
    return `
      <section class="section closing" id="closing">
        <div class="closing-card">
          <h2>${esc(c.heading || "Thank you")}</h2>
          ${text}
          ${sign ? `<p class="signoff">${sign}</p>` : ""}
        </div>
      </section>`;
  }

  /* ---------- assemble ---------- */
  const chapters = (data.chapters || []);
  root.innerHTML =
    renderCover() +
    `<main class="pages">` +
      chapters.map((ch, idx) => renderChapter(ch, idx + 1)).join("") +
      renderClosing() +
    `</main>`;

  // Top nav from chapter titles
  const nav = document.getElementById("nav-links");
  if (nav) {
    nav.innerHTML = chapters
      .filter((ch) => has(ch.title))
      .map((ch, idx) => `<a href="#ch-${idx + 1}">${esc(ch.title)}</a>`)
      .join("");
  }
})();
