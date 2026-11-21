/** Mock catalog shaped like EBB departments / levels / materialTypes (js/data.js). */

export type MaterialTypeId =
  | 'slides'
  | 'notes'
  | 'past-questions'
  | 'tutorials'
  | 'videos'
  | 'shared';

export type Department = {
  id: string;
  name: string;
  short: string;
  code: string;
  icon: string;
  count: number;
};

export type Level = {
  id: string;
  name: string;
  year: number;
};

export type MaterialType = {
  id: MaterialTypeId;
  name: string;
  icon: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
  department: string;
  level: string;
  semester: string;
  lecturer: string;
  description: string;
  materialCount: number;
};

export type Material = {
  id: string;
  title: string;
  courseId: string;
  course_code: string;
  department: string;
  level: string;
  type: MaterialTypeId;
  file_path: string;
  url?: string;
  downloads: number;
  topic: string;
};

export const departments: Department[] = [
  { id: 'civil', name: 'Civil Engineering', short: 'Civil', code: 'CE', icon: '🏗', count: 4 },
  { id: 'electrical', name: 'Electrical Engineering', short: 'Electrical', code: 'EE', icon: '⚡', count: 3 },
  { id: 'mechanical', name: 'Mechanical Engineering', short: 'Mechanical', code: 'ME', icon: '⚙', count: 6 },
  { id: 'computer', name: 'Computer Engineering', short: 'Computer', code: 'COE', icon: '💻', count: 4 },
  { id: 'chemical', name: 'Chemical Engineering', short: 'Chemical', code: 'CHE', icon: '⚗', count: 2 },
  { id: 'industrial', name: 'Industrial Engineering', short: 'Industrial', code: 'IE', icon: '🏭', count: 2 },
  { id: 'materials', name: 'Materials Engineering', short: 'Materials', code: 'METE', icon: '🔩', count: 2 },
  { id: 'agricultural', name: 'Agricultural Engineering', short: 'Agricultural', code: 'AE', icon: '🌾', count: 2 },
  { id: 'general', name: 'General / Shared', short: 'General', code: 'GEN', icon: '📚', count: 3 },
];

export const levels: Level[] = [
  { id: '100', name: 'Level 100', year: 1 },
  { id: '200', name: 'Level 200', year: 2 },
  { id: '300', name: 'Level 300', year: 3 },
  { id: '400', name: 'Level 400', year: 4 },
];

export const materialTypes: MaterialType[] = [
  { id: 'slides', name: 'Course Slides', icon: '📊' },
  { id: 'notes', name: 'Lecture Notes', icon: '📝' },
  { id: 'past-questions', name: 'Past Questions', icon: '📋' },
  { id: 'tutorials', name: 'Tutorials', icon: '🧮' },
  { id: 'videos', name: 'Videos', icon: '🎬' },
  { id: 'shared', name: 'Shared by Students', icon: '🤝' },
];

export const courses: Course[] = [
  {
    id: 'me-255',
    code: 'ME 255',
    name: 'Strength of Materials I',
    department: 'mechanical',
    level: '200',
    semester: '1',
    lecturer: 'ENGINEER WITH KB Library',
    description: 'Stress, strain, torsion, and bending for Level 200 Mechanical.',
    materialCount: 4,
  },
  {
    id: 'me-251',
    code: 'ME 251',
    name: 'Fluid Mechanics I',
    department: 'mechanical',
    level: '200',
    semester: '1',
    lecturer: 'ENGINEER WITH KB Library',
    description: 'Fluid properties, statics, and introductory flow.',
    materialCount: 2,
  },
  {
    id: 'math-251',
    code: 'MATH 251',
    name: 'Differential Equations',
    department: 'general',
    level: '200',
    semester: '1',
    lecturer: 'ENGINEER WITH KB Library',
    description: 'ODEs for engineering programmes.',
    materialCount: 3,
  },
  {
    id: 'ce-151',
    code: 'CE 151',
    name: 'Engineering Drawing',
    department: 'civil',
    level: '100',
    semester: '1',
    lecturer: 'ENGINEER WITH KB Library',
    description: 'Orthographic projection and drafting basics.',
    materialCount: 2,
  },
  {
    id: 'ee-171',
    code: 'EE 171',
    name: 'Basic Electronics',
    department: 'electrical',
    level: '100',
    semester: '2',
    lecturer: 'ENGINEER WITH KB Library',
    description: 'Circuits, diodes, and intro electronics.',
    materialCount: 2,
  },
  {
    id: 'coe-281',
    code: 'COE 281',
    name: 'Data Structures',
    department: 'computer',
    level: '200',
    semester: '1',
    lecturer: 'ENGINEER WITH KB Library',
    description: 'Arrays, trees, graphs for Computer Engineering.',
    materialCount: 3,
  },
  {
    id: 'che-251',
    code: 'CHE 251',
    name: 'Chemical Process Calculations',
    department: 'chemical',
    level: '200',
    semester: '1',
    lecturer: 'ENGINEER WITH KB Library',
    description: 'Mass and energy balances.',
    materialCount: 2,
  },
  {
    id: 'ae-196',
    code: 'AE 196',
    name: 'Engineering Workshop Practice',
    department: 'agricultural',
    level: '100',
    semester: '1',
    lecturer: 'ENGINEER WITH KB Library',
    description: 'Workshop safety and practice sessions.',
    materialCount: 2,
  },
];

const SITE = 'https://boye.study';

export const materials: Material[] = [
  {
    id: 'm1',
    title: 'Lecture 1 — Introduction to Stress',
    courseId: 'me-255',
    course_code: 'ME 255',
    department: 'mechanical',
    level: '200',
    type: 'slides',
    file_path: 'materials/year-2/ME-255-Strength-of-Materials-I/slides/Lecture 1.pptx',
    url: `${SITE}/course.html?id=me-255`,
    downloads: 42,
    topic: 'Course Slides',
  },
  {
    id: 'm2',
    title: 'Strength of Materials (notes)',
    courseId: 'me-255',
    course_code: 'ME 255',
    department: 'mechanical',
    level: '200',
    type: 'notes',
    file_path: 'materials/year-2/ME-255-Strength-of-Materials-I/notes/Strength of Materials.pdf',
    url: `${SITE}/course.html?id=me-255`,
    downloads: 88,
    topic: 'Lecture Notes',
  },
  {
    id: 'm3',
    title: 'Strength sample questions',
    courseId: 'me-255',
    course_code: 'ME 255',
    department: 'mechanical',
    level: '200',
    type: 'past-questions',
    file_path: 'materials/year-2/ME-255-Strength-of-Materials-I/past-questions/strength sample questions.pdf',
    url: `${SITE}/course.html?id=me-255`,
    downloads: 120,
    topic: 'Past Questions',
  },
  {
    id: 'm4',
    title: 'Lecture 2 — Stress and Strain',
    courseId: 'me-255',
    course_code: 'ME 255',
    department: 'mechanical',
    level: '200',
    type: 'notes',
    file_path: 'materials/year-2/ME-255-Strength-of-Materials-I/notes/Lecture 2 - Stress and Strain.pdf',
    url: `${SITE}/course.html?id=me-255`,
    downloads: 55,
    topic: 'Lecture Notes',
  },
  {
    id: 'm5',
    title: 'Fluid Mechanics lecture 3',
    courseId: 'me-251',
    course_code: 'ME 251',
    department: 'mechanical',
    level: '200',
    type: 'notes',
    file_path: 'materials/year-2/ME-251-Fluid-Mechanics-I/notes/Fluid Mechanics lecture 3.pdf',
    url: `${SITE}/course.html?id=me-251`,
    downloads: 33,
    topic: 'Lecture Notes',
  },
  {
    id: 'm6',
    title: 'ME 251 Introduction — Properties',
    courseId: 'me-251',
    course_code: 'ME 251',
    department: 'mechanical',
    level: '200',
    type: 'slides',
    file_path: 'materials/year-2/ME-251-Fluid-Mechanics-I/notes/ME 251 Introduction to Fluid_ Intro_Properties.pdf',
    url: `${SITE}/course.html?id=me-251`,
    downloads: 27,
    topic: 'Course Slides',
  },
  {
    id: 'm7',
    title: 'Differential Equations Complete',
    courseId: 'math-251',
    course_code: 'MATH 251',
    department: 'general',
    level: '200',
    type: 'notes',
    file_path: 'materials/year-2/MATH-251-Differential-Equations/notes/Differential Equations Complete - Paul Dawkins.pdf',
    url: `${SITE}/course.html?id=math-251`,
    downloads: 150,
    topic: 'Lecture Notes',
  },
  {
    id: 'm8',
    title: 'Maths pasco',
    courseId: 'math-251',
    course_code: 'MATH 251',
    department: 'general',
    level: '200',
    type: 'past-questions',
    file_path: 'materials/year-2/MATH-251-Differential-Equations/past-questions/maths pasco.pdf',
    url: `${SITE}/course.html?id=math-251`,
    downloads: 200,
    topic: 'Past Questions',
  },
  {
    id: 'm9',
    title: 'Tutorial list (videos)',
    courseId: 'math-251',
    course_code: 'MATH 251',
    department: 'general',
    level: '200',
    type: 'videos',
    file_path: 'materials/year-2/MATH-251-Differential-Equations/videos/DiffereNtial eqn Tutorial list.txt',
    url: `${SITE}/course.html?id=math-251`,
    downloads: 19,
    topic: 'Videos',
  },
  {
    id: 'm10',
    title: 'Drawing basics slides',
    courseId: 'ce-151',
    course_code: 'CE 151',
    department: 'civil',
    level: '100',
    type: 'slides',
    file_path: 'materials/year-1/CE-151-Engineering-Drawing/slides/intro.pdf',
    url: SITE,
    downloads: 14,
    topic: 'Course Slides',
  },
  {
    id: 'm11',
    title: 'Orthographic tutorial',
    courseId: 'ce-151',
    course_code: 'CE 151',
    department: 'civil',
    level: '100',
    type: 'tutorials',
    file_path: 'materials/year-1/CE-151-Engineering-Drawing/tutorials/ortho.pdf',
    url: SITE,
    downloads: 9,
    topic: 'Tutorials',
  },
  {
    id: 'm12',
    title: 'Diodes & rectifiers',
    courseId: 'ee-171',
    course_code: 'EE 171',
    department: 'electrical',
    level: '100',
    type: 'notes',
    file_path: 'materials/year-1/EE-171-Basic-Electronics/notes/diodes.pdf',
    url: SITE,
    downloads: 40,
    topic: 'Lecture Notes',
  },
  {
    id: 'm13',
    title: 'EE 171 mid-sem pasco',
    courseId: 'ee-171',
    course_code: 'EE 171',
    department: 'electrical',
    level: '100',
    type: 'past-questions',
    file_path: 'materials/year-1/EE-171-Basic-Electronics/past-questions/midsem.pdf',
    url: SITE,
    downloads: 61,
    topic: 'Past Questions',
  },
  {
    id: 'm14',
    title: 'Trees & graphs slides',
    courseId: 'coe-281',
    course_code: 'COE 281',
    department: 'computer',
    level: '200',
    type: 'slides',
    file_path: 'materials/year-2/COE-281-Data-Structures/slides/trees.pdf',
    url: SITE,
    downloads: 72,
    topic: 'Course Slides',
  },
  {
    id: 'm15',
    title: 'Peer notes — heaps',
    courseId: 'coe-281',
    course_code: 'COE 281',
    department: 'computer',
    level: '200',
    type: 'shared',
    file_path: 'materials/year-2/COE-281-Data-Structures/shared/heaps.md',
    url: SITE,
    downloads: 22,
    topic: 'Shared by Students',
  },
  {
    id: 'm16',
    title: 'Lab tutorial — linked lists',
    courseId: 'coe-281',
    course_code: 'COE 281',
    department: 'computer',
    level: '200',
    type: 'tutorials',
    file_path: 'materials/year-2/COE-281-Data-Structures/tutorials/linked-lists.pdf',
    url: SITE,
    downloads: 35,
    topic: 'Tutorials',
  },
  {
    id: 'm17',
    title: 'Mass balance examples',
    courseId: 'che-251',
    course_code: 'CHE 251',
    department: 'chemical',
    level: '200',
    type: 'notes',
    file_path: 'materials/year-2/CHE-251-Process-Calculations/notes/mass-balance.pdf',
    url: SITE,
    downloads: 18,
    topic: 'Lecture Notes',
  },
  {
    id: 'm18',
    title: 'CHE 251 past questions',
    courseId: 'che-251',
    course_code: 'CHE 251',
    department: 'chemical',
    level: '200',
    type: 'past-questions',
    file_path: 'materials/year-2/CHE-251-Process-Calculations/past-questions/pasco.pdf',
    url: SITE,
    downloads: 29,
    topic: 'Past Questions',
  },
  {
    id: 'm19',
    title: 'Workshop safety slides',
    courseId: 'ae-196',
    course_code: 'AE 196',
    department: 'agricultural',
    level: '100',
    type: 'slides',
    file_path: 'materials/year-1/AE-196-Engineering-Workshop-Practice/slides/safety.pdf',
    url: SITE,
    downloads: 11,
    topic: 'Course Slides',
  },
  {
    id: 'm20',
    title: 'Workshop practice notes',
    courseId: 'ae-196',
    course_code: 'AE 196',
    department: 'agricultural',
    level: '100',
    type: 'notes',
    file_path: 'materials/year-1/AE-196-Engineering-Workshop-Practice/notes/practice.pdf',
    url: SITE,
    downloads: 8,
    topic: 'Lecture Notes',
  },
];

export function getDepartment(id: string) {
  return departments.find((d) => d.id === id);
}

export function getCoursesByDepartment(deptId: string) {
  return courses.filter((c) => c.department === deptId);
}

export function getCourse(id: string) {
  return courses.find((c) => c.id === id);
}

export function getMaterialsByCourse(courseId: string) {
  return materials.filter((m) => m.courseId === courseId);
}

export function getMaterial(id: string) {
  return materials.find((m) => m.id === id);
}

export function getTypeMeta(typeId: string) {
  return materialTypes.find((t) => t.id === typeId);
}

export function searchCatalog(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { courses: [] as Course[], materials: [] as Material[] };
  return {
    courses: courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
    ),
    materials: materials.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.course_code.toLowerCase().includes(q) ||
        m.topic.toLowerCase().includes(q)
    ),
  };
}

/** Recently added — mock order by downloads as a stand-in */
export const recentlyAdded = [...materials].sort((a, b) => b.downloads - a.downloads).slice(0, 6);

export type DownloadRecord = {
  materialId: string;
  savedAt: string;
};

export const mockDownloadsForUser: DownloadRecord[] = [
  { materialId: 'm2', savedAt: '2026-11-18T10:00:00Z' },
  { materialId: 'm7', savedAt: '2026-11-17T14:30:00Z' },
  { materialId: 'm8', savedAt: '2026-11-16T09:15:00Z' },
];

export type ActivityItem = {
  id: string;
  who: string;
  action: 'opened' | 'read';
  materialId: string;
  when: string;
};

/** Mock “what people have been reading” feed for Home. */
export const mockActivity: ActivityItem[] = [
  { id: 'a1', who: 'Ama K.', action: 'opened', materialId: 'm8', when: '12 min ago' },
  { id: 'a2', who: 'Kwesi M.', action: 'read', materialId: 'm2', when: '34 min ago' },
  { id: 'a3', who: 'Yaw B.', action: 'opened', materialId: 'm14', when: '1 hr ago' },
  { id: 'a4', who: 'Efua S.', action: 'read', materialId: 'm7', when: '2 hr ago' },
  { id: 'a5', who: 'Kojo A.', action: 'opened', materialId: 'm3', when: '3 hr ago' },
  { id: 'a6', who: 'Abena T.', action: 'read', materialId: 'm12', when: '5 hr ago' },
  { id: 'a7', who: 'Nana P.', action: 'opened', materialId: 'm5', when: 'Yesterday' },
  { id: 'a8', who: 'Adwoa R.', action: 'read', materialId: 'm15', when: 'Yesterday' },
];

