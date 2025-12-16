# Devil Barewar – Writing & Storytelling Portfolio

A handcrafted, fully responsive portfolio website for **Devil Barewar (Naman Barewar)** – poet, storyteller, screenwriter and author.  
The site brings together poems, diaries, stories, books, podcasts, short films and screenplays in one cohesive reading and viewing experience.

Live site: https://namo369.github.io/devil-barewar-site  
Repository: https://github.com/namo369/devil-barewar-site

---

## Overview

This project is a static website built from scratch using **HTML, CSS and vanilla JavaScript**, deployed via **GitHub Pages**.  
The focus is on clean typography, long‑form readability, and a calm, “literary” aesthetic that works equally well on desktop and mobile.

Key capabilities:

- Multi‑page navigation with a shared header, footer and search.
- Dedicated sections for poems, diaries, stories, books, podcasts, short films and screenplays.
- Individual detail pages for each poem and screenplay, with custom layouts and artwork.
- Optimised mobile reading experience across all long‑form content.

---

## Features

### Content & Navigation

- **Home (`index.html`)** – Hero sections, featured works and quick access to major categories.
- **About (`about.html`)** – Author profile and journey under the pen name *Devil Barewar*.
- **Books (`books.html`)** – Published books with cover art and metadata.
- **Poems (`poems.html` + `poems/`)**  
  - Grid of poems filtered by language.  
  - Individual poem pages with rich backgrounds and scrollable poem panels.
- **Diaries (`diaries.html` + `dairies/`)** – Reflections, quotes and diary‑style entries.
- **Stories (`story.html` + `story/`)** – Short stories with their own layouts and imagery.
- **Writing Journey (`writing.html` + `writing/`)** – Narrative pages about the journey to co‑authoring 50+ anthologies.
- **Screenplays (`screenplay.html` + `screenplay/`)**  
  - Card view of scripts.  
  - Full screenplay pages styled like screenplay paper, with improved mobile formatting.
- **Short Films (`shortfilms.html`)** – Short film gallery with thumbnails and embedded videos.
- **Podcast (`podcast.html`)** – Section reserved for audio episodes and show notes.
- **Contact & Privacy (`contact.html`, `privacy_policy.html`)** – Contact details and policies.

### UI & UX

- **Custom design system** in `assets/css/styles.css` using CSS variables (colors, typography, spacings).
- **Responsive layout** with mobile‑first media queries for:
  - Header, navigation and search bar.
  - Cards and grids (poems, stories, diaries, films).
  - Reading pages (poems, diaries, journeys, screenplays).
- **Search routing (`search.html`)**  
  Lightweight JS router that maps user keywords to specific pages and anchors (e.g., a particular poem or story card).
- **Back‑to‑top and sticky header** for smoother navigation on long pages.
- **Newsletter footer (`footer.html`)** with MailerLite form integration for email subscriptions.

---

## Tech Stack

- **Languages:** HTML5, CSS3, JavaScript (ES6)
- **Styling:** Custom CSS, CSS variables, media queries, no CSS frameworks
- **Assets:** Local images, posters, thumbnails and icons
- **Version Control:** Git, GitHub
- **Hosting:** GitHub Pages

---

## Project Structure

High‑level layout of the repository:

- `index.html` – Landing page
- `about.html` – About the author
- `books.html` – Books listing
- `poems.html` / `poems/` – Poems overview and individual poem pages
- `diaries.html` / `dairies/` – Diary/quote content
- `story.html` / `story/` – Story listing and details
- `screenplay.html` / `screenplay/` – Screenplay listing and full scripts
- `shortfilms.html` – Short films gallery
- `podcast.html` – Podcast section
- `writing.html` / `writing/` – Writing journey and related pieces
- `contact.html` – Contact page
- `privacy_policy.html` – Privacy policy
- `search.html` – Keyword‑based search router
- `footer.html` – Shared footer markup
- `admin/` – Admin/utility pages (if any internal tools are added)
- `content/` – JSON or helper content files (when used)
- `assets/css/styles.css` – Global stylesheet
- `LICENSE` – Project license
- `README.md` – This file

---

## Running Locally

No build tools are required; the site is purely static.

