/* Shared helpers used by both the site and the admin editor. */

const STORAGE_KEY = "samir_portfolio_data_v2";

/* Load data: prefer anything saved in this browser (from the admin editor),
   otherwise fall back to the shipped js/data.js content. */
function loadPortfolioData() {
  // Deep clone so edits never mutate the shipped defaults.
  const fileData = JSON.parse(JSON.stringify(window.PORTFOLIO_DATA || {}));
  const fileRev = (fileData.meta && fileData.meta.rev) || 0;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const savedRev = (parsed.meta && parsed.meta.rev) || 0;
      // A newer published file wins over an older browser draft (keeps the
      // admin in sync); otherwise the local draft is kept.
      if (savedRev >= fileRev) return parsed;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fileData)); } catch (e) {}
    }
  } catch (e) { /* ignore and fall back */ }
  return fileData;
}

function savePortfolioData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

/* Basic HTML escaping for any user-entered text. */
function esc(s) {
  if (s === undefined || s === null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Turn a photo reference into something an <img> can actually load.
   Accepts:
     - a local path         -> "photos/goa.jpg"          (returned as-is)
     - a Google Drive link   -> any share/open/uc/file URL (converted)
     - an already-direct link -> http(s) image URL         (returned as-is)
   Google Drive's most reliable embeddable form is the thumbnail endpoint,
   which works for files shared "Anyone with the link". */
function resolvePhotoSrc(src, size) {
  if (!src) return "";
  src = String(src).trim();
  size = size || 1600;

  if (src.indexOf("drive.google.com") !== -1 || /^[A-Za-z0-9_-]{25,}$/.test(src)) {
    let m =
      src.match(/\/file\/d\/([A-Za-z0-9_-]+)/) ||
      src.match(/[?&]id=([A-Za-z0-9_-]+)/) ||
      src.match(/\/d\/([A-Za-z0-9_-]+)/) ||
      src.match(/^([A-Za-z0-9_-]{25,})$/);          // a bare file id
    if (m) return "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w" + size;
  }
  return src;   // local path or a normal direct image URL
}

/* Turn a YouTube / Google Drive share URL into the pieces we need. */
function parseVideo(url) {
  if (!url) return null;
  url = url.trim();

  // --- YouTube ---
  let m =
    url.match(/[?&]v=([A-Za-z0-9_-]{6,})/) ||          // watch?v=ID
    url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||     // youtu.be/ID
    url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (m) {
    const id = m[1];
    return {
      kind: "youtube",
      id,
      embed: "https://www.youtube.com/embed/" + id,
      thumb: "https://img.youtube.com/vi/" + id + "/hqdefault.jpg",
      watch: "https://www.youtube.com/watch?v=" + id
    };
  }

  // --- Google Drive ---
  m = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/) ||
      url.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (m) {
    const id = m[1];
    return {
      kind: "drive",
      id,
      embed: "https://drive.google.com/file/d/" + id + "/preview",
      thumb: "",                                         // Drive has no simple thumbnail
      watch: "https://drive.google.com/file/d/" + id + "/view"
    };
  }

  // --- Unknown: still allow it as a plain link ---
  return { kind: "link", id: "", embed: "", thumb: "", watch: url };
}
