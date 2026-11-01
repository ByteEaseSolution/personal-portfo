/* ===========================================================================
   In-browser editor (chapter-based). Auto-saves to this browser for preview;
   use "Download data.js" to keep changes with the site (so they travel).
   =========================================================================== */

(function () {
  let data = loadPortfolioData();
  ensureShape(data);

  const $ = (sel, el = document) => el.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };

  /* ---- make sure expected arrays/objects exist ---- */
  function ensureArrays(ch) {
    if (!Array.isArray(ch.paragraphs)) ch.paragraphs = [];
    if (!Array.isArray(ch.facts)) ch.facts = [];
    if (!Array.isArray(ch.interests)) ch.interests = [];
    if (!Array.isArray(ch.photos)) ch.photos = [];
  }
  function ensureShape(d) {
    if (!d.meta) d.meta = { name: "", tagline: "", coverPhoto: "" };
    if (!Array.isArray(d.chapters)) d.chapters = [];
    d.chapters.forEach(ensureArrays);
    if (!d.closing) d.closing = { heading: "Thank you", text: [], signoff: "" };
    if (!Array.isArray(d.closing.text)) d.closing.text = [];
  }
  function emptyChapter() {
    return { title: "New section", intro: "", paragraphs: [], facts: [], interests: [], photos: [] };
  }
  function emptyPhoto() { return { src: "", caption: "", story: "", place: "", date: "" }; }

  /* ---- autosave ---- */
  function setStatus(text, cls) {
    const s = $("#status");
    if (!s) return;
    s.textContent = text;
    s.className = "status " + (cls || "");
  }
  let saveTimer = null;
  function scheduleAutosave() {
    setStatus("Saving…", "saving");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const ok = savePortfolioData(data);
      setStatus(ok ? "✓ All changes saved" : "⚠ Storage full — use Download data.js", ok ? "saved" : "err");
    }, 500);
  }

  /* ---- field builders (operate on an object/array reference) ---- */
  function textInput(obj, key, label, opts = {}) {
    const wrap = el("label", "fld");
    wrap.appendChild(el("span", "fld-label", label));
    const input = opts.area ? el("textarea") : el("input");
    if (!opts.area) input.type = "text";
    if (opts.area) input.rows = opts.rows || 3;
    if (opts.placeholder) input.placeholder = opts.placeholder;
    input.value = obj[key] ?? "";
    input.addEventListener("input", () => { obj[key] = input.value; });
    wrap.appendChild(input);
    return wrap;
  }

  function stringList(arr, label, placeholder) {
    const box = el("div", "sublist");
    box.appendChild(el("h4", "sublist-head", label));
    const list = el("div");
    box.appendChild(list);
    function render() {
      list.innerHTML = "";
      arr.forEach((val, i) => {
        const row = el("div", "row");
        const input = el("input");
        input.type = "text";
        input.value = val ?? "";
        input.placeholder = placeholder || "";
        input.addEventListener("input", () => { arr[i] = input.value; });
        const del = el("button", "mini danger", "✕"); del.type = "button";
        del.onclick = () => { arr.splice(i, 1); render(); scheduleAutosave(); };
        row.append(input, del);
        list.appendChild(row);
      });
      const add = el("button", "mini add", "+ Add"); add.type = "button";
      add.onclick = () => { arr.push(""); render(); scheduleAutosave(); };
      list.appendChild(add);
    }
    render();
    return box;
  }

  function objectList(arr, label, fields, makeEmpty, hint) {
    const box = el("div", "sublist");
    box.appendChild(el("h4", "sublist-head", label));
    if (hint) box.appendChild(el("p", "hint", hint));
    const list = el("div");
    box.appendChild(list);
    function render() {
      list.innerHTML = "";
      arr.forEach((item, i) => {
        const card = el("div", "item-card");
        const head = el("div", "item-card-head");
        head.appendChild(el("span", "item-num", "#" + (i + 1)));
        const ctrls = el("div", "item-ctrls");
        const up = el("button", "mini", "↑"); up.type = "button";
        up.onclick = () => { if (i > 0) { [arr[i-1], arr[i]] = [arr[i], arr[i-1]]; render(); scheduleAutosave(); } };
        const down = el("button", "mini", "↓"); down.type = "button";
        down.onclick = () => { if (i < arr.length-1) { [arr[i+1], arr[i]] = [arr[i], arr[i+1]]; render(); scheduleAutosave(); } };
        const del = el("button", "mini danger", "✕"); del.type = "button";
        del.onclick = () => { arr.splice(i, 1); render(); scheduleAutosave(); };
        ctrls.append(up, down, del); head.appendChild(ctrls); card.appendChild(head);
        fields.forEach((f) => {
          if (f.type === "photo") card.appendChild(photoInput(item, f.key, f.label));
          else card.appendChild(textInput(item, f.key, f.label, { area: f.area, rows: f.rows, placeholder: f.placeholder }));
        });
        list.appendChild(card);
      });
      const add = el("button", "mini add", "+ Add"); add.type = "button";
      add.onclick = () => { arr.push(makeEmpty()); render(); scheduleAutosave(); };
      list.appendChild(add);
    }
    render();
    return box;
  }

  function photoInput(obj, key, label) {
    const wrap = el("div", "fld");
    wrap.appendChild(el("span", "fld-label", label || "Photo"));
    const row = el("div", "photo-row");
    const input = el("input");
    input.type = "text";
    input.placeholder = "photos/your-file.jpg  — or paste a Google Drive link";
    input.value = obj[key] ?? "";
    input.addEventListener("input", () => { obj[key] = input.value; updatePreview(); });

    const pick = el("label", "mini pick", "Choose file…");
    const file = el("input"); file.type = "file"; file.accept = "image/*"; file.style.display = "none";
    file.addEventListener("change", () => {
      const f = file.files[0]; if (!f) return;
      obj[key] = "photos/" + f.name; input.value = obj[key];
      const reader = new FileReader();
      reader.onload = () => { preview.src = reader.result; preview.style.display = "block"; };
      reader.readAsDataURL(f);
    });
    pick.appendChild(file);
    row.append(input, pick); wrap.appendChild(row);

    const preview = el("img", "photo-preview"); preview.style.display = "none"; wrap.appendChild(preview);
    wrap.appendChild(el("p", "hint", "Use a file in the <b>photos/</b> folder, <b>or</b> paste a Google&nbsp;Drive link (“Anyone with the link”)."));
    function updatePreview() {
      if (obj[key]) { preview.src = resolvePhotoSrc(obj[key]); preview.style.display = "block"; preview.onerror = () => { preview.style.display = "none"; }; }
    }
    updatePreview();
    return wrap;
  }

  /* ---- chapter editor ---- */
  function chapterEditor(chapters) {
    const list = el("div");
    let dragFrom = null;
    function render() {
      list.innerHTML = "";
      chapters.forEach((ch, i) => {
        ensureArrays(ch);
        const d = el("details", "sec sec--chapter");

        // summary with a drag handle
        const summary = el("summary");
        const handle = el("span", "drag-handle", "⠿");
        handle.draggable = true;
        handle.title = "Drag to reorder";
        handle.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); });
        handle.addEventListener("dragstart", (e) => {
          dragFrom = i; e.dataTransfer.effectAllowed = "move";
          try { e.dataTransfer.setData("text/plain", String(i)); } catch (_) {}
          d.classList.add("dragging");
        });
        handle.addEventListener("dragend", () => {
          d.classList.remove("dragging");
          list.querySelectorAll(".drag-over").forEach((n) => n.classList.remove("drag-over"));
        });
        summary.append(handle, document.createTextNode((i + 1) + ". " + (ch.title || "Untitled section")));
        d.appendChild(summary);

        // drop target
        d.addEventListener("dragover", (e) => {
          if (dragFrom === null) return;
          e.preventDefault(); e.dataTransfer.dropEffect = "move";
          d.classList.add("drag-over");
        });
        d.addEventListener("dragleave", () => { d.classList.remove("drag-over"); });
        d.addEventListener("drop", (e) => {
          if (dragFrom === null) return;
          e.preventDefault(); d.classList.remove("drag-over");
          const from = dragFrom, to = i; dragFrom = null;
          if (from !== to) {
            const [moved] = chapters.splice(from, 1);
            chapters.splice(to, 0, moved);
            render(); scheduleAutosave();
          }
        });

        const body = el("div", "sec-body");

        const ctrls = el("div", "chapter-ctrls");
        const up = el("button", "mini", "↑ Up"); up.type = "button";
        up.onclick = () => { if (i > 0) { [chapters[i-1], chapters[i]] = [chapters[i], chapters[i-1]]; render(); scheduleAutosave(); } };
        const down = el("button", "mini", "↓ Down"); down.type = "button";
        down.onclick = () => { if (i < chapters.length-1) { [chapters[i+1], chapters[i]] = [chapters[i], chapters[i+1]]; render(); scheduleAutosave(); } };
        const del = el("button", "mini danger", "✕ Delete section"); del.type = "button";
        del.onclick = () => { if (confirm("Delete this whole section?")) { chapters.splice(i, 1); render(); scheduleAutosave(); } };
        ctrls.append(up, down, del); body.appendChild(ctrls);

        body.appendChild(textInput(ch, "title", "Section title"));
        body.appendChild(textInput(ch, "intro", "Intro line (one warm sentence)", { area: true, rows: 2 }));
        body.appendChild(stringList(ch.paragraphs, "Paragraphs (optional — for story/about sections)", "Write a paragraph…"));

        const extra = el("details", "sub-details");
        extra.appendChild(el("summary", null, "Facts & tags (optional)"));
        const eb = el("div", "sec-body");
        eb.appendChild(objectList(ch.facts, "Facts",
          [{ key: "label", label: "Label", placeholder: "e.g. Born" }, { key: "value", label: "Value" }],
          () => ({ label: "", value: "" })));
        eb.appendChild(stringList(ch.interests, "Tags", "e.g. Travel"));
        extra.appendChild(eb);
        body.appendChild(extra);

        body.appendChild(objectList(ch.photos, "Photos",
          [{ key: "src", label: "Photo", type: "photo" },
           { key: "caption", label: "Caption (short)" },
           { key: "story", label: "Backstory / story", area: true, rows: 3 },
           { key: "place", label: "Place", placeholder: "e.g. Goa" },
           { key: "date", label: "Date", placeholder: "e.g. Dec 2024" }],
          emptyPhoto,
          "Add a photo for each memory — the backstory shows under the photo."));

        d.appendChild(body);
        list.appendChild(d);
      });
      const add = el("button", "btn primary add-chapter", "+ Add a custom section"); add.type = "button";
      add.onclick = () => { chapters.push(emptyChapter()); render(); scheduleAutosave(); };
      list.appendChild(add);
    }
    render();
    return list;
  }

  /* ---- build the form ---- */
  function sec(parent, title, builder, open) {
    const d = el("details", "sec");
    d.open = !!open;
    d.appendChild(el("summary", null, title));
    const body = el("div", "sec-body");
    builder(body);
    d.appendChild(body);
    parent.appendChild(d);
  }

  function build() {
    const f = $("#form");
    f.innerHTML = "";
    sec(f, "Cover", (b) => {
      b.append(
        textInput(data.meta, "name", "Your name (big on cover)"),
        textInput(data.meta, "tagline", "Tagline / one-line intro", { area: true, rows: 2 }),
        photoInput(data.meta, "coverPhoto", "Cover background photo (optional)")
      );
    }, true);

    sec(f, "Sections", (b) => { b.appendChild(chapterEditor(data.chapters)); }, true);

    sec(f, "Closing note", (b) => {
      b.append(textInput(data.closing, "heading", "Heading"));
      b.appendChild(stringList(data.closing.text, "Closing paragraphs", "Write a paragraph…"));
      b.append(textInput(data.closing, "signoff", "Sign-off (Enter for new lines)", { area: true, rows: 2 }));
    });
  }

  /* ---- actions ---- */
  function toast(msg, ok = true) {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast show " + (ok ? "ok" : "err");
    setTimeout(() => { t.className = "toast"; }, 3200);
  }
  function buildDataJsText() {
    return "/* Portfolio content. Generated by admin.html. */\n" +
           "window.PORTFOLIO_DATA = " + JSON.stringify(data, null, 2) + ";\n";
  }
  function download() {
    savePortfolioData(data);
    const blob = new Blob([buildDataJsText()], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = el("a"); a.href = url; a.download = "data.js";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast("Downloaded data.js — replace the file in your js/ folder, then commit & push.");
  }
  /* Parse an uploaded data.js and pull out the PORTFOLIO_DATA object.
     Runs the file in a contained function scope with a fake `window`. */
  function parseDataJs(text) {
    const win = {};
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      "window",
      text + "\n; return (window && window.PORTFOLIO_DATA) ? window.PORTFOLIO_DATA : (typeof PORTFOLIO_DATA !== 'undefined' ? PORTFOLIO_DATA : null);"
    );
    return fn(win);
  }

  function handleUpload(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = parseDataJs(String(reader.result));
        if (!obj || typeof obj !== "object") throw new Error("no PORTFOLIO_DATA found");
        data = obj;
        ensureShape(data);
        savePortfolioData(data);
        build();
        setStatus("✓ All changes saved", "saved");
        toast("Loaded — content imported from your data.js file.");
      } catch (err) {
        toast("Couldn't read that file: " + ((err && err.message) || err), false);
      }
      e.target.value = "";   // allow re-picking the same file
    };
    reader.onerror = () => { toast("Couldn't read that file.", false); e.target.value = ""; };
    reader.readAsText(f);
  }

  function resetToFile() {
    if (!confirm("Discard changes saved in this browser and reload from js/data.js?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    data = JSON.parse(JSON.stringify(window.PORTFOLIO_DATA || {}));
    ensureShape(data);
    build();
    setStatus("✓ All changes saved", "saved");
    toast("Reloaded from js/data.js.");
  }

  document.addEventListener("DOMContentLoaded", () => {
    build();
    const form = $("#form");
    form.addEventListener("input", scheduleAutosave);
    form.addEventListener("change", scheduleAutosave);
    form.addEventListener("click", (e) => { if (e.target.closest("button")) scheduleAutosave(); });
    $("#btn-download").onclick = download;
    $("#btn-reset").onclick = resetToFile;
    const fileUpload = $("#file-upload");
    if (fileUpload) fileUpload.addEventListener("change", handleUpload);
  });
})();
