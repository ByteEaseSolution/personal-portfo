/* ===========================================================================
   Simple in-browser editor.
   Edits a working copy of the portfolio data, saves it to the browser for
   instant preview on index.html, and lets you download an updated data.js
   to keep with the site (so it travels when you share the folder).
   =========================================================================== */

(function () {
  // Working copy (never mutate the shipped defaults directly).
  let data = loadPortfolioData();

  const $ = (sel, el = document) => el.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };

  /* ---- path helpers: "gallery.photos.0.caption" ---- */
  function getByPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  }
  function setByPath(obj, path, val) {
    const keys = path.split(".");
    const last = keys.pop();
    let o = obj;
    for (const k of keys) { if (o[k] == null) o[k] = {}; o = o[k]; }
    o[last] = val;
  }

  /* ---- field builders ---- */
  function textField(path, label, opts = {}) {
    const wrap = el("label", "fld");
    wrap.appendChild(el("span", "fld-label", label));
    const input = opts.area ? el("textarea") : el("input");
    if (!opts.area) input.type = "text";
    if (opts.rows) input.rows = opts.rows;
    if (opts.placeholder) input.placeholder = opts.placeholder;
    input.value = getByPath(data, path) ?? "";
    input.addEventListener("input", () => setByPath(data, path, input.value));
    wrap.appendChild(input);
    return wrap;
  }

  /* A simple editor for an array of plain strings (interests, values, etc.) */
  function stringListEditor(arrPath, label, placeholder) {
    const box = el("div", "sublist");
    box.appendChild(el("h4", "sublist-head", label));
    const list = el("div", "sublist-items");
    box.appendChild(list);

    function render() {
      list.innerHTML = "";
      const arr = getByPath(data, arrPath) || [];
      arr.forEach((val, i) => {
        const row = el("div", "row");
        const input = el("input");
        input.type = "text";
        input.value = val ?? "";
        input.placeholder = placeholder || "";
        input.addEventListener("input", () => { arr[i] = input.value; });
        const del = el("button", "mini danger", "✕");
        del.type = "button";
        del.onclick = () => { arr.splice(i, 1); render(); };
        row.append(input, del);
        list.appendChild(row);
      });
      const add = el("button", "mini add", "+ Add");
      add.type = "button";
      add.onclick = () => {
        if (!getByPath(data, arrPath)) setByPath(data, arrPath, []);
        getByPath(data, arrPath).push("");
        render();
      };
      list.appendChild(add);
    }
    render();
    return box;
  }

  /* An editor for an array of objects. `fields` describe each object's inputs. */
  function objectListEditor(arrPath, label, fields, makeEmpty, hint) {
    const box = el("div", "sublist");
    box.appendChild(el("h4", "sublist-head", label));
    if (hint) box.appendChild(el("p", "hint", hint));
    const list = el("div");
    box.appendChild(list);

    function render() {
      list.innerHTML = "";
      const arr = getByPath(data, arrPath) || [];
      arr.forEach((item, i) => {
        const card = el("div", "item-card");
        const head = el("div", "item-card-head");
        head.appendChild(el("span", "item-num", "#" + (i + 1)));
        const ctrls = el("div", "item-ctrls");
        const up = el("button", "mini", "↑"); up.type = "button";
        up.onclick = () => { if (i > 0) { [arr[i-1], arr[i]] = [arr[i], arr[i-1]]; render(); } };
        const down = el("button", "mini", "↓"); down.type = "button";
        down.onclick = () => { if (i < arr.length-1) { [arr[i+1], arr[i]] = [arr[i], arr[i+1]]; render(); } };
        const del = el("button", "mini danger", "✕ Remove"); del.type = "button";
        del.onclick = () => { arr.splice(i, 1); render(); };
        ctrls.append(up, down, del);
        head.appendChild(ctrls);
        card.appendChild(head);

        fields.forEach(f => {
          if (f.type === "photo") {
            card.appendChild(photoField(item, f.key, f.label));
          } else {
            const wrap = el("label", "fld");
            wrap.appendChild(el("span", "fld-label", f.label));
            const input = f.area ? el("textarea") : el("input");
            if (!f.area) input.type = "text";
            if (f.area) input.rows = 3;
            if (f.placeholder) input.placeholder = f.placeholder;
            input.value = item[f.key] ?? "";
            input.addEventListener("input", () => { item[f.key] = input.value; });
            wrap.appendChild(input);
            card.appendChild(wrap);
          }
        });
        list.appendChild(card);
      });
      const add = el("button", "mini add", "+ Add " + (label.replace(/s$/, "") || "item"));
      add.type = "button";
      add.onclick = () => {
        if (!getByPath(data, arrPath)) setByPath(data, arrPath, []);
        getByPath(data, arrPath).push(makeEmpty());
        render();
      };
      list.appendChild(add);
    }
    render();
    return box;
  }

  /* Photo field: pick a file -> fills "photos/<name>" and shows a live preview.
     The actual image file must be placed in the photos/ folder. */
  function photoField(obj, key, label) {
    const wrap = el("div", "fld");
    wrap.appendChild(el("span", "fld-label", label || "Photo"));

    const row = el("div", "photo-row");
    const input = el("input");
    input.type = "text";
    input.placeholder = "photos/your-file.jpg  — or paste a Google Drive link";
    input.value = obj[key] ?? "";
    input.addEventListener("input", () => { obj[key] = input.value; updatePreview(); });

    const pick = el("label", "mini pick", "Choose file…");
    const file = el("input");
    file.type = "file";
    file.accept = "image/*";
    file.style.display = "none";
    file.addEventListener("change", () => {
      const f = file.files[0];
      if (!f) return;
      obj[key] = "photos/" + f.name;
      input.value = obj[key];
      const reader = new FileReader();
      reader.onload = () => { preview.src = reader.result; preview.style.display = "block"; };
      reader.readAsDataURL(f);
    });
    pick.appendChild(file);

    row.append(input, pick);
    wrap.appendChild(row);

    const preview = el("img", "photo-preview");
    preview.style.display = "none";
    wrap.appendChild(preview);
    wrap.appendChild(el("p", "hint", "Use a local file in the <b>photos/</b> folder, <b>or</b> paste a Google&nbsp;Drive link (set it to “Anyone with the link”)."));

    function updatePreview() {
      if (obj[key]) { preview.src = resolvePhotoSrc(obj[key]); preview.style.display = "block"; preview.onerror = () => { preview.style.display = "none"; }; }
    }
    updatePreview();
    return wrap;
  }

  /* ---- build the whole form ---- */
  function build() {
    const f = $("#form");
    f.innerHTML = "";

    // helper to add a collapsible section
    function sec(title, builder) {
      const details = el("details", "sec");
      details.open = true;
      const sum = el("summary", null, title);
      details.appendChild(sum);
      const body = el("div", "sec-body");
      builder(body);
      details.appendChild(body);
      f.appendChild(details);
    }

    sec("Cover", (b) => {
      b.append(
        textField("meta.name", "Your name (big on cover)"),
        textField("meta.tagline", "Tagline / one-line intro", { area: true, rows: 2 }),
        photoField(data.meta, "coverPhoto", "Cover background photo (optional)")
      );
    });

    sec("About Me", (b) => {
      b.append(
        textField("about.heading", "Section title"),
        photoField(data.about, "photo", "Your photo")
      );
      b.appendChild(stringListEditor("about.bio", "Intro paragraphs", "Write a paragraph…"));
      b.appendChild(objectListEditor("about.facts", "Quick facts",
        [{ key: "label", label: "Label", placeholder: "e.g. Born" },
         { key: "value", label: "Value", placeholder: "e.g. Indore, 1996" }],
        () => ({ label: "", value: "" })));
      b.appendChild(stringListEditor("about.interests", "Things I love", "e.g. Travel"));
    });

    sec("My Family", (b) => {
      b.append(
        textField("family.heading", "Section title"),
        textField("family.intro", "Intro", { area: true, rows: 3 }),
        photoField(data.family, "photo", "Family photo")
      );
      b.appendChild(objectListEditor("family.members", "Family members",
        [{ key: "relation", label: "Relation", placeholder: "Father / Mother / Brother" },
         { key: "name", label: "Name" },
         { key: "note", label: "A line about them", area: true }],
        () => ({ relation: "", name: "", note: "" })));
      b.appendChild(stringListEditor("family.values", "What we hold close", "A family value…"));
    });

    sec("Culture & Roots", (b) => {
      b.append(
        textField("culture.heading", "Section title"),
        textField("culture.intro", "Intro", { area: true, rows: 3 })
      );
      b.appendChild(objectListEditor("culture.facts", "Facts (religion, community, etc.)",
        [{ key: "label", label: "Label", placeholder: "e.g. Religion" },
         { key: "value", label: "Value" }],
        () => ({ label: "", value: "" })));
      b.appendChild(stringListEditor("culture.traditions", "Traditions we cherish", "A tradition…"));
      b.appendChild(stringListEditor("culture.festivals", "Festivals we celebrate", "e.g. Diwali"));
      b.appendChild(textField("culture.note", "Closing note (optional)", { area: true, rows: 2 }));
    });

    sec("How We Met", (b) => {
      b.append(
        textField("story.heading", "Section title"),
        textField("story.herName", "Her name"),
        textField("story.intro", "Opening line", { area: true, rows: 3 })
      );
      b.appendChild(objectListEditor("story.timeline", "Moments (timeline)",
        [{ key: "date", label: "When", placeholder: "e.g. March 2024" },
         { key: "title", label: "Title", placeholder: "e.g. The day we met" },
         { key: "text", label: "Story", area: true },
         { key: "photo", label: "Photo", type: "photo" }],
        () => ({ date: "", title: "", text: "", photo: "" })));
    });

    sec("Our Adventures (photo scrapbook)", (b) => {
      b.append(
        textField("gallery.heading", "Section title"),
        textField("gallery.intro", "Intro", { area: true, rows: 2 })
      );
      b.appendChild(objectListEditor("gallery.photos", "Photos",
        [{ key: "src", label: "Photo", type: "photo" },
         { key: "caption", label: "Caption" },
         { key: "place", label: "Place", placeholder: "e.g. Goa" },
         { key: "date", label: "Date", placeholder: "e.g. Dec 2024" }],
        () => ({ src: "", caption: "", place: "", date: "" }),
        "Put the image files in the photos/ folder, then add an entry for each."));
    });

    sec("Places We Love (videos)", (b) => {
      b.append(
        textField("videos.heading", "Section title"),
        textField("videos.intro", "Intro", { area: true, rows: 2 })
      );
      b.appendChild(objectListEditor("videos.items", "Videos",
        [{ key: "url", label: "YouTube or Google Drive link", placeholder: "https://youtu.be/…" },
         { key: "title", label: "Title" },
         { key: "place", label: "Place" },
         { key: "description", label: "Description", area: true }],
        () => ({ url: "", title: "", place: "", description: "" }),
        "Paste a YouTube or Google Drive share link. Make sure Drive links are set to 'Anyone with the link'."));
    });

    sec("Closing note", (b) => {
      b.append(textField("closing.heading", "Heading"));
      b.appendChild(stringListEditor("closing.text", "Closing paragraphs", "Write a paragraph…"));
      b.append(textField("closing.signoff", "Sign-off (use Enter for new lines)", { area: true, rows: 2 }));
    });
  }

  /* ---- actions ---- */
  function toast(msg, ok = true) {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast show " + (ok ? "ok" : "err");
    setTimeout(() => { t.className = "toast"; }, 3200);
  }

  function setStatus(text, cls) {
    const s = $("#status");
    if (!s) return;
    s.textContent = text;
    s.className = "status " + (cls || "");
  }

  function save() {
    const ok = savePortfolioData(data);
    toast(ok ? "Saved. Open the site to preview — then Download data.js to keep it."
             : "Could not save (browser storage full). Use Download data.js instead.", ok);
  }

  /* Auto-save: write to the browser's local preview a moment after any change. */
  let saveTimer = null;
  function scheduleAutosave() {
    setStatus("Saving…", "saving");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const ok = savePortfolioData(data);
      setStatus(ok ? "✓ All changes saved" : "⚠ Storage full — use Download data.js",
                ok ? "saved" : "err");
    }, 500);
  }

  function buildDataJsText() {
    const json = JSON.stringify(data, null, 2);
    return "/* Portfolio content. Generated by admin.html. */\n" +
           "window.PORTFOLIO_DATA = " + json + ";\n";
  }

  function download() {
    save(); // keep preview in sync
    const blob = new Blob([buildDataJsText()], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = el("a");
    a.href = url;
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Downloaded data.js — replace the file in your js/ folder.");
  }

  function resetToFile() {
    if (!confirm("Discard changes saved in this browser and reload the content from js/data.js?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    data = JSON.parse(JSON.stringify(window.PORTFOLIO_DATA || {}));
    build();
    toast("Reloaded from js/data.js.");
  }

  /* ---- wire up ---- */
  document.addEventListener("DOMContentLoaded", () => {
    build();

    // Auto-save on every change: typing (input), file selection (change),
    // and structural edits like add/remove/reorder (click).
    const form = $("#form");
    form.addEventListener("input", scheduleAutosave);
    form.addEventListener("change", scheduleAutosave);
    form.addEventListener("click", (e) => {
      if (e.target.closest("button")) scheduleAutosave();
    });

    if ($("#btn-save")) $("#btn-save").onclick = save;
    $("#btn-download").onclick = download;
    $("#btn-reset").onclick = () => { resetToFile(); setStatus("✓ All changes saved", "saved"); };
  });
})();
