import type {
  Course,
  Department,
  Material,
  MaterialTypeId,
} from '@/data/mockCatalog';
import { materialTypes } from '@/data/mockCatalog';
import { getFileUrl, type FileRow } from '@/lib/files';

export type ProgrammeRow = {
  id: string;
  name: string;
  short_name?: string | null;
  code?: string | null;
  sort_order?: number | null;
};

export type MaterialRow = FileRow & {
  id: string;
  title: string;
  description?: string | null;
  course_code?: string | null;
  department?: string | null;
  level?: string | null;
  material_type?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  download_count?: number | null;
  created_at?: string | null;
  published?: boolean | null;
};

function slugifyCode(code: string) {
  return (
    String(code || 'unknown')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'unknown'
  );
}

function titleCaseWords(s: string) {
  return String(s || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function courseNameFromPath(filePath: string, fallbackCode: string) {
  const parts = String(filePath || '')
    .replace(/\\/g, '/')
    .split('/');
  const folder = parts.length >= 3 ? parts[2] : '';
  if (!folder) return fallbackCode || 'Course';
  const m = folder.match(/^[A-Za-z]+-\d{2,4}-(.+)$/);
  if (m) return titleCaseWords(m[1]);
  if (/^extras/i.test(folder) || /^semester/i.test(folder)) {
    return titleCaseWords(folder);
  }
  return titleCaseWords(folder);
}

function normalizeCode(code: string) {
  return String(code || '')
    .toLowerCase()
    .replace(/\s+/g, '');
}

function asMaterialType(raw: string | null | undefined): MaterialTypeId {
  const id = String(raw || 'shared');
  const known = materialTypes.some((t) => t.id === id);
  return (known ? id : 'shared') as MaterialTypeId;
}

function typeTopic(typeId: MaterialTypeId) {
  return materialTypes.find((t) => t.id === typeId)?.name ?? typeId;
}

const BUILTIN_DEPARTMENTS: Department[] = [
  { id: 'civil', name: 'Civil Engineering', short: 'Civil', code: 'CE', icon: '🏗', count: 0 },
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    short: 'Electrical',
    code: 'EE',
    icon: '⚡',
    count: 0,
  },
  {
    id: 'mechanical',
    name: 'Mechanical Engineering',
    short: 'Mechanical',
    code: 'ME',
    icon: '⚙',
    count: 0,
  },
  {
    id: 'computer',
    name: 'Computer Engineering',
    short: 'Computer',
    code: 'COE',
    icon: '💻',
    count: 0,
  },
  {
    id: 'chemical',
    name: 'Chemical Engineering',
    short: 'Chemical',
    code: 'CHE',
    icon: '⚗',
    count: 0,
  },
  {
    id: 'industrial',
    name: 'Industrial Engineering',
    short: 'Industrial',
    code: 'IE',
    icon: '🏭',
    count: 0,
  },
  {
    id: 'materials',
    name: 'Materials Engineering',
    short: 'Materials',
    code: 'METE',
    icon: '🔩',
    count: 0,
  },
  {
    id: 'agricultural',
    name: 'Agricultural Engineering',
    short: 'Agricultural',
    code: 'AE',
    icon: '🌾',
    count: 0,
  },
  { id: 'general', name: 'General / Shared', short: 'General', code: 'GEN', icon: '📚', count: 0 },
];

export function applyProgrammes(
  builtins: Department[],
  rows: ProgrammeRow[]
): Department[] {
  const byId = new Map<string, Department>();
  builtins.forEach((d) => byId.set(d.id, { ...d, count: 0 }));

  rows.forEach((row) => {
    const id = String(row.id || '').trim();
    if (!id) return;
    const name = String(row.name || id).trim();
    const short =
      String(row.short_name || '').trim() ||
      name.replace(/\s+Engineering$/i, '') ||
      name;
    const code = String(row.code || '').trim().toUpperCase() || 'GEN';
    const existing = byId.get(id);
    byId.set(id, {
      id,
      name,
      short,
      code: code || existing?.code || 'GEN',
      icon: existing?.icon || '📚',
      count: existing?.count || 0,
    });
  });

  return [...byId.values()];
}

export function hydrateFromLive(
  rows: MaterialRow[],
  programmes: ProgrammeRow[],
  supabaseUrl: string
): { departments: Department[]; courses: Course[]; materials: Material[] } {
  const byCode = new Map<string, Course & { accessCount: number }>();

  const materials: Material[] = rows.map((row) => {
    const code = (row.course_code || '').trim() || 'GEN';
    const key = normalizeCode(code) || 'gen';
    let course = byCode.get(key);
    if (!course) {
      const id = slugifyCode(code);
      const name = courseNameFromPath(row.file_path || '', code);
      course = {
        id,
        code,
        name,
        department: row.department || 'general',
        level: row.level && row.level !== 'unknown' ? String(row.level) : '100',
        semester: '1',
        lecturer: 'ENGINEER WITH KB Library',
        description: `Materials for ${code} — ${name}.`,
        materialCount: 0,
        accessCount: 0,
      };
      byCode.set(key, course);
    }
    course.materialCount += 1;
    course.accessCount += row.download_count || 0;
    const richer = courseNameFromPath(row.file_path || '', code);
    if (richer && richer.length > course.name.length) course.name = richer;
    if (row.department) course.department = row.department;
    if (row.level && row.level !== 'unknown') course.level = String(row.level);

    const type = asMaterialType(row.material_type);
    const url = getFileUrl(row, supabaseUrl);

    return {
      id: String(row.id),
      title: row.title,
      courseId: course.id,
      course_code: code,
      department: row.department || course.department || 'general',
      level: row.level && row.level !== 'unknown' ? String(row.level) : course.level,
      type,
      file_path: row.file_path || '',
      url: url || undefined,
      downloads: row.download_count || 0,
      topic: typeTopic(type),
    };
  });

  const courses = [...byCode.values()]
    .map(({ accessCount: _a, ...c }) => c)
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  let departments = applyProgrammes(BUILTIN_DEPARTMENTS, programmes);
  departments = departments.map((d) => ({
    ...d,
    count: materials.filter((m) => m.department === d.id).length,
  }));

  return { departments, courses, materials };
}
