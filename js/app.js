/* Engineering Brain Bank — Shared Application Logic (v2 visual twin) */
(function () {
  "use strict";

  const CREST_SVG = `
<svg class="brand-crest" viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD54F"/>
      <stop offset="55%" stop-color="#FFB800"/>
      <stop offset="100%" stop-color="#E09A00"/>
    </linearGradient>
    <linearGradient id="crestRed" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E53935"/>
      <stop offset="100%" stop-color="#8B1A1A"/>
    </linearGradient>
  </defs>
  <path d="M32 2 L58 14 L58 38 C58 54 45 66 32 70 C19 66 6 54 6 38 L6 14 Z"
        fill="url(#crestGold)" stroke="#FFB800" stroke-width="1.2"/>
  <path d="M32 8 L52 17 L52 37 C52 50 42 60 32 63.5 C22 60 12 50 12 37 L12 17 Z"
        fill="#0A0A0C"/>
  <path d="M32 14 L46 21 L46 36 C46 45 39 52 32 55 C25 52 18 45 18 36 L18 21 Z"
        fill="url(#crestRed)" opacity="0.95"/>
  <path d="M26 30 L32 24 L38 30 L32 36 Z" fill="#FFD54F"/>
  <circle cx="32" cy="42" r="3.2" fill="#FFD54F"/>
</svg>`;

  const SWOOSH_SVG = `
<svg class="swoosh" viewBox="0 0 520 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="#FFB800" d="M8 34 C40 22,78 16,120 18 C170 20,210 28,260 30 C320 32,370 22,420 18 C450 16,480 20,508 28 L512 34 C490 42,460 48,430 46 C380 44,340 52,290 50 C240 48,190 40,140 36 C100 34,60 36,28 44 C18 46,10 42,8 34 Z"/>
  <path fill="#FFB800" opacity="0.92" d="M90 16 C100 10,112 12,118 18 C108 20,98 20,90 16 Z M200 22 C212 14,228 16,234 24 C220 26,208 26,200 22 Z M340 16 C352 8,370 10,378 18 C362 22,348 22,340 16 Z M450 14 C462 8,478 12,484 20 C470 22,456 20,450 14 Z"/>
  <path fill="#FFB800" opacity="0.88" d="M60 40 C70 48,82 50,90 44 C78 42,68 40,60 40 Z M180 44 C192 52,208 54,216 46 C200 44,188 42,180 44 Z M300 48 C314 56,330 54,338 46 C322 46,308 46,300 48 Z M410 44 C424 52,442 50,450 42 C434 42,418 42,410 44 Z M480 36 C492 44,504 42,510 34 C498 34,486 34,480 36 Z"/>
  <path fill="#FFB800" d="M500 22 L518 18 L514 32 L500 30 Z"/>
</svg>`;

  const ICONS = {
    // checklist / clipboard with ticks
    slides: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3.5h6v2.5H9z"/><path d="M8.5 11l1.5 1.5 3-3"/><path d="M8.5 16l1.5 1.5 3-3"/></svg>`,
    // circular seal / medallion
    notes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 8.5v3l2 1.5"/><path d="M12 3.2v1.6M12 19.2v1.6M3.2 12h1.6M19.2 12h1.6"/></svg>`,
    // people / two silhouettes
    "past-questions": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><circle cx="16.5" cy="9.5" r="2.6"/><path d="M3.5 19.5c.7-2.8 3-4.5 5.5-4.5s4.8 1.7 5.5 4.5"/><path d="M13.8 15.2c.9-1.5 2.4-2.4 4.2-2.4 1.5 0 2.8.5 3.7 1.5"/></svg>`,
    // structural H-beam / bridge
    shared: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 18h16"/><path d="M6 6v12M18 6v12"/><path d="M6 12h12"/><path d="M9 9v6M15 9v6"/><path d="M3 20c2-3 5-4.5 9-4.5S19 17 21 20" opacity="0.85"/></svg>`,
    search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`,
  };

  /** Root-absolute hrefs so chrome still works when URL is /s/course/slug */
  function siteHref(path) {
    const p = String(path || "").replace(/^\.\//, "");
    return "/" + p;
  }

  function injectChrome() {
    const headerEl = document.getElementById("site-header");
    const footerEl = document.getElementById("site-footer");
    const page = document.body.dataset.page || "";

    if (headerEl) {
      headerEl.innerHTML = `
        <div class="container header-inner">
          <a class="brand" href="${siteHref("index.html")}" aria-label="KB4GESA Engineering Brain Bank home">
            ${CREST_SVG}
            <span class="brand-text">
              <span class="brand-code">KB4GESA</span>
              <span class="brand-divider" aria-hidden="true"></span>
              <span class="brand-name">Engineering<br>Brain Bank</span>
            </span>
          </a>
          <div class="header-right">
            <nav class="nav" id="main-nav" aria-label="Primary">
              <a href="${siteHref("index.html")}" ${page === "home" ? 'class="active"' : ""}>Home</a>
              <a href="${siteHref("courses.html")}" ${page === "courses" || page === "course" ? 'class="active"' : ""}>Courses</a>
              <a href="${siteHref("resources.html")}" ${page === "resources" ? 'class="active"' : ""}>Resources</a>
              <a href="${siteHref("upload.html")}" ${page === "upload" ? 'class="active"' : ""}>Upload</a>
              <a href="${siteHref("about.html")}" ${page === "about" ? 'class="active"' : ""}>About</a>
            </nav>
            <div class="header-actions">
              <a class="icon-btn" href="${siteHref("resources.html")}" aria-label="Search resources" title="Search">${ICONS.search}</a>
              <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
              </button>
            </div>
          </div>
        </div>`;
    }

    if (footerEl) {
      footerEl.innerHTML = `
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              ${CREST_SVG}
              <div>
                <strong>KB4GESA · Engineering Brain Bank</strong>
                <p>One centralized place for engineering students to find, access, and share slides, notes, and past questions under KB4GESA / Korle Boye.</p>
              </div>
            </div>
            <div class="footer-col">
              <h4>Explore</h4>
              <a href="${siteHref("index.html")}">Home</a>
              <a href="${siteHref("courses.html")}">Courses</a>
              <a href="${siteHref("resources.html")}">Resources</a>
              <a href="${siteHref("upload.html")}">Upload</a>
              <a href="${siteHref("about.html")}">About</a>
            </div>
            <div class="footer-col">
              <h4>Departments</h4>
              <a href="${siteHref("courses.html?dept=civil")}">Civil</a>
              <a href="${siteHref("courses.html?dept=electrical")}">Electrical</a>
              <a href="${siteHref("courses.html?dept=mechanical")}">Mechanical</a>
              <a href="${siteHref("courses.html?dept=computer")}">Computer</a>
              <a href="${siteHref("courses.html?dept=chemical")}">Chemical</a>
              <a href="${siteHref("courses.html?dept=industrial")}">Industrial</a>
            </div>
            <div class="footer-col">
              <h4>Help</h4>
              <a href="${siteHref("about.html#faqs")}">FAQs</a>
              <a href="${siteHref("about.html#contact")}">Contact</a>
              <a href="${siteHref("about.html#terms")}">Terms of Service</a>
              <a href="${siteHref("about.html#privacy")}">Privacy Policy</a>
              <a href="${siteHref("admin.html")}" class="footer-admin-link" title="Owner">Admin</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} KB4GESA · Korle Boye</span>
            <span class="closing">From Korle Boye, For Korle Boye.</span>
          </div>
        </div>`;
    }

    const toggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }
  function params() { return new URLSearchParams(window.location.search); }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch { return iso; }
  }

  function typeBadge(type) {
    const meta = EBB.getTypeMeta(type);
    return `<span class="badge badge-${type}">${meta ? meta.name : type}</span>`;
  }

  function showToast(message) {
    let toast = qs("#toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.innerHTML = `<span class="toast-icon" aria-hidden="true">✓</span><span class="toast-msg"></span>`;
      document.body.appendChild(toast);
    }
    toast.querySelector(".toast-msg").textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 3800);
  }


  /* ---------- Live materials (Supabase) ---------- */
  let _liveCache = null;
  let _liveTried = false;

  async function fetchLiveMaterials() {
    if (_liveTried) return _liveCache || [];
    _liveTried = true;
    if (!window.EBBApi || !EBBApi.isConfigured()) {
      _liveCache = [];
      return _liveCache;
    }
    try {
      const rows = await EBBApi.listPublishedMaterials();
      _liveCache = (rows || []).map((r) => EBBApi.toUiMaterial(r));
    } catch (err) {
      console.warn("[EBB] live materials:", err.message || err);
      _liveCache = [];
    }
    return _liveCache;
  }

  function formatBytesLabel(sizeStr) {
    return sizeStr || "";
  }

  function resolveMaterialUrl(m) {
    if (!m || !window.EBBApi) return "";
    return EBBApi.getFileUrl(m) || EBBApi.getPublicFileUrl(m.file_path || "");
  }

  function resolveDownloadUrl(m) {
    if (!m || !window.EBBApi) return "";
    return EBBApi.getDownloadUrl(m) || resolveMaterialUrl(m);
  }

  function ensureMediaModal() {
    let modal = qs("#media-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "media-modal";
    modal.className = "media-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="media-modal__backdrop" data-close="1"></div>
      <div class="media-modal__panel" role="dialog" aria-modal="true" aria-labelledby="media-modal-title">
        <div class="media-modal__head">
          <h2 id="media-modal-title" class="media-modal__title"></h2>
          <button type="button" class="icon-btn media-modal__close" data-close="1" aria-label="Close">✕</button>
        </div>
        <div class="media-modal__body"></div>
        <div class="media-modal__actions">
          <a class="btn btn-primary" id="media-modal-download" href="#" download target="_blank" rel="noopener">Download</a>
          <button type="button" class="btn btn-ghost" data-close="1">Close</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeMediaModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeMediaModal();
    });
    return modal;
  }

  function closeMediaModal() {
    const modal = qs("#media-modal");
    if (!modal) return;
    const body = modal.querySelector(".media-modal__body");
    if (modal._blobUrl) {
      try { URL.revokeObjectURL(modal._blobUrl); } catch (_) { /* ignore */ }
      modal._blobUrl = null;
    }
    if (body) body.innerHTML = "";
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  /** Fetch bytes and show via blob URL — GitHub raw sets X-Frame-Options: deny. */
  async function blobUrlForPreview(url, mimeHint) {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const buf = await res.arrayBuffer();
    const type = mimeHint || res.headers.get("content-type") || "application/octet-stream";
    // GitHub often serves PDFs as octet-stream; force PDF so the browser renders it
    const forced =
      /pdf/i.test(mimeHint || "") || /\.pdf(\?|#|$)/i.test(url)
        ? "application/pdf"
        : type;
    return URL.createObjectURL(new Blob([buf], { type: forced }));
  }

  async function openMediaViewer(m, url) {
    const modal = ensureMediaModal();
    const title = modal.querySelector(".media-modal__title");
    const body = modal.querySelector(".media-modal__body");
    const dl = modal.querySelector("#media-modal-download");
    if (title) title.textContent = m.title || m.fileName || "Material";
    if (dl) {
      // Stay on-site: trigger our download handler, don't navigate away
      dl.removeAttribute("href");
      dl.removeAttribute("target");
      dl.onclick = (e) => {
        e.preventDefault();
        openOrDownloadMaterial(m, "download");
      };
    }
    const isVideo = EBBApi.isVideoMaterial(m);
    const isImage = EBBApi.isImageMaterial(m);
    const name = (m.fileName || m.file_path || "").toLowerCase();
    const isPdf = (m.mime_type || "").includes("pdf") || name.endsWith(".pdf");

    modal.hidden = false;
    document.body.classList.add("modal-open");

    if (isVideo) {
      body.innerHTML = `<video class="media-modal__video" controls playsinline preload="metadata" src="${escapeAttr(url)}"></video>
        <p class="media-modal__hint">Playing on Engineering Brain Bank. Download anytime.</p>`;
      return;
    }
    if (isImage) {
      body.innerHTML = `<img class="media-modal__img" src="${escapeAttr(url)}" alt="${escapeAttr(m.title || "")}" />`;
      return;
    }
    if (isPdf) {
      body.innerHTML = `<p class="media-modal__hint">Loading preview…</p>`;
      try {
        const blobUrl = await blobUrlForPreview(url, m.mime_type || "application/pdf");
        modal._blobUrl = blobUrl;
        body.innerHTML = `<iframe class="media-modal__frame" src="${escapeAttr(blobUrl)}#toolbar=1" title="PDF preview"></iframe>
          <p class="media-modal__hint">Preview on site. Use Download to save a copy.</p>`;
      } catch (err) {
        console.warn("[EBB] PDF preview:", err.message || err);
        body.innerHTML = `<p class="media-modal__hint">Preview unavailable here — download still stays on our flow.</p>
          <button type="button" class="btn btn-primary" data-mat-inline-dl="1">Download ${escapeAttr(m.fileName || "file")}</button>`;
        body.querySelector("[data-mat-inline-dl]")?.addEventListener("click", () => {
          openOrDownloadMaterial(m, "download");
        });
      }
      return;
    }
    body.innerHTML = `<p class="media-modal__hint">This file type previews best after download (still stays on our flow).</p>
      <button type="button" class="btn btn-primary" data-mat-inline-dl="1">Download ${escapeAttr(m.fileName || "file")}</button>`;
    body.querySelector("[data-mat-inline-dl]")?.addEventListener("click", () => {
      openOrDownloadMaterial(m, "download");
    });
  }

  /** Canonical domain — WhatsApp OG previews use /s/... on boye.study */
  const SHARE_ORIGIN = "https://boye.study";

  function shareSlugify(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "material";
  }

  function shareCourseSlug(code) {
    const raw = String(code || "gen").trim().toLowerCase().replace(/\s+/g, "");
    const m = raw.match(/^([a-z]+)(\d+)/i);
    if (m) return `${m[1]}-${m[2]}`;
    return shareSlugify(raw);
  }

  /** Strip dump / temp / course-prefix junk so links read like real titles. */
  function cleanShareTitle(title, courseCode) {
    let s = String(title || "").trim();
    s = s.replace(/^~\$/, "");
    s = s.replace(/^tmp[_-]?\d+[-_]?/i, "");
    s = s.replace(/^\(\d+\)\s*/, "");
    s = s.replace(/^[-_\s.]+/, "");
    s = s.replace(/_+/g, " ");
    s = s.replace(/\b\d{8,}\b/g, "");
    s = s.replace(/\s*[-–—]?\s*\(?copy\)?\b/gi, "");
    s = s.replace(/\(bookfi\)/gi, "");
    if (courseCode) {
      const spaced = String(courseCode).trim();
      const compact = spaced.replace(/\s+/g, "");
      const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      s = s.replace(new RegExp("^" + esc(spaced) + "[\\s:_-]+", "i"), "");
      s = s.replace(new RegExp("^" + esc(compact) + "[\\s:_-]+", "i"), "");
    }
    s = s.replace(/\s+/g, " ").trim();
    return s || String(title || "").trim() || "material";
  }

  function titleLooksDump(title) {
    const t = String(title || "");
    return (
      /^~\$/.test(t) ||
      /^tmp[_-]?\d+/i.test(t) ||
      /^_/.test(t) ||
      /\b\d{8,}\b/.test(t) ||
      /_ebook_/i.test(t) ||
      t.length > 70
    );
  }

  function shareDisplayName(m, course) {
    const code = (course && course.code) || m.course_code || "";
    const raw = m.title || m.fileName || "";
    const cleaned = cleanShareTitle(raw, code);
    if (course && course.name && (titleLooksDump(raw) || cleaned.length < 6)) {
      return course.name;
    }
    return cleaned || (course && course.name) || raw || "material";
  }

  /** Clean share URL: https://boye.study/s/ae-196/workshop-practice~12e5ee */
  function materialShareLink(m) {
    if (m && m.live && m.id) {
      const code = m.course_code || (m.courseId && EBB.getCourse(m.courseId)?.code) || "gen";
      const course =
        (m.courseId && EBB.getCourse(m.courseId)) ||
        (m.course_code && EBB.getCourseByCode(m.course_code)) ||
        null;
      const title = shareDisplayName(m, course);
      const short = String(m.id).slice(0, 8);
      return `${SHARE_ORIGIN}/s/${shareCourseSlug(code)}/${shareSlugify(title)}~${short}`;
    }
    try {
      return new URL(
        `./course.html?id=${encodeURIComponent((m && m.courseId) || "")}`,
        window.location.href
      ).href;
    } catch (_) {
      return SHARE_ORIGIN;
    }
  }

  async function shareMaterial(m) {
    const course =
      (m.courseId && EBB.getCourse(m.courseId)) ||
      (m.course_code && EBB.getCourseByCode(m.course_code)) ||
      null;
    const url = materialShareLink(m);
    const typeMeta = EBB.getTypeMeta(m.type);
    const nice = shareDisplayName(m, course);
    const headline = course
      ? `${course.code} — ${
          titleLooksDump(m.title) && course.name ? course.name : nice || course.name
        }`
      : nice || "Engineering Brain Bank material";
    const shareText = `${typeMeta ? typeMeta.name + ": " : ""}${headline}`;

    try {
      // Always share the /s link so WhatsApp / iMessage can unfurl the Boye OG card
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      if (navigator.share) {
        await navigator.share({ title: headline, url, text: shareText });
        showToast("Share link ready.");
      } else {
        showToast("Link copied — paste in WhatsApp.");
      }
      if (m.live && m.id && window.EBBApi) EBBApi.incrementShare(m.id);
    } catch (err) {
      if (err && err.name === "AbortError") return;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          showToast("Link copied — paste in WhatsApp.");
          if (m.live && m.id && window.EBBApi) EBBApi.incrementShare(m.id);
        } else {
          showToast("Could not share.");
        }
      } catch (_) {
        showToast("Could not share.");
      }
    }
  }

  async function downloadOnSite(m, url) {
    const name = m.fileName || "download";
    showToast("Preparing download: " + name);
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const blob = await res.blob();
      const obj = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = obj;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(obj), 4000);
      showToast("Download started: " + name);
    } catch (err) {
      // CORS fallback: hidden iframe keeps the SPA in place (no Drive tab)
      console.warn("[EBB] blob download fallback:", err.message || err);
      const iframe = document.createElement("iframe");
      iframe.hidden = true;
      iframe.src = url;
      document.body.appendChild(iframe);
      setTimeout(() => iframe.remove(), 60000);
      showToast("Download started: " + name);
    }
  }

  async function openOrDownloadMaterial(m, mode) {
    if (m.live && window.EBBApi) {
      const url = resolveMaterialUrl(m);
      if (!url) {
        showToast("File URL missing.");
        return;
      }
      // Never send users to Drive or other sites
      if (/drive\.google\.com/i.test(url)) {
        showToast("This file still points at Drive. Make the GitHub repo public and re-seed.");
        return;
      }
      if (mode === "download") {
        if (m.id) EBBApi.incrementDownload(m.id);
        const dl = resolveDownloadUrl(m) || url;
        await downloadOnSite(m, dl);
        return;
      }
      // Watch / open entirely in our modal (video, PDF, images)
      openMediaViewer(m, url);
      return;
    }
    showToast(mode === "download"
      ? ("Download started: " + (m.fileName || "file"))
      : ("Opening preview for " + (m.fileName || "file") + "…"));
  }

  function materialRowHtml(m, opts) {
    opts = opts || {};
    const c = m.courseId ? EBB.getCourse(m.courseId) : (m.course_code ? EBB.getCourseByCode(m.course_code) : null);
    const courseLink = c ? `./course.html?id=${c.id}` : (opts.resources ? "#" : "#");
    const metaExtra = opts.resources
      ? `<span style="color:var(--gold);font-weight:700">${c ? c.code : escapeAttr(m.course_code || "")}</span>
         <span>${c ? c.name : ""}</span>
         <span>${escapeAttr(m.topic || "")}</span>
         <span>${formatDate(m.date)}</span>`
      : `${typeBadge(m.type)}
         <span>${escapeAttr(m.lecturer || "KB4GESA")}</span>
         <span>${formatDate(m.date)}</span>
         <span>${escapeAttr(formatBytesLabel(m.size))}</span>
         <span>${m.downloads || 0} downloads</span>`;
    const titleInner = opts.resources
      ? `<a href="${courseLink}" style="color:inherit">${escapeAttr(m.title)}</a>`
      : escapeAttr(m.title);
    const isVid = m.live && window.EBBApi && EBBApi.isVideoMaterial(m);
    const openLabel = isVid ? "Watch" : "Open";
    const actions = opts.resources
      ? (m.live
          ? `<button class="btn btn-primary btn-sm" type="button" data-mat-action="open" data-mat-id="${escapeAttr(m.id)}">${openLabel}</button>
             <button class="btn btn-ghost btn-sm" type="button" data-mat-action="download" data-mat-id="${escapeAttr(m.id)}">Download</button>
             <button class="btn btn-ghost btn-sm" type="button" data-mat-action="share" data-mat-id="${escapeAttr(m.id)}">Share</button>`
          : `<a class="btn btn-primary btn-sm" href="${courseLink}">Open</a>`)
      : `<button class="btn btn-ghost btn-sm" type="button" data-mat-action="view" data-mat-id="${escapeAttr(m.id)}">${isVid ? "Watch" : "View"}</button>
         <button class="btn btn-primary btn-sm" type="button" data-mat-action="download" data-mat-id="${escapeAttr(m.id)}">Download</button>
         <button class="btn btn-ghost btn-sm" type="button" data-mat-action="share" data-mat-id="${escapeAttr(m.id)}">Share</button>`;
    const typePart = opts.resources ? typeBadge(m.type) + " " : "";
    return `<div class="material-row" data-mat-id="${escapeAttr(m.id)}">
      <div>
        <h3>${titleInner}</h3>
        <div class="meta">${typePart}${metaExtra}</div>
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">${actions}</div>
    </div>`;
  }

  function escapeAttr(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function wireMaterialActions(root, materialsById) {
    if (!root) return;
    root._matMap = materialsById;
    if (root.dataset.matWired === "1") return;
    root.dataset.matWired = "1";
    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-mat-action]");
      if (!btn) return;
      const id = btn.getAttribute("data-mat-id");
      const action = btn.getAttribute("data-mat-action");
      const map = root._matMap || new Map();
      const m = map.get(id);
      if (!m) return;
      if (action === "view" || action === "open") openOrDownloadMaterial(m, "view");
      else if (action === "download") openOrDownloadMaterial(m, "download");
      else if (action === "share") shareMaterial(m);
    });
  }


  function wireSearch(formId, inputId, resultsId) {
    const form = qs("#" + formId);
    const input = qs("#" + inputId);
    const results = qs("#" + resultsId);
    if (!form || !input || !results) return;

    function render(q) {
      const data = EBB.search(q);
      if (!q.trim()) { results.classList.remove("open"); results.innerHTML = ""; return; }
      const items = [];
      data.courses.slice(0, 6).forEach((c) => {
        const dept = EBB.getDepartment(c.department);
        items.push(`<a href="./course.html?id=${c.id}" role="option"><span class="sr-code">${c.code}</span>${c.name}<span class="sr-meta">${dept ? dept.name : ""} · Level ${c.level}</span></a>`);
      });
      data.materials.slice(0, 6).forEach((m) => {
        const c = EBB.getCourse(m.courseId);
        items.push(`<a href="./course.html?id=${m.courseId}" role="option"><span class="sr-code">${c ? c.code : ""}</span>${m.title}<span class="sr-meta">${m.topic} · ${EBB.getTypeMeta(m.type)?.name || m.type}</span></a>`);
      });
      results.innerHTML = items.length ? items.join("") : `<div class="sr-empty">No results for “${q}”</div>`;
      results.classList.add("open");
    }

    input.addEventListener("input", () => render(input.value));
    input.addEventListener("focus", () => { if (input.value.trim()) render(input.value); });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      window.location.href = `./resources.html?q=${encodeURIComponent(q)}`;
    });
    document.addEventListener("click", (e) => {
      if (!form.contains(e.target) && !results.contains(e.target)) results.classList.remove("open");
    });
  }

  /* ---------- Home ---------- */
  function initHome() {
    const featureGrid = qs("#feature-grid");
    if (featureGrid) {
      const copy = {
        slides: "Lecture decks organized by department, level, and course.",
        notes: "Detailed notes to revise topics before exams and labs.",
        "past-questions": "Past papers and mid-sems to sharpen exam prep.",
        tutorials: "Worked examples and tutorial sets for practice.",
        videos: "Watch lecture clips on the site — download optional.",
        shared: "Peer uploads — tutorials, solutions, and study packs.",
      };
      const typesWithContent = EBB.materialTypes.filter(
        (t) => EBB.materials.some((m) => m.type === t.id)
      );
      const types = typesWithContent.length ? typesWithContent : EBB.materialTypes;
      featureGrid.innerHTML = types.map((t) => {
        const n = EBB.materials.filter((m) => m.type === t.id).length;
        return `
        <a class="feature-card" href="./resources.html?type=${t.id}">
          <span class="feature-icon">${ICONS[t.id] || ICONS.slides}</span>
          <div>
            <h3>${t.name}</h3>
            <p>${copy[t.id] || ""} ${n ? `(${n})` : ""}</p>
          </div>
        </a>`;
      }).join("");
    }

    const deptGrid = qs("#dept-grid");
    if (deptGrid) {
      const blurbs = {
        civil: "Structures, geotech, highways, and water resources.",
        electrical: "Power, circuits, machines, and control systems.",
        mechanical: "Thermo, design, fluids, and manufacturing.",
        computer: "DSA, networks, embedded, AI, and software.",
        chemical: "Reactors, transport, and process control.",
        industrial: "OR, quality, production, and ergonomics.",
        agricultural: "Ag machines, soils, and farm systems.",
        general: "Math, communication skills, and shared packs.",
      };
      const depts = EBB.departments.filter((d) => d.count > 0);
      deptGrid.innerHTML = (depts.length ? depts : EBB.departments).map((d) => `
        <a class="dept-card" href="./courses.html?dept=${d.id}">
          <span class="dept-badge">${d.count}</span>
          <h3>${d.name}</h3>
          <p>${blurbs[d.id] || "Browse courses and materials."}</p>
        </a>`).join("");
    }

    const recentList = qs("#recent-list");
    if (recentList) {
      const recent = EBB.recentMaterials(8);
      if (!recent.length) {
        recentList.innerHTML = `<div class="empty-state">Library loading…</div>`;
      } else {
        recentList.innerHTML = recent.map((m) => {
          const href = m.courseId
            ? `./course.html?id=${encodeURIComponent(m.courseId)}`
            : "./resources.html";
          return `<a class="recent-item" href="${href}">
            <span class="recent-code">${escapeAttr(m.course_code || "FILE")}</span>
            <span class="recent-name">${escapeAttr(m.title)}</span>
          </a>`;
        }).join("");
      }
    }

    wireSearch("hero-search-form", "hero-search", "search-results");
  }

  /* ---------- Courses ---------- */
  function initCourses() {
    const grid = qs("#course-grid");
    if (!grid) return;
    const p = params();
    const deptSel = qs("#filter-dept");
    const levelSel = qs("#filter-level");
    const qInput = qs("#filter-q");

    const deptsWithContent = EBB.departments.filter((d) => d.count > 0);
    if (deptSel) {
      deptSel.innerHTML = `<option value="">All departments</option>` +
        (deptsWithContent.length ? deptsWithContent : EBB.departments)
          .map((d) => `<option value="${d.id}">${d.name} (${d.count})</option>`).join("");
      if (p.get("dept")) deptSel.value = p.get("dept");
    }
    if (levelSel) {
      levelSel.innerHTML = `<option value="">All levels</option>` +
        EBB.levels.map((l) => `<option value="${l.id}">${l.name}</option>`).join("");
      if (p.get("level")) levelSel.value = p.get("level");
    }
    if (qInput && p.get("q")) qInput.value = p.get("q");

    function render() {
      const dept = deptSel?.value || "";
      const level = levelSel?.value || "";
      const q = (qInput?.value || "").toLowerCase().trim();
      let list = [...EBB.courses];
      if (dept) list = list.filter((c) => c.department === dept);
      if (level) list = list.filter((c) => c.level === level);
      if (q) {
        list = list.filter((c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)
        );
      }
      const countEl = qs("#course-count");
      if (countEl) countEl.textContent = `${list.length} course${list.length === 1 ? "" : "s"}`;
      if (!list.length) {
        grid.innerHTML = `<div class="empty-state">No courses in the live library match your filters.</div>`;
        return;
      }
      grid.innerHTML = list.map((c) => {
        const deptMeta = EBB.getDepartment(c.department);
        const mats = c.materialCount || EBB.getMaterialsForCourse(c.id).length;
        return `<a class="course-card" href="./course.html?id=${encodeURIComponent(c.id)}">
          <span class="code">${escapeAttr(c.code)}</span>
          <h3>${escapeAttr(c.name)}</h3>
          <div class="meta">
            <span>${deptMeta ? deptMeta.short : ""}</span>
            <span>Level ${escapeAttr(c.level)}</span>
            <span>${mats} material${mats === 1 ? "" : "s"}</span>
          </div>
          <p class="desc">${escapeAttr(c.description)}</p>
        </a>`;
      }).join("");
    }

    [deptSel, levelSel].forEach((el) => el && el.addEventListener("change", render));
    if (qInput) qInput.addEventListener("input", render);
    render();
  }

  /* ---------- Course detail ---------- */
  function initCourse() {
    const root = qs("#course-root");
    if (!root) return;
    const id = params().get("id");
    const codeParam = params().get("code");
    const course = EBB.getCourse(id) || (codeParam ? EBB.getCourseByCode(codeParam) : null);
    if (!course) {
      root.innerHTML = `<div class="empty-state"><p>Course not found in the live library.</p><a class="btn btn-primary" href="./courses.html">Browse courses</a></div>`;
      return;
    }
    const dept = EBB.getDepartment(course.department);
    document.title = `${course.code} · ${course.name} | Engineering Brain Bank`;

    const materials = EBB.getMaterialsForCourse(course.id)
      .sort((a, b) => (a.type || "").localeCompare(b.type || "") || (a.title || "").localeCompare(b.title || ""));
    const byTopic = {};
    materials.forEach((m) => {
      (byTopic[m.topic || "Materials"] ||= []).push(m);
    });
    const map = new Map(materials.map((m) => [String(m.id), m]));
    root.innerHTML = `
      <div class="breadcrumb">
        <a href="./index.html">Home</a><span>/</span>
        <a href="./courses.html">Courses</a><span>/</span>
        <a href="./courses.html?dept=${encodeURIComponent(course.department)}">${dept ? escapeAttr(dept.short) : ""}</a><span>/</span>
        ${escapeAttr(course.code)}
      </div>
      <div class="course-header-block">
        <div>
          <div class="code">${escapeAttr(course.code)}</div>
          <h1 style="font-size:clamp(1.6rem,3.5vw,2.2rem);font-weight:800;margin:0.35rem 0 0.5rem">${escapeAttr(course.name)}</h1>
          <p style="color:var(--text-muted);max-width:40rem">${escapeAttr(course.description)}</p>
        </div>
        <div class="stat-pills">
          <span class="stat-pill"><strong>${dept ? escapeAttr(dept.name) : ""}</strong></span>
          <span class="stat-pill">Level <strong>${escapeAttr(course.level)}</strong></span>
          <span class="stat-pill"><strong>${materials.length}</strong> materials</span>
        </div>
      </div>
      <h2 class="section-title" style="margin-top:2rem">Materials (${materials.length})</h2>
      ${materials.length ? Object.entries(byTopic).map(([topic, mats]) => `
        <h3 style="font-size:1rem;margin:1.25rem 0 0.65rem;color:var(--gold)">${escapeAttr(topic)}</h3>
        <div class="material-list">
          ${mats.map((m) => materialRowHtml(m, {})).join("")}
        </div>`).join("") : `<div class="empty-state">No materials yet.</div>`}
    `;
    wireMaterialActions(root, map);
  }

  /* ---------- Resources ---------- */
  function initResources() {
    const list = qs("#resource-list");
    if (!list) return;
    const p = params();
    const typeSel = qs("#filter-type");
    const deptSel = qs("#filter-dept");
    const levelSel = qs("#filter-level");
    const qInput = qs("#filter-q");
    const PAGE = 60;
    let pageIdx = 0;

    if (typeSel) {
      typeSel.innerHTML = `<option value="">All types</option>` +
        EBB.materialTypes.map((t) => {
          const n = EBB.materials.filter((m) => m.type === t.id).length;
          return `<option value="${t.id}">${t.name}${n ? ` (${n})` : ""}</option>`;
        }).join("");
      if (p.get("type")) typeSel.value = p.get("type");
    }
    if (deptSel) {
      const depts = EBB.departments.filter((d) => d.count > 0);
      deptSel.innerHTML = `<option value="">All departments</option>` +
        (depts.length ? depts : EBB.departments)
          .map((d) => `<option value="${d.id}">${d.name} (${d.count})</option>`).join("");
      if (p.get("dept")) deptSel.value = p.get("dept");
    }
    if (levelSel) {
      levelSel.innerHTML = `<option value="">All levels</option>` +
        EBB.levels.map((l) => `<option value="${l.id}">${l.name}</option>`).join("");
      if (p.get("level")) levelSel.value = p.get("level");
    }
    if (qInput && p.get("q")) qInput.value = p.get("q");

    function render() {
      const filtered = EBB.filterMaterials({
        type: typeSel?.value || "",
        department: deptSel?.value || "",
        level: levelSel?.value || "",
        query: qInput?.value || "",
      }).sort((a, b) => new Date(b.date) - new Date(a.date));

      const countEl = qs("#resource-count");
      if (countEl) {
        countEl.textContent = `${filtered.length} resource${filtered.length === 1 ? "" : "s"}`;
      }

      if (!filtered.length) {
        list.innerHTML = `<div class="empty-state">No resources match your filters.</div>`;
        return;
      }

      const maxPage = Math.max(0, Math.ceil(filtered.length / PAGE) - 1);
      if (pageIdx > maxPage) pageIdx = 0;
      const slice = filtered.slice(pageIdx * PAGE, pageIdx * PAGE + PAGE);
      const map = new Map(slice.map((m) => [String(m.id), m]));
      list.innerHTML =
        slice.map((m) => materialRowHtml(m, { resources: true })).join("") +
        (filtered.length > PAGE
          ? `<div class="pager" style="display:flex;gap:0.75rem;align-items:center;justify-content:center;margin:1.5rem 0;flex-wrap:wrap">
              <button type="button" class="btn btn-ghost btn-sm" id="page-prev" ${pageIdx === 0 ? "disabled" : ""}>Previous</button>
              <span style="color:var(--text-dim);font-size:0.9rem">Page ${pageIdx + 1} / ${maxPage + 1}</span>
              <button type="button" class="btn btn-ghost btn-sm" id="page-next" ${pageIdx >= maxPage ? "disabled" : ""}>Next</button>
            </div>`
          : "");
      wireMaterialActions(list, map);
      qs("#page-prev")?.addEventListener("click", () => {
        pageIdx = Math.max(0, pageIdx - 1);
        render();
        list.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      qs("#page-next")?.addEventListener("click", () => {
        pageIdx = Math.min(maxPage, pageIdx + 1);
        render();
        list.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    [typeSel, deptSel, levelSel].forEach((el) =>
      el && el.addEventListener("change", () => {
        pageIdx = 0;
        render();
      })
    );
    if (qInput) {
      qInput.addEventListener("input", () => {
        pageIdx = 0;
        render();
      });
    }
    render();
  }

  /* ---------- Upload ---------- */
  function initUpload() {
    const form = qs("#upload-form");
    if (!form) return;

    const deptSel = qs("#up-dept");
    const levelSel = qs("#up-level");
    const semSel = qs("#up-sem");
    const typeSel = qs("#up-type");
    const fileInput = qs("#up-file");
    const fileDrop = qs("#file-drop");
    const fileName = qs("#file-name");

    if (deptSel) deptSel.innerHTML = `<option value="">Select department</option>` +
      EBB.departments.map((d) => `<option value="${d.id}">${d.name}</option>`).join("");
    if (levelSel) levelSel.innerHTML = `<option value="">Select level</option>` +
      EBB.levels.map((l) => `<option value="${l.id}">${l.name}</option>`).join("");
    if (semSel) semSel.innerHTML = `<option value="">Select semester</option>` +
      EBB.semesters.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
    if (typeSel) typeSel.innerHTML = `<option value="">Select type</option>` +
      EBB.materialTypes.map((t) => `<option value="${t.id}">${t.name}</option>`).join("");

    function showFile(f) {
      if (fileName) fileName.textContent = f ? f.name : "";
    }
    if (fileDrop && fileInput) {
      fileDrop.addEventListener("click", () => fileInput.click());
      fileDrop.addEventListener("dragover", (e) => { e.preventDefault(); fileDrop.classList.add("dragover"); });
      fileDrop.addEventListener("dragleave", () => fileDrop.classList.remove("dragover"));
      fileDrop.addEventListener("drop", (e) => {
        e.preventDefault();
        fileDrop.classList.remove("dragover");
        if (e.dataTransfer.files?.[0]) {
          fileInput.files = e.dataTransfer.files;
          showFile(e.dataTransfer.files[0]);
        }
      });
      fileInput.addEventListener("change", () => showFile(fileInput.files?.[0]));
    }

    // Enforce allowlist on public upload form (owner publishes via Admin)
    if (fileInput && window.EBBApi) {
      fileInput.setAttribute("accept", EBBApi.acceptAttr());
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const required = ["up-dept", "up-level", "up-sem", "up-code", "up-name", "up-topic", "up-type", "up-lecturer"];
      for (const id of required) {
        const el = qs("#" + id);
        if (!el || !String(el.value || "").trim()) {
          showToast("Please fill in all required fields.");
          el?.focus();
          return;
        }
      }
      if (!fileInput?.files?.length) {
        showToast("Please choose a file to upload.");
        return;
      }
      const f = fileInput.files[0];
      if (window.EBBApi && !EBBApi.isAllowedFile(f)) {
        showToast("File type not allowed. Use PDF, PPT/PPTX, DOC/DOCX, TXT, or MD.");
        return;
      }
      showToast("Thanks — request noted. The live library is published by KB4GESA via Admin.");
      form.reset();
      showFile(null);
    });
  }

  /* ---------- Share landing (AceWithBoye card + open/download) ---------- */
  function resolveShareMaterial() {
    const boot = window.__EBB_SHARE__ || null;
    const q = params();
    const legacyId = q.get("m") || (boot && boot.id) || "";
    if (legacyId) {
      const exact = EBB.materials.find((x) => String(x.id) === String(legacyId));
      if (exact) return exact;
    }
    const shortId =
      (boot && boot.shortId) ||
      (() => {
        const path = window.location.pathname || "";
        const m = path.match(/\/s\/[^/]+\/[^/]+~([a-f0-9]{6,12})\/?$/i);
        return m ? m[1].toLowerCase() : "";
      })();
    if (shortId) {
      return (
        EBB.materials.find((x) => String(x.id).toLowerCase().startsWith(shortId)) ||
        null
      );
    }
    return null;
  }

  async function initShare() {
    const root = qs("#share-root");
    if (!root) return;
    const m = resolveShareMaterial();
    if (!m) {
      root.innerHTML = `<div class="empty-state"><p>This material is not available.</p><a class="btn btn-primary" href="/resources.html">Browse resources</a></div>`;
      return;
    }
    // Keep the address bar on /s/... — strip legacy ?m=<uuid> if present
    try {
      if (params().get("m") && window.history && window.history.replaceState) {
        const pretty =
          (window.__EBB_SHARE__ && window.__EBB_SHARE__.prettyPath) ||
          materialShareLink(m).replace(SHARE_ORIGIN, "");
        if (pretty && pretty.startsWith("/s/")) {
          window.history.replaceState({}, "", pretty);
        }
      }
    } catch (_) {
      /* ignore */
    }

    const course =
      (m.courseId && EBB.getCourse(m.courseId)) ||
      (m.course_code && EBB.getCourseByCode(m.course_code)) ||
      null;
    const typeMeta = EBB.getTypeMeta(m.type);
    const nice = shareDisplayName(m, course);
    const headline = course
      ? `${course.code} — ${
          titleLooksDump(m.title) && course.name ? course.name : nice || course.name
        }`
      : nice;

    document.title = `${headline} | AceWithBoye`;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", headline);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute(
        "content",
        `${typeMeta ? typeMeta.name : "Material"} · AceWithBoye · KB4GESA`
      );
    }

    let cardHtml = "";
    try {
      if (window.EBBOgCard) {
        const card = await EBBOgCard.buildMaterialCard(m, course);
        cardHtml = `<img class="share-card-preview" src="${card.dataUrl}" alt="${escapeAttr(headline)}" width="1200" height="630" style="width:min(100%,720px);height:auto;border-radius:12px;margin:0 0 1.5rem;box-shadow:0 12px 40px rgba(0,0,0,.45)" />`;
      }
    } catch (err) {
      console.warn("[EBB] share card preview:", err.message || err);
    }

    const map = new Map([[String(m.id), m]]);
    root.innerHTML = `
      <div class="breadcrumb">
        <a href="/index.html">Home</a><span>/</span>
        <a href="/resources.html">Resources</a><span>/</span>
        Shared
      </div>
      ${cardHtml}
      <div class="course-header-block" style="margin-bottom:1.25rem">
        <div class="code">${escapeAttr(course ? course.code : m.course_code || "")}</div>
        <h1 style="font-size:clamp(1.4rem,3vw,2rem);font-weight:800;margin:0.35rem 0 0.5rem">${escapeAttr(nice)}</h1>
        <p style="color:var(--text-muted)">${escapeAttr(typeMeta ? typeMeta.name : m.type || "")} · AceWithBoye · Engineering Brain Bank</p>
      </div>
      <div class="material-list" id="share-mat-list">
        ${materialRowHtml(m, { resources: true })}
      </div>
      <div style="margin-top:1.25rem;display:flex;gap:0.75rem;flex-wrap:wrap">
        ${course ? `<a class="btn btn-ghost" href="/course.html?id=${encodeURIComponent(course.id)}">View course</a>` : ""}
        <a class="btn btn-ghost" href="/resources.html">All resources</a>
      </div>`;
    wireMaterialActions(qs("#share-mat-list"), map);
  }

  /* ---------- Boot (live catalog only) ---------- */
  async function boot() {
    injectChrome();
    const page = document.body.dataset.page;

    const loading = document.createElement("div");
    loading.id = "ebb-boot-status";
    loading.className = "empty-state";
    loading.style.cssText = "padding:1.25rem;text-align:center;color:var(--text-dim)";
    loading.textContent = "Loading live library…";
    const main = document.getElementById("main");
    if (main && page !== "upload" && page !== "about" && page !== "admin") {
      main.prepend(loading);
    }

    try {
      const live = await fetchLiveMaterials();
      const stats = EBB.hydrateFromLive(live);
      console.info("[EBB] live catalog", stats);
      if (!live.length) {
        loading.textContent = "No published materials yet. Check Supabase / Admin.";
      } else {
        loading.remove();
      }
    } catch (err) {
      console.error(err);
      loading.textContent = "Could not load the live library.";
    }

    if (page === "home") initHome();
    else if (page === "courses") initCourses();
    else if (page === "course") initCourse();
    else if (page === "resources") initResources();
    else if (page === "upload") initUpload();
    else if (page === "share") await initShare();

    if (window.EBBApi && EBBApi.isConfigured()) {
      const path = window.location.pathname || ("/" + (page || "home"));
      EBBApi.recordPageViewOncePerSession(path);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    boot().catch((err) => console.error("[EBB] boot failed", err));
  });

  window.EBBApp = { showToast, CREST_SVG, SWOOSH_SVG, fetchLiveMaterials, boot };
})();
