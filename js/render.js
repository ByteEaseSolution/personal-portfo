/* Builds the whole scrollable page from the data object. */

(function () {
  const data = loadPortfolioData();
  const root = document.getElementById("app");
  if (!root) return;

  const rot = (i) => ((i * 37) % 7) - 3;          // pseudo-random tilt -3..+3 deg
  const has = (v) => v !== undefined && v !== null && String(v).trim() !== "";

  /* ---------- small builders ---------- */

  function photoFrame(src, caption, meta, i) {
    if (!has(src)) {
      return `
        <figure class="polaroid tilt" style="--rot:${rot(i)}deg">
          <div class="photo photo--empty">add a photo</div>
          ${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}
        </figure>`;
    }
    return `
      <figure class="polaroid tilt" style="--rot:${rot(i)}deg">
        <span class="tape"></span>
        <div class="photo"><img loading="lazy" src="${esc(resolvePhotoSrc(src))}" alt="${esc(caption || "")}"></div>
        ${has(caption) || has(meta) ? `<figcaption>${esc(caption || "")}${has(meta) ? `<span class="meta">${esc(meta)}</span>` : ""}</figcaption>` : ""}
      </figure>`;
  }

  function section(id, title, bodyHTML, kicker) {
    return `
      <section class="section" id="${id}">
        <div class="section-head">
          ${kicker ? `<span class="kicker">${esc(kicker)}</span>` : ""}
          <h2 class="section-title">${esc(title)}</h2>
          <span class="rule"></span>
        </div>
        ${bodyHTML}
      </section>`;
  }

  /* ---------- cover ---------- */

  function renderCover() {
    const m = data.meta || {};
    const bg = has(m.coverPhoto)
      ? `style="background-image:linear-gradient(rgba(45,32,24,.45),rgba(45,32,24,.65)), url('${esc(resolvePhotoSrc(m.coverPhoto))}')" class="cover cover--photo"`
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

  /* ---------- about ---------- */

  function renderAbout() {
    const a = data.about || {};
    const facts = (a.facts || []).filter(f => has(f.value))
      .map(f => `<div class="fact"><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("");
    const bio = (a.bio || []).filter(has).map(p => `<p>${esc(p)}</p>`).join("");
    const interests = (a.interests || []).filter(has)
      .map(x => `<span class="chip">${esc(x)}</span>`).join("");

    const body = `
      <div class="about-grid">
        <div class="about-photo">${photoFrame(a.photo, "", "", 1)}</div>
        <div class="about-text">
          ${bio}
          ${facts ? `<dl class="facts">${facts}</dl>` : ""}
          ${interests ? `<div class="chips"><span class="chips-label">A few things I love:</span>${interests}</div>` : ""}
        </div>
      </div>`;
    return section("about", a.heading || "About Me", body, "01");
  }

  /* ---------- family ---------- */

  function renderFamily() {
    const f = data.family || {};
    const members = (f.members || []).filter(m => has(m.name))
      .map(m => `
        <div class="member">
          <span class="member-rel">${esc(m.relation)}</span>
          <span class="member-name">${esc(m.name)}</span>
          ${has(m.note) ? `<span class="member-note">${esc(m.note)}</span>` : ""}
        </div>`).join("");
    const values = (f.values || []).filter(has).map(v => `<li>${esc(v)}</li>`).join("");

    const body = `
      <div class="split">
        <div class="split-media">${photoFrame(f.photo, "My family", "", 2)}</div>
        <div class="split-text">
          ${has(f.intro) ? `<p class="lead">${esc(f.intro)}</p>` : ""}
          ${members ? `<div class="members">${members}</div>` : ""}
          ${values ? `<h3 class="mini-head">What we hold close</h3><ul class="values">${values}</ul>` : ""}
        </div>
      </div>`;
    return section("family", f.heading || "My Family", body, "02");
  }

  /* ---------- culture ---------- */

  function renderCulture() {
    const c = data.culture || {};
    const facts = (c.facts || []).filter(x => has(x.value))
      .map(x => `<div class="fact"><dt>${esc(x.label)}</dt><dd>${esc(x.value)}</dd></div>`).join("");
    const trad = (c.traditions || []).filter(has).map(t => `<li>${esc(t)}</li>`).join("");
    const fest = (c.festivals || []).filter(has).map(x => `<span class="chip chip--warm">${esc(x)}</span>`).join("");

    const body = `
      ${has(c.intro) ? `<p class="lead center">${esc(c.intro)}</p>` : ""}
      <div class="culture-grid">
        ${facts ? `<dl class="facts facts--card">${facts}</dl>` : ""}
        <div class="culture-notes">
          ${trad ? `<h3 class="mini-head">Traditions we cherish</h3><ul class="values">${trad}</ul>` : ""}
          ${fest ? `<h3 class="mini-head">Festivals we celebrate</h3><div class="chips">${fest}</div>` : ""}
        </div>
      </div>
      ${has(c.note) ? `<p class="note">${esc(c.note)}</p>` : ""}`;
    return section("culture", c.heading || "Culture & Roots", body, "03");
  }

  /* ---------- story / timeline ---------- */

  function renderStory() {
    const s = data.story || {};
    const items = (s.timeline || []).filter(t => has(t.title) || has(t.text))
      .map((t, i) => `
        <div class="tl-item">
          <div class="tl-dot"></div>
          <div class="tl-card">
            ${has(t.date) ? `<span class="tl-date">${esc(t.date)}</span>` : ""}
            ${has(t.title) ? `<h3>${esc(t.title)}</h3>` : ""}
            ${has(t.text) ? `<p>${esc(t.text)}</p>` : ""}
            ${has(t.photo) ? `<div class="tl-photo">${photoFrame(t.photo, "", "", i + 3)}</div>` : ""}
          </div>
        </div>`).join("");

    const body = `
      ${has(s.herName) ? `<p class="lead center">${esc(s.intro)}</p>` : (has(s.intro) ? `<p class="lead center">${esc(s.intro)}</p>` : "")}
      <div class="timeline">${items}</div>`;
    return section("story", s.heading || "How We Met", body, "04");
  }

  /* ---------- gallery ---------- */

  function renderGallery() {
    const g = data.gallery || {};
    const photos = (g.photos || []);
    if (!photos.length) {
      return section("gallery", g.heading || "Our Adventures",
        `<p class="empty-hint">Add photos in the admin editor (admin.html) and they'll appear here as a scrapbook.</p>`, "05");
    }
    const body = `
      ${has(g.intro) ? `<p class="lead center">${esc(g.intro)}</p>` : ""}
      <div class="scrapbook">
        ${photos.map((p, i) => photoFrame(p.src, p.caption, [p.place, p.date].filter(has).join(" · "), i)).join("")}
      </div>`;
    return section("gallery", g.heading || "Our Adventures", body, "05");
  }

  /* ---------- videos ---------- */

  function renderVideos() {
    const v = data.videos || {};
    const items = (v.items || []).filter(x => has(x.url));
    if (!items.length) {
      return section("videos", v.heading || "Places We Love",
        `<p class="empty-hint">Add video links in the admin editor (admin.html).</p>`, "06");
    }
    const cards = items.map((it, i) => {
      const info = parseVideo(it.url);
      const player = info && info.embed
        ? `<div class="video-embed"><iframe src="${esc(info.embed)}" title="${esc(it.title || "video")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
        : `<a class="video-embed video-embed--link" href="${esc(it.url)}" target="_blank" rel="noopener">▶ Open video</a>`;
      // Print-only fallback (shown in PDF where iframes can't play)
      const printCard = `
        <div class="video-print">
          ${info && info.thumb ? `<img src="${esc(info.thumb)}" alt="">` : `<div class="video-print__ph">▶</div>`}
          <div class="video-print__body">
            <strong>${esc(it.title || "Video")}</strong>
            <span class="video-print__url">${esc((info && info.watch) || it.url)}</span>
          </div>
        </div>`;
      return `
        <div class="video-card">
          ${player}
          ${printCard}
          <div class="video-meta">
            ${has(it.title) ? `<h3>${esc(it.title)}</h3>` : ""}
            ${has(it.place) ? `<span class="video-place">${esc(it.place)}</span>` : ""}
            ${has(it.description) ? `<p>${esc(it.description)}</p>` : ""}
          </div>
        </div>`;
    }).join("");

    const body = `
      ${has(v.intro) ? `<p class="lead center">${esc(v.intro)}</p>` : ""}
      <div class="videos">${cards}</div>`;
    return section("videos", v.heading || "Places We Love", body, "06");
  }

  /* ---------- closing ---------- */

  function renderClosing() {
    const c = data.closing || {};
    const text = (c.text || []).filter(has).map(p => `<p>${esc(p)}</p>`).join("");
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

  root.innerHTML =
    renderCover() +
    `<main class="pages">` +
      renderAbout() +
      renderFamily() +
      renderCulture() +
      renderStory() +
      renderGallery() +
      renderVideos() +
      renderClosing() +
    `</main>`;

  // Build the top nav links
  const nav = document.getElementById("nav-links");
  if (nav) {
    const links = [
      ["about", data.about && data.about.heading || "About"],
      ["family", data.family && data.family.heading || "Family"],
      ["culture", data.culture && data.culture.heading || "Culture"],
      ["story", data.story && data.story.heading || "Our Story"],
      ["gallery", data.gallery && data.gallery.heading || "Photos"],
      ["videos", data.videos && data.videos.heading || "Videos"]
    ];
    nav.innerHTML = links.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join("");
  }
})();
