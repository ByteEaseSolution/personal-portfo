# Samir — Personal Portfolio

A warm, scrapbook-style one-page website about me, my family, my roots, and our
story. It reads top-to-bottom and prints to a clean PDF keepsake.

## How to open it

Just **double-click `index.html`** — it opens in your browser. No internet or
setup needed (an internet connection only makes the handwriting-style fonts and
the YouTube/Drive videos load).

## How to edit the content

1. Open **`admin.html`** in your browser.
2. Fill in / change any section using the forms.
3. Click **Save** — this updates the live preview (click **View site** to check).
4. When happy, click **⬇ Download data.js** and **replace the file at `js/data.js`**
   with the one you downloaded. That file is what travels when you share the folder.

> You can also edit `js/data.js` by hand if you prefer — it's clearly laid out.

## Photos

Two ways — you can mix both:

- **Local file (works offline):** put the image in the **`photos/`** folder
  (e.g. `photos/goa-beach.jpg`) and use the "Choose file…" button in the editor.
- **Google Drive link (nothing to copy around):** paste the file's share link in
  the photo field. The file must be shared **"Anyone with the link → Viewer"**.
  Drive photos load over the internet, so they need a connection to show —
  including when you Save as PDF (print while online to bake them in).

## Videos

Paste a **YouTube** or **Google Drive** share link in the admin editor.
For Google Drive, set the file's sharing to **"Anyone with the link"**.
Videos play on the website; in the PDF they appear as a labelled card with the
link (so it can be opened on a phone).

## Make the PDF

Open `index.html`, click **⬇ Download as PDF** (top-right), and in the print
dialog choose **"Save as PDF"**. Each section starts on a fresh page.

## Files

```
index.html      the website
admin.html      the editor
js/data.js      ← all your content lives here
js/util.js      helpers
js/render.js    builds the site
js/admin.js     the editor logic
css/style.css   look & feel
css/print.css   PDF styling
photos/         your images
```
