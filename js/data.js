/* ============================================================================
   PORTFOLIO CONTENT
   ----------------------------------------------------------------------------
   This is the single file that holds ALL the words, photos and videos for the
   site. You can edit it two ways:

     1. The easy way  -> open admin.html in your browser, change things with
        forms, click "Save", then click "Download data.js" and replace this
        file with the downloaded one.

     2. By hand       -> carefully edit the text between the quotes below.

   Photos: either put image files inside the "photos/" folder and reference them
   like  "photos/goa-beach.jpg"  (works offline), OR paste a Google Drive share
   link (the file must be shared "Anyone with the link"). You can mix both.

   Everything marked  SAMPLE  is placeholder text for you to replace.
   ========================================================================== */

window.PORTFOLIO_DATA = {

  /* ---- Cover / hero ---- */
  meta: {
    name: "Samir",
    tagline: "A little window into my world — my family, my roots, and the girl who changed everything.",
    coverPhoto: "",          // e.g. "photos/cover.jpg"  (leave "" for a plain cover)
    accentWord: "us"
  },

  /* ---- About Me ---- */
  about: {
    heading: "About Me",
    photo: "",               // e.g. "photos/me.jpg"
    facts: [
      { label: "Full name",   value: "SAMPLE — Samir Tak" },
      { label: "Born",        value: "SAMPLE — 1st January 1996" },
      { label: "Birthplace",  value: "SAMPLE — Indore, Madhya Pradesh" },
      { label: "Lives in",    value: "SAMPLE — Indore, India" },
      { label: "Work",        value: "SAMPLE — Software / Data Engineer" },
      { label: "Education",   value: "SAMPLE — B.Tech in Computer Science" },
      { label: "Languages",   value: "SAMPLE — Hindi, English, Marwari" }
    ],
    bio: [
      "SAMPLE — Write a warm, honest paragraph introducing yourself. Who you are, what you do, and what matters to you.",
      "SAMPLE — A second paragraph about your personality, your hobbies, and the kind of life you want to build."
    ],
    interests: ["SAMPLE — Travel", "Cooking", "Cricket", "Music", "Photography"]
  },

  /* ---- My Family ---- */
  family: {
    heading: "My Family",
    photo: "",               // e.g. "photos/family.jpg"
    intro: "SAMPLE — A short, loving introduction to your family and what they mean to you.",
    members: [
      { name: "SAMPLE — Father's name",  relation: "Father",  note: "SAMPLE — a line about him" },
      { name: "SAMPLE — Mother's name",  relation: "Mother",  note: "SAMPLE — a line about her" },
      { name: "SAMPLE — Sibling's name", relation: "Brother", note: "SAMPLE — a line about them" }
    ],
    values: [
      "SAMPLE — Respect for elders and staying close as a family.",
      "SAMPLE — Hard work, honesty, and looking after one another."
    ]
  },

  /* ---- Culture & Roots (religion, caste, community, birth, traditions) ---- */
  culture: {
    heading: "Culture & Roots",
    intro: "SAMPLE — A short paragraph about your background and where you come from.",
    facts: [
      { label: "Religion",      value: "SAMPLE — Hindu" },
      { label: "Community / Caste", value: "SAMPLE — Fill in" },
      { label: "Mother tongue", value: "SAMPLE — Marwari / Hindi" },
      { label: "Native place",  value: "SAMPLE — Rajasthan roots" }
    ],
    traditions: [
      "SAMPLE — A tradition or value your family holds dear.",
      "SAMPLE — Another custom or celebration that's important to you."
    ],
    festivals: ["SAMPLE — Diwali", "Holi", "Raksha Bandhan"],
    note: "SAMPLE — Optionally, a note on how you see faith and culture in your own life today."
  },

  /* ---- How We Met / Our Story ---- */
  story: {
    heading: "How We Met",
    herName: "SAMPLE — Her name",
    intro: "SAMPLE — Set the scene. A warm opening line about her and about the two of you.",
    timeline: [
      { date: "SAMPLE — Month Year", title: "The day we met", text: "SAMPLE — Where you met, how it happened, your first impression.", photo: "" },
      { date: "SAMPLE — Month Year", title: "Getting to know each other", text: "SAMPLE — How things grew from there.", photo: "" },
      { date: "SAMPLE — Month Year", title: "Falling for her", text: "SAMPLE — The moment you knew.", photo: "" }
    ]
  },

  /* ---- Scrapbook photo gallery ---- */
  gallery: {
    heading: "Our Adventures",
    intro: "SAMPLE — A line introducing the places you've been together.",
    photos: [
      // Add entries like the one below. Put the file in the photos/ folder.
      // { src: "photos/goa.jpg", caption: "Sunset at the beach", place: "Goa", date: "Dec 2024" }
    ]
  },

  /* ---- Videos of places (YouTube / Google Drive links) ---- */
  videos: {
    heading: "Places We Love",
    intro: "SAMPLE — A line introducing the videos below.",
    items: [
      // { url: "https://youtu.be/XXXXXXXXXXX", title: "Our trip", description: "A few words about it", place: "Place name" }
    ]
  },

  /* ---- Closing note ---- */
  closing: {
    heading: "Thank you for reading",
    text: [
      "SAMPLE — A heartfelt closing paragraph. Thank her mother for her time and share, briefly and sincerely, what your intentions are.",
      "SAMPLE — A second short paragraph if you'd like."
    ],
    signoff: "With warmth,\nSamir"
  }
};
