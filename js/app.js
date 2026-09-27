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

  function injectChrome() {
    const headerEl = document.getElementById("site-header");
    const footerEl = document.getElementById("site-footer");
    const page = document.body.dataset.page || "";

    if (headerEl) {
      headerEl.innerHTML = `
        <div class="container header-inner">
          <a class="brand" href="./index.html" aria-label="KB4GESA Engineering Brain Bank home">
            ${CREST_SVG}
            <span class="brand-text">
              <span class="brand-code">KB4GESA</span>
              <span class="brand-divider" aria-hidden="true"></span>
              <span class="brand-name">Engineering<br>Brain Bank</span>
            </span>
          </a>
          <div class="header-right">
            <nav class="nav" id="main-nav" aria-label="Primary">
              <a href="./index.html" ${page === "home" ? 'class="active"' : ""}>Home</a>
              <a href="./courses.html" ${page === "courses" || page === "course" ? 'class="active"' : ""}>Courses</a>
              <a href="./resources.html" ${page === "resources" ? 'class="active"' : ""}>Resources</a>
              <a href="./upload.html" ${page === "upload" ? 'class="active"' : ""}>Upload</a>
              <a href="./about.html" ${page === "about" ? 'class="active"' : ""}>About</a>
            </nav>
            <div class="header-actions">
              <a class="icon-btn" href="./resources.html" aria-label="Search resources" title="Search">${ICONS.search}</a>
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
              <a href="./index.html">Home</a>
              <a href="./courses.html">Courses</a>
              <a href="./resources.html">Resources</a>
              <a href="./upload.html">Upload</a>
              <a href="./about.html">About</a>
            </div>
            <div class="footer-col">
              <h4>Departments</h4>
              <a href="./courses.html?dept=civil">Civil</a>
              <a href="./courses.html?dept=electrical">Electrical</a>
              <a href="./courses.html?dept=mechanical">Mechanical</a>
              <a href="./courses.html?dept=computer">Computer</a>
              <a href="./courses.html?dept=chemical">Chemical</a>
              <a href="./courses.html?dept=industrial">Industrial</a>
            </div>
            <div class="footer-col">
              <h4>Help</h4>
              <a href="./about.html#faqs">FAQs</a>
              <a href="./about.html#contact">Contact</a>
              <a href="./about.html#terms">Terms of Service</a>
              <a href="./about.html#privacy">Privacy Policy</a>
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
        shared: "Peer uploads — tutorials, solutions, and study packs.",
      };
      featureGrid.innerHTML = EBB.materialTypes.map((t) => `
        <a class="feature-card" href="./resources.html?type=${t.id}">
          <span class="feature-icon">${ICONS[t.id] || ICONS.slides}</span>
          <div>
            <h3>${t.name}</h3>
            <p>${copy[t.id] || ""}</p>
          </div>
        </a>`).join("");
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
      };
      deptGrid.innerHTML = EBB.departments.map((d) => `
        <a class="dept-card" href="./courses.html?dept=${d.id}">
          <span class="dept-badge">${d.count}</span>
          <h3>${d.name}</h3>
          <p>${blurbs[d.id] || "Browse courses and materials."}</p>
        </a>`).join("");
    }

    const recentList = qs("#recent-list");
    if (recentList) {
      // Prefer mock-matching order: CE 403, ME 321 first, then other recent course hits
      const prefer = ["ce-403", "me-321", "ce-405", "ge-402", "coe-457", "ee-401"];
      const seen = new Set();
      const ordered = [];
      prefer.forEach((id) => {
        const c = EBB.getCourse(id);
        if (c) { ordered.push(c); seen.add(id); }
      });
      EBB.recentMaterials(12).forEach((m) => {
        if (!seen.has(m.courseId)) {
          const c = EBB.getCourse(m.courseId);
          if (c) { ordered.push(c); seen.add(m.courseId); }
        }
      });
      recentList.innerHTML = ordered.slice(0, 6).map((c) => {
        return `<a class="recent-item" href="./course.html?id=${c.id}">
          <span class="recent-code">${c.code}</span>
          <span class="recent-name">${c.name}</span>
        </a>`;
      }).join("");
    }

    // Inject swoosh into hero title if present
    const swooshWord = null; // PNG swoosh in HTML; skip SVG inject
    const _swooshWordUnused = qs(".swoosh-word");
    if (swooshWord && !swooshWord.querySelector(".swoosh")) {
      swooshWord.insertAdjacentHTML("beforeend", SWOOSH_SVG);
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

    if (deptSel) {
      deptSel.innerHTML = `<option value="">All departments</option>` +
        EBB.departments.map((d) => `<option value="${d.id}">${d.name}</option>`).join("");
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
      if (q) list = list.filter((c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.lecturer.toLowerCase().includes(q)
      );
      const countEl = qs("#course-count");
      if (countEl) countEl.textContent = `${list.length} course${list.length === 1 ? "" : "s"}`;
      if (!list.length) {
        grid.innerHTML = `<div class="empty-state">No courses match your filters.</div>`;
        return;
      }
      grid.innerHTML = list.map((c) => {
        const deptMeta = EBB.getDepartment(c.department);
        const mats = EBB.getMaterialsForCourse(c.id).length;
        return `<a class="course-card" href="./course.html?id=${c.id}">
          <span class="code">${c.code}</span>
          <h3>${c.name}</h3>
          <div class="meta">
            <span>${deptMeta ? deptMeta.short : ""}</span>
            <span>Level ${c.level}</span>
            <span>Sem ${c.semester}</span>
            <span>${mats} material${mats === 1 ? "" : "s"}</span>
          </div>
          <p class="desc">${c.description}</p>
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
    const course = EBB.getCourse(id);
    if (!course) {
      root.innerHTML = `<div class="empty-state"><p>Course not found.</p><a class="btn btn-primary" href="./courses.html">Browse courses</a></div>`;
      return;
    }
    const dept = EBB.getDepartment(course.department);
    const materials = EBB.getMaterialsForCourse(course.id);
    document.title = `${course.code} · ${course.name} | Engineering Brain Bank`;

    const byTopic = {};
    materials.forEach((m) => {
      (byTopic[m.topic] ||= []).push(m);
    });

    root.innerHTML = `
      <div class="breadcrumb">
        <a href="./index.html">Home</a><span>/</span>
        <a href="./courses.html">Courses</a><span>/</span>
        <a href="./courses.html?dept=${course.department}">${dept ? dept.short : ""}</a><span>/</span>
        ${course.code}
      </div>
      <div class="course-header-block">
        <div>
          <div class="code">${course.code}</div>
          <h1 style="font-size:clamp(1.6rem,3.5vw,2.2rem);font-weight:800;margin:0.35rem 0 0.5rem">${course.name}</h1>
          <p style="color:var(--text-muted);max-width:40rem">${course.description}</p>
        </div>
        <div class="stat-pills">
          <span class="stat-pill"><strong>${dept ? dept.name : ""}</strong></span>
          <span class="stat-pill">Level <strong>${course.level}</strong></span>
          <span class="stat-pill">Semester <strong>${course.semester}</strong></span>
          <span class="stat-pill"><strong>${course.lecturer}</strong></span>
        </div>
      </div>
      <p style="margin:1.25rem 0 0.5rem;font-size:0.82rem;color:var(--text-dim)">
        Org: ${dept ? dept.name : ""} → Level ${course.level} → Semester ${course.semester} → ${course.code} → Topic → Material
      </p>
      <h2 class="section-title" style="margin-top:2rem">Materials (${materials.length})</h2>
      ${materials.length ? Object.entries(byTopic).map(([topic, mats]) => `
        <h3 style="font-size:1rem;margin:1.25rem 0 0.65rem;color:var(--gold)">${topic}</h3>
        <div class="material-list">
          ${mats.map((m) => `
            <div class="material-row">
              <div>
                <h3>${m.title}</h3>
                <div class="meta">
                  ${typeBadge(m.type)}
                  <span>${m.lecturer}</span>
                  <span>${formatDate(m.date)}</span>
                  <span>${m.size}</span>
                  <span>${m.downloads} downloads</span>
                </div>
              </div>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-ghost btn-sm" type="button" data-toast="Opening preview for ${m.fileName}…">View</button>
                <button class="btn btn-primary btn-sm" type="button" data-toast="Download started: ${m.fileName}">Download</button>
              </div>
            </div>`).join("")}
        </div>`).join("") : `<div class="empty-state">No materials yet. <a href="./upload.html">Upload the first one</a>.</div>`}
    `;

    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-toast]");
      if (btn) showToast(btn.getAttribute("data-toast"));
    });
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

    if (typeSel) {
      typeSel.innerHTML = `<option value="">All types</option>` +
        EBB.materialTypes.map((t) => `<option value="${t.id}">${t.name}</option>`).join("");
      if (p.get("type")) typeSel.value = p.get("type");
    }
    if (deptSel) {
      deptSel.innerHTML = `<option value="">All departments</option>` +
        EBB.departments.map((d) => `<option value="${d.id}">${d.name}</option>`).join("");
      if (p.get("dept")) deptSel.value = p.get("dept");
    }
    if (levelSel) {
      levelSel.innerHTML = `<option value="">All levels</option>` +
        EBB.levels.map((l) => `<option value="${l.id}">${l.name}</option>`).join("");
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
      if (countEl) countEl.textContent = `${filtered.length} resource${filtered.length === 1 ? "" : "s"}`;

      if (!filtered.length) {
        list.innerHTML = `<div class="empty-state">No resources match your filters.</div>`;
        return;
      }
      list.innerHTML = filtered.map((m) => {
        const c = EBB.getCourse(m.courseId);
        return `<div class="material-row">
          <div>
            <h3><a href="./course.html?id=${m.courseId}" style="color:inherit">${m.title}</a></h3>
            <div class="meta">
              ${typeBadge(m.type)}
              <span style="color:var(--gold);font-weight:700">${c ? c.code : ""}</span>
              <span>${c ? c.name : ""}</span>
              <span>${m.topic}</span>
              <span>${formatDate(m.date)}</span>
            </div>
          </div>
          <a class="btn btn-primary btn-sm" href="./course.html?id=${m.courseId}">Open</a>
        </div>`;
      }).join("");
    }

    [typeSel, deptSel, levelSel].forEach((el) => el && el.addEventListener("change", render));
    if (qInput) qInput.addEventListener("input", render);
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
      showToast("Thanks! Your material was submitted for review. (Demo — nothing was uploaded.)");
      form.reset();
      showFile(null);
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    injectChrome();
    const page = document.body.dataset.page;
    if (page === "home") initHome();
    else if (page === "courses") initCourses();
    else if (page === "course") initCourse();
    else if (page === "resources") initResources();
    else if (page === "upload") initUpload();
  });

  window.EBBApp = { showToast, CREST_SVG, SWOOSH_SVG };
})();
