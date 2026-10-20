/* KB'S BRAIN BANK — catalog shell.
   Courses + materials are hydrated at runtime from Supabase (live library). */

const EBB = {
  brand: {
    short: "KB4GESA",
    name: "KB'S BRAIN BANK",
    tagline: "Learn • Share • Succeed",
    purpose:
      "One centralized place for engineering students to find and share slides, notes, past questions, and videos under KB4GESA.",
    closing: "From Korley Boye, For Korley Boye.",
  },

  departments: [
    { id: "civil", name: "Civil Engineering", short: "Civil", code: "CE", icon: "🏗", count: 0 },
    { id: "electrical", name: "Electrical Engineering", short: "Electrical", code: "EE", icon: "⚡", count: 0 },
    { id: "mechanical", name: "Mechanical Engineering", short: "Mechanical", code: "ME", icon: "⚙", count: 0 },
    { id: "computer", name: "Computer Engineering", short: "Computer", code: "COE", icon: "💻", count: 0 },
    { id: "chemical", name: "Chemical Engineering", short: "Chemical", code: "CHE", icon: "⚗", count: 0 },
    { id: "industrial", name: "Industrial Engineering", short: "Industrial", code: "IE", icon: "🏭", count: 0 },
    { id: "agricultural", name: "Agricultural Engineering", short: "Agricultural", code: "AE", icon: "🌾", count: 0 },
    { id: "general", name: "General / Shared", short: "General", code: "GEN", icon: "📚", count: 0 },
  ],

  levels: [
    { id: "100", name: "Level 100", year: 1 },
    { id: "200", name: "Level 200", year: 2 },
    { id: "300", name: "Level 300", year: 3 },
    { id: "400", name: "Level 400", year: 4 },
  ],

  semesters: [
    { id: "1", name: "Semester 1" },
    { id: "2", name: "Semester 2" },
  ],

  materialTypes: [
    { id: "slides", name: "Course Slides", icon: "📊" },
    { id: "notes", name: "Lecture Notes", icon: "📝" },
    { id: "past-questions", name: "Past Questions", icon: "📋" },
    { id: "tutorials", name: "Tutorials", icon: "🧮" },
    { id: "videos", name: "Videos", icon: "🎬" },
    { id: "shared", name: "Shared by Students", icon: "🤝" },
  ],

  /** Populated by EBB.hydrateFromLive() */
  courses: [],
  materials: [],
  liveReady: false,
};

function slugifyCode(code) {
  return String(code || "unknown")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";
}

function titleCaseWords(s) {
  return String(s || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Derive a human course name from materials/year-N/FOLDER/... */
EBB.courseNameFromPath = (filePath, fallbackCode) => {
  const parts = String(filePath || "").replace(/\\/g, "/").split("/");
  // materials / year-1 / AE-196-Engineering-Workshop-Practice / notes / file
  const folder = parts.length >= 3 ? parts[2] : "";
  if (!folder) return fallbackCode || "Course";
  const m = folder.match(/^[A-Za-z]+-\d{2,4}-(.+)$/);
  if (m) return titleCaseWords(m[1]);
  if (/^extras/i.test(folder) || /^semester/i.test(folder)) return titleCaseWords(folder);
  return titleCaseWords(folder);
};

EBB.normalizeCode = (code) => String(code || "").toLowerCase().replace(/\s+/g, "");

/**
 * Hydrate courses + materials from live Supabase rows.
 * @param {Array} uiMaterials materials already mapped via EBBApi.toUiMaterial
 */
EBB.hydrateFromLive = (uiMaterials) => {
  const list = Array.isArray(uiMaterials) ? uiMaterials : [];
  const byCode = new Map();

  list.forEach((m) => {
    const code = (m.course_code || "").trim() || "GEN";
    const key = EBB.normalizeCode(code) || "gen";
    let course = byCode.get(key);
    if (!course) {
      const id = slugifyCode(code);
      const name = EBB.courseNameFromPath(m.file_path, code);
      course = {
        id,
        code,
        name,
        department: m.department || "general",
        level: m.level && m.level !== "unknown" ? String(m.level) : "100",
        semester: "1",
        lecturer: "KB4GESA Library",
        accessCount: 0,
        description: `Materials for ${code} — ${name}.`,
        materialCount: 0,
      };
      byCode.set(key, course);
    }
    course.materialCount += 1;
    course.accessCount += m.downloads || 0;
    // Prefer a richer name when available
    const richer = EBB.courseNameFromPath(m.file_path, code);
    if (richer && richer.length > course.name.length) course.name = richer;
    if (m.department) course.department = m.department;
    if (m.level && m.level !== "unknown") course.level = String(m.level);
    m.courseId = course.id;
  });

  EBB.courses = [...byCode.values()].sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true })
  );
  EBB.materials = list.map((m) => {
    const typeMeta = EBB.getTypeMeta(m.type);
    return {
      ...m,
      topic: typeMeta ? typeMeta.name : m.type || "Material",
      live: true,
    };
  });

  // Department material counts
  EBB.departments.forEach((d) => {
    d.count = EBB.materials.filter((m) => m.department === d.id).length;
  });

  EBB.liveReady = true;
  return { courses: EBB.courses.length, materials: EBB.materials.length };
};

/* ---------- Helper accessors ---------- */
EBB.getDepartment = (id) => EBB.departments.find((d) => d.id === id);
EBB.getCourse = (id) => EBB.courses.find((c) => c.id === id);
EBB.getCourseByCode = (code) => {
  const n = EBB.normalizeCode(code);
  if (!n) return null;
  return EBB.courses.find((c) => EBB.normalizeCode(c.code) === n);
};
EBB.getMaterialsForCourse = (courseId) =>
  EBB.materials.filter((m) => m.courseId === courseId);
EBB.getTypeMeta = (typeId) => EBB.materialTypes.find((t) => t.id === typeId);

EBB.coursesForDepartment = (deptId) =>
  EBB.courses.filter((c) => c.department === deptId);

EBB.coursesForDeptLevel = (deptId, levelId) =>
  EBB.courses.filter((c) => c.department === deptId && c.level === levelId);

EBB.actualMaterialCount = (deptId) =>
  EBB.materials.filter((m) => m.department === deptId).length;

EBB.search = (query) => {
  const q = (query || "").toLowerCase().trim();
  if (!q) return { courses: [], materials: [], query: q };

  const courseHits = EBB.courses.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
  );

  const materialHits = EBB.materials.filter((m) => {
    const course = EBB.getCourse(m.courseId);
    const typeMeta = EBB.getTypeMeta(m.type);
    const hay = [
      m.topic,
      m.title,
      m.type,
      m.course_code,
      m.fileName,
      typeMeta && typeMeta.name,
      course && course.code,
      course && course.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  return { courses: courseHits, materials: materialHits, query: q };
};

EBB.recentMaterials = (n = 6) =>
  [...EBB.materials]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, n);

EBB.mostAccessedCourses = (n = 6) =>
  [...EBB.courses].sort((a, b) => b.accessCount - a.accessCount).slice(0, n);

EBB.filterMaterials = ({ type, department, level, query } = {}) => {
  let list = [...EBB.materials];
  if (type) list = list.filter((m) => m.type === type);
  if (department) list = list.filter((m) => m.department === department);
  if (level) {
    list = list.filter((m) => {
      if (m.level === level) return true;
      const c = EBB.getCourse(m.courseId);
      return c && c.level === level;
    });
  }
  if (query) {
    const q = query.toLowerCase().trim();
    list = list.filter((m) => {
      const c = EBB.getCourse(m.courseId);
      const hay = [m.topic, m.title, m.type, m.course_code, c && c.code, c && c.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  return list;
};

window.EBB = EBB;
