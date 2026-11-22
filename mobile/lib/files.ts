/** Resolve open/download URLs the same way the web EBBApi helpers do. */

const DEFAULT_GITHUB_RAW =
  'https://raw.githubusercontent.com/Remmy1-AI/engineering-brain-bank/main/';

function encodeGithubPath(path: string) {
  return String(path || '')
    .replace(/^\/+/, '')
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}

export type FileRow = {
  file_path?: string | null;
  file_url?: string | null;
  external_url?: string | null;
  download_url?: string | null;
  source?: string | null;
};

export function getFileUrl(
  rowOrPath: FileRow | string | null | undefined,
  supabaseUrl?: string
): string {
  if (!rowOrPath) return '';

  if (typeof rowOrPath === 'string') {
    const p = rowOrPath;
    if (/^https?:\/\//i.test(p)) return p;
    if (p.startsWith('materials/')) {
      return DEFAULT_GITHUB_RAW.replace(/\/?$/, '/') + encodeGithubPath(p);
    }
    if (supabaseUrl) {
      const base = supabaseUrl.replace(/\/$/, '');
      return `${base}/storage/v1/object/public/materials/${p.replace(/^\//, '')}`;
    }
    return '';
  }

  const row = rowOrPath;
  if (row.file_url) return row.file_url;
  if (row.external_url) return row.external_url;
  if (row.download_url) return row.download_url;

  const path = row.file_path || '';
  const source =
    row.source || (path.startsWith('materials/') ? 'github' : 'storage');

  if (source === 'github' || path.startsWith('materials/')) {
    return DEFAULT_GITHUB_RAW.replace(/\/?$/, '/') + encodeGithubPath(path);
  }

  if (supabaseUrl && path) {
    const base = supabaseUrl.replace(/\/$/, '');
    return `${base}/storage/v1/object/public/materials/${path.replace(/^\//, '')}`;
  }

  return '';
}
