import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  courses as mockCourses,
  departments as mockDepartments,
  getMaterial as mockGetMaterial,
  getTypeMeta,
  levels,
  materials as mockMaterials,
  materialTypes,
  mockActivity,
  type Course,
  type Department,
  type Material,
} from '@/data/mockCatalog';
import { fetchLiveCatalog } from '@/lib/fetchCatalog';
import { isSupabaseConfigured } from '@/lib/supabase';

type CatalogSource = 'mock' | 'live';

type CatalogValue = {
  ready: boolean;
  source: CatalogSource;
  error: string | null;
  departments: Department[];
  courses: Course[];
  materials: Material[];
  levels: typeof levels;
  materialTypes: typeof materialTypes;
  getDepartment: (id: string) => Department | undefined;
  getCoursesByDepartment: (deptId: string) => Course[];
  getCourse: (id: string) => Course | undefined;
  getMaterialsByCourse: (courseId: string) => Material[];
  getMaterial: (id: string) => Material | undefined;
  getTypeMeta: typeof getTypeMeta;
  searchCatalog: (query: string) => {
    courses: Course[];
    materials: Material[];
  };
  recentlyAdded: Material[];
  trending: {
    id: string;
    material: Material;
    when: string;
  }[];
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<CatalogValue | null>(null);

function buildHelpers(
  departments: Department[],
  courses: Course[],
  materials: Material[]
) {
  const getDepartment = (id: string) => departments.find((d) => d.id === id);
  const getCoursesByDepartment = (deptId: string) =>
    courses.filter((c) => c.department === deptId);
  const getCourse = (id: string) => courses.find((c) => c.id === id);
  const getMaterialsByCourse = (courseId: string) =>
    materials.filter((m) => m.courseId === courseId);
  const getMaterial = (id: string) => materials.find((m) => m.id === id);
  const searchCatalog = (query: string) => {
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
  };
  const recentlyAdded = [...materials]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 6);

  return {
    getDepartment,
    getCoursesByDepartment,
    getCourse,
    getMaterialsByCourse,
    getMaterial,
    searchCatalog,
    recentlyAdded,
  };
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [source, setSource] = useState<CatalogSource>('mock');
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState(mockDepartments);
  const [courses, setCourses] = useState(mockCourses);
  const [materials, setMaterials] = useState(mockMaterials);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSource('mock');
      setDepartments(mockDepartments);
      setCourses(mockCourses);
      setMaterials(mockMaterials);
      setError(null);
      setReady(true);
      return;
    }

    try {
      const live = await fetchLiveCatalog();
      if (live.materialCount === 0) {
        setSource('mock');
        setError('Live catalog returned 0 materials — showing mock.');
      } else {
        setDepartments(live.departments);
        setCourses(live.courses);
        setMaterials(live.materials);
        setSource('live');
        setError(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Catalog load failed';
      setError(msg);
      setSource('mock');
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const helpers = useMemo(
    () => buildHelpers(departments, courses, materials),
    [departments, courses, materials]
  );

  const trending = useMemo(() => {
    if (source === 'live') {
      return helpers.recentlyAdded.slice(0, 8).map((m, i) => ({
        id: `live-${m.id}`,
        material: m,
        when: i === 0 ? 'Popular' : `${m.downloads} opens`,
      }));
    }
    const seen = new Set<string>();
    const rows: CatalogValue['trending'] = [];
    for (const a of mockActivity) {
      if (seen.has(a.materialId)) continue;
      const m = mockGetMaterial(a.materialId);
      if (!m) continue;
      seen.add(a.materialId);
      rows.push({ id: a.id, material: m, when: a.when });
    }
    return rows;
  }, [source, helpers.recentlyAdded]);

  const value = useMemo<CatalogValue>(
    () => ({
      ready,
      source,
      error,
      departments,
      courses,
      materials,
      levels,
      materialTypes,
      getDepartment: helpers.getDepartment,
      getCoursesByDepartment: helpers.getCoursesByDepartment,
      getCourse: helpers.getCourse,
      getMaterialsByCourse: helpers.getMaterialsByCourse,
      getMaterial: helpers.getMaterial,
      getTypeMeta,
      searchCatalog: helpers.searchCatalog,
      recentlyAdded: helpers.recentlyAdded,
      trending,
      refresh,
    }),
    [ready, source, error, departments, courses, materials, helpers, trending, refresh]
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
