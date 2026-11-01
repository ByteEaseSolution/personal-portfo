/* Tap any photo to open it enlarged in a popup, with caption + backstory,
   and swipe/arrow through the rest. */

(function () {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const img = lb.querySelector(".lb-img");
  const cap = lb.querySelector(".lb-cap");
  const btnClose = lb.querySelector(".lb-close");
  const btnPrev = lb.querySelector(".lb-prev");
  const btnNext = lb.querySelector(".lb-next");

  img.referrerPolicy = "no-referrer";   // so Drive images load in the popup too
  let gallery = [];
  let idx = 0;

  function collect() {
    gallery = Array.prototype.slice.call(document.querySelectorAll(".scrapbook .polaroid"))
      .map((fig) => {
        const im = fig.querySelector(".photo img");
        if (!im) return null;
        const capEl = fig.querySelector("figcaption");
        const storyEl = fig.querySelector(".photo-story");
        let caption = "", meta = "";
        if (capEl) {
          const metaEl = capEl.querySelector(".meta");
          meta = metaEl ? metaEl.textContent : "";
          const first = capEl.childNodes[0];
          caption = first && first.nodeType === 3 ? first.textContent.trim() : "";
        }
        return { el: im, src: im.getAttribute("src"), caption, meta, story: storyEl ? storyEl.textContent : "" };
      })
      .filter(Boolean);
  }

  function render() {
    const g = gallery[idx];
    if (!g) return;
    img.src = g.src;
    img.alt = g.caption || "";
    let html = "";
    if (g.caption) html += esc(g.caption);
    if (g.meta) html += '<span class="lb-meta">' + esc(g.meta) + "</span>";
    if (g.story) html += '<span class="lb-story">' + esc(g.story) + "</span>";
    cap.innerHTML = html;
    const many = gallery.length > 1;
    btnPrev.style.display = many ? "flex" : "none";
    btnNext.style.display = many ? "flex" : "none";
  }

  function open(i) { idx = i; render(); lb.classList.add("show"); document.body.style.overflow = "hidden"; }
  function close() { lb.classList.remove("show"); document.body.style.overflow = ""; img.src = ""; }
  function prev() { idx = (idx - 1 + gallery.length) % gallery.length; render(); }
  function next() { idx = (idx + 1) % gallery.length; render(); }

  // Open on click of any gallery photo
  document.addEventListener("click", (e) => {
    const im = e.target.closest(".scrapbook .polaroid .photo img");
    if (!im) return;
    collect();
    const i = gallery.findIndex((g) => g.el === im);
    if (i >= 0) open(i);
  });

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", (e) => { e.stopPropagation(); prev(); });
  btnNext.addEventListener("click", (e) => { e.stopPropagation(); next(); });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-figure")) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("show")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
  });

  // Basic swipe support on touch devices
  let sx = 0;
  lb.addEventListener("touchstart", (e) => { sx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50 && gallery.length > 1) { dx > 0 ? prev() : next(); }
  }, { passive: true });
})();
