/* ============================================================================
   PORTFOLIO CONTENT
   ----------------------------------------------------------------------------
   Everything on the site lives here. Easiest way to edit: open admin.html,
   change things with forms (it auto-saves), then click "Download data.js" and
   replace this file.

   The site is a list of "chapters". Each chapter can have:
     - title      : the section heading
     - intro      : one warm line under the heading
     - paragraphs : longer text (for story/about sections)
     - facts      : little label/value pairs (e.g. Born, Lives in)
     - interests  : small tags/chips
     - photos     : a gallery; each photo has caption + story (backstory) + place + date

   Photos: put image files in the photos/ folder (e.g. "photos/goa.jpg"),
   OR paste a Google Drive share link (set to "Anyone with the link").

   Add, remove or reorder chapters freely in admin.html.
   ========================================================================== */

window.PORTFOLIO_DATA = {

  meta: {
    name: "Samir",
    tagline: "A little window into my world — my family, my roots, and Prarthna, the girl who changed everything.",
    coverPhoto: ""            // optional: "photos/cover.jpg"
  },

  chapters: [

    /* 1 — About Me */
    {
      title: "About Me",
      intro: "A little about who I am.",
      paragraphs: [
        "Write a warm, honest paragraph introducing yourself — who you are, what you do, and what matters to you.",
        "A second paragraph about your personality, your values, and the kind of life you want to build."
      ],
      facts: [
        { label: "Full name",  value: "Samir Tak" },
        { label: "Born",       value: "1st January 1996" },
        { label: "Lives in",   value: "Indore, Madhya Pradesh" },
        { label: "Work",       value: "Software / Data Engineer" },
        { label: "Education",  value: "B.Tech, Computer Science" },
        { label: "Languages",  value: "Hindi, English, Marwari" }
      ],
      interests: ["Travel", "Cooking", "Cricket", "Music", "Photography"],
      photos: [
        // some random photos of you — add via admin
        // { src: "photos/me1.jpg", caption: "", story: "", place: "", date: "" }
      ]
    },

    /* 2 — My Family */
    {
      title: "My Family",
      intro: "The people who made me who I am.",
      paragraphs: [
        "Introduce your family — your parents, siblings, and what they mean to you.",
        "A line about the values you were raised with and the home you grew up in."
      ],
      facts: [],
      interests: [],
      photos: []
    },

    /* 3 — Culture & Roots  (kept from the original brief; delete if not needed) */
    {
      title: "Culture & Roots",
      intro: "Where I come from.",
      paragraphs: [
        "A short note on your background, community and the traditions your family holds close."
      ],
      facts: [
        { label: "Religion",      value: "Hindu" },
        { label: "Community",     value: "" },
        { label: "Mother tongue", value: "Marwari / Hindi" },
        { label: "Native place",  value: "Rajasthan" }
      ],
      interests: [],
      photos: []
    },

    /* 4 — My Childhood */
    {
      title: "My Childhood",
      intro: "A few glimpses from growing up — each with its own little story.",
      paragraphs: [],
      facts: [],
      interests: [],
      photos: [
        // { src: "photos/child1.jpg", caption: "Short caption", story: "The backstory behind this photo.", place: "", date: "" }
      ]
    },

    /* 5 — Childhood, with my family */
    {
      title: "Me & My Family, Back Then",
      intro: "Old family photos — the ones that still make me smile.",
      paragraphs: [],
      facts: [],
      interests: [],
      photos: []
    },

    /* 6 — Meeting Prarthna */
    {
      title: "How I Met Prarthna",
      intro: "Where it all began.",
      paragraphs: [
        "Tell the story of how and where you first met Prarthna — the moment, your first impression, and how it grew.",
        "A little about what makes her special and why you knew."
      ],
      facts: [],
      interests: [],
      photos: []
    },

    /* 7 — Our first dates */
    {
      title: "Our First Dates",
      intro: "The early days — all kinds of firsts.",
      paragraphs: [],
      facts: [],
      interests: [],
      photos: []
    },

    /* 8 — Special places */
    {
      title: "Special Places We've Been",
      intro: "The places that are now a part of our story.",
      paragraphs: [],
      facts: [],
      interests: [],
      photos: []
    },

    /* 9 — From my kitchen */
    {
      title: "From My Kitchen",
      intro: "Meals I've cooked for us — and the stories behind them.",
      paragraphs: [],
      facts: [],
      interests: [],
      photos: [
        // { src: "photos/meal1.jpg", caption: "Dish name", story: "Why I made it / how it went.", place: "", date: "" }
      ]
    },

    /* 10 — Twinning */
    {
      title: "Twinning",
      intro: "When we accidentally (or not) matched.",
      paragraphs: [],
      facts: [],
      interests: [],
      photos: []
    },

    /* 11 — Playdates */
    {
      title: "Playdates",
      intro: "Our fun, silly, favourite days out.",
      paragraphs: [],
      facts: [],
      interests: [],
      photos: []
    },

    /* 12 — Prarthna with my family */
    {
      title: "Prarthna & My Family",
      intro: "The moments that mean the most.",
      paragraphs: [],
      facts: [],
      interests: [],
      photos: []
    }

  ],

  closing: {
    heading: "Thank you for reading",
    text: [
      "Thank you for taking the time to get to know me, my family and our story. I've shared this with an open and sincere heart.",
      "My hope is to build a loving, respectful future with Prarthna — and I would be grateful for your blessings."
    ],
    signoff: "With warmth,\nSamir"
  }
};
