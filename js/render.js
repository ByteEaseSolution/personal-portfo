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
      ? `<span class="tape"></span><div class="photo"><img loading="lazy" referrerpolicy="no-referrer" src="${esc(resolvePhotoSrc(p.src))}" alt="${esc(p.caption || "")}"></div>`
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

  /* image-only polaroid, used inside a shared-caption group */
  function photoImgOnly(p, i, label) {
    if (!has(p.src)) return "";
    return `
      <figure class="polaroid tilt" style="--rot:${rot(i)}deg">
        <span class="tape"></span>
        <div class="photo"><img loading="lazy" referrerpolicy="no-referrer" data-caption="${esc(label || "")}" src="${esc(resolvePhotoSrc(p.src))}" alt="${esc(label || "")}"></div>
      </figure>`;
  }

  /* Build the gallery. Consecutive photos that share the same "group" label are
     clustered together under one shared caption; others render individually. */
  function buildScrapbook(photos) {
    const items = [];
    let i = 0;
    while (i < photos.length) {
      const g = (photos[i].group || "").trim();
      if (g) {
        const grp = [photos[i]]; let j = i + 1;
        while (j < photos.length && (photos[j].group || "").trim() === g) { grp.push(photos[j]); j++; }
        items.push({ type: "group", label: g, photos: grp });
        i = j;
      } else {
        items.push({ type: "single", photo: photos[i] });
        i++;
      }
    }
    let n = 0;
    const html = items.map((it) => {
      if (it.type === "single") return photoCard(it.photo, n++);
      const imgs = it.photos.map((p) => photoImgOnly(p, n++, it.label)).join("");
      return `<div class="photo-group"><div class="group-photos">${imgs}</div><div class="group-label">${esc(it.label)}</div></div>`;
    }).join("");
    return `<div class="scrapbook">${html}</div>`;
  }

  /* ---------- one chapter = one section ---------- */
  function renderChapter(ch, n) {
    const paras = (ch.paragraphs || []).filter(has);
    const facts = (ch.facts || []).filter((f) => has(f.value));
    const tags = (ch.interests || []).filter(has);
    // Skip completely-empty photo slots so they don't show an "add a photo" box.
    const photos = (ch.photos || []).filter((p) => has(p.src) || has(p.caption) || has(p.story));

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
      body += buildScrapbook(photos);
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
