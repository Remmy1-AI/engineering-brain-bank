import { getSupabase, readSupabasePublicConfig } from '@/lib/supabase';
import {
  hydrateFromLive,
  type MaterialRow,
  type ProgrammeRow,
} from '@/lib/hydrateCatalog';
import type { Course, Department, Material } from '@/data/mockCatalog';

const PAGE = 1000;

async function fetchAllMaterials(): Promise<MaterialRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const out: MaterialRow[] = [];
  for (let from = 0; from < 20000; from += PAGE) {
    const to = from + PAGE - 1;
    const { data, error } = await sb
      .from('materials')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    const batch = (data || []) as MaterialRow[];
    out.push(...batch);
    if (batch.length < PAGE) break;
  }
  return out;
}

async function fetchProgrammes(): Promise<ProgrammeRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('programmes')
    .select('id,name,short_name,code,sort_order')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return (data || []) as ProgrammeRow[];
}

export type LiveCatalog = {
  departments: Department[];
  courses: Course[];
  materials: Material[];
  materialCount: number;
};

/** Load published catalog via anon key. Throws on network/API errors. */
export async function fetchLiveCatalog(): Promise<LiveCatalog> {
  const { url } = readSupabasePublicConfig();
  const [rows, programmes] = await Promise.all([
    fetchAllMaterials(),
    fetchProgrammes(),
  ]);
  const hydrated = hydrateFromLive(rows, programmes, url);
  return {
    ...hydrated,
    materialCount: hydrated.materials.length,
  };
}
