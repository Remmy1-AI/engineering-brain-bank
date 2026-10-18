/* Engineering Brain Bank — Supabase client helpers (vanilla, no bundler)
   Hybrid: catalog in Supabase; file bytes on GitHub materials/ (or Storage). */
(function () {
  "use strict";

  const ALLOWED_EXT = [
    ".pdf", ".ppt", ".pptx", ".doc", ".docx", ".txt", ".md",
    ".mp4", ".webm", ".mov",
    ".jpg", ".jpeg", ".png", ".gif", ".webp",
    ".xlsx", ".csv", ".zip", ".rtf",
  ];
  const ALLOWED_MIME = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "text/x-markdown",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/zip",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/rtf",
    "text/rtf",
  ];

  const DEFAULT_GITHUB_RAW =
    "https://raw.githubusercontent.com/Remmy1-AI/engineering-brain-bank/main/";

  let _client = null;
  let _createClient = null;

  function cfg() {
    return window.EBB_SUPABASE || { url: "", anonKey: "" };
  }

  function filesCfg() {
    const f = window.EBB_FILES || {};
    return {
      githubRawBase: f.githubRawBase || DEFAULT_GITHUB_RAW,
    };
  }

  /** raw.githubusercontent.com → media.githubusercontent.com (actual Git LFS bytes). */
  function rawToMediaGithubUrl(url) {
    const u = String(url || "");
    if (!u.includes("://raw.githubusercontent.com/")) return u;
    return u.replace(
      "://raw.githubusercontent.com/",
      "://media.githubusercontent.com/media/"
    );
  }

  function looksLikeGitLfsPointer(bytesOrText) {
    const head =
      typeof bytesOrText === "string"
        ? bytesOrText.slice(0, 80)
        : new TextDecoder("utf-8", { fatal: false }).decode(
            bytesOrText.slice ? bytesOrText.slice(0, 80) : bytesOrText
          );
    return head.indexOf("version https://git-lfs.github.com/spec/v1") === 0;
  }

  /**
   * GitHub raw serves LFS pointer text (~130B), not the real file.
   * Probe the start of the object and upgrade to the media host when needed.
   */
  async function resolveGithubContentUrl(url) {
    const u = String(url || "");
    if (!u.includes("://raw.githubusercontent.com/")) return u;
    try {
      const res = await fetch(u, {
        method: "GET",
        headers: { Range: "bytes=0-200" },
        mode: "cors",
        cache: "no-store",
      });
      if (!res.ok && res.status !== 206) return u;
      const buf = await res.arrayBuffer();
      if (looksLikeGitLfsPointer(buf)) return rawToMediaGithubUrl(u);
    } catch (err) {
      console.warn("[EBB API] LFS probe:", err.message || err);
    }
    return u;
  }

  function isConfigured() {
    const c = cfg();
    return !!(c.url && c.anonKey && String(c.url).includes("supabase"));
  }

  async function loadSdk() {
    if (_createClient) return _createClient;
    const mod = await import("https://esm.sh/@supabase/supabase-js@2.49.1");
    _createClient = mod.createClient;
    return _createClient;
  }

  async function getClient() {
    if (!isConfigured()) return null;
    if (_client) return _client;
    const createClient = await loadSdk();
    const c = cfg();
    _client = createClient(c.url, c.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "ebb-admin-auth",
      },
    });
    return _client;
  }

  function isAllowedFile(file) {
    if (!file || !file.name) return false;
    const name = file.name.toLowerCase();
    const extOk = ALLOWED_EXT.some((e) => name.endsWith(e));
    if (!extOk) return false;
    if (!file.type) return true;
    return ALLOWED_MIME.includes(file.type) || file.type === "";
  }

  function acceptAttr() {
    return ALLOWED_EXT.join(",");
  }

  function encodeGithubPath(path) {
    return String(path || "")
      .replace(/^\/+/, "")
      .split("/")
      .map((seg) => encodeURIComponent(seg))
      .join("/");
  }

  /** Resolve open/watch URL for a materials row or path string. */
  function getFileUrl(rowOrPath) {
    if (!rowOrPath) return "";
    if (typeof rowOrPath === "string") {
      const p = rowOrPath;
      if (/^https?:\/\//i.test(p)) return p;
      if (p.startsWith("materials/")) {
        return filesCfg().githubRawBase.replace(/\/?$/, "/") + encodeGithubPath(p);
      }
      if (isConfigured()) {
        const c = cfg();
        const base = String(c.url).replace(/\/$/, "");
        return `${base}/storage/v1/object/public/materials/${p.replace(/^\//, "")}`;
      }
      return "";
    }

    const row = rowOrPath;
    if (row.file_url) return row.file_url;
    if (row.external_url) return row.external_url;
    const source = row.source || (String(row.file_path || "").startsWith("materials/") ? "github" : "storage");
    const path = row.file_path || "";
    if (source === "github" || path.startsWith("materials/")) {
      return filesCfg().githubRawBase.replace(/\/?$/, "/") + encodeGithubPath(path);
    }
    return getPublicFileUrl(path);
  }

  /** Resolve download URL (Drive uc=download, GitHub raw, or Storage). */
  function getDownloadUrl(row) {
    if (!row) return "";
    if (row.download_url) return row.download_url;
    return getFileUrl(row);
  }

  function getPublicFileUrl(path) {
    if (!path || !isConfigured()) return "";
    if (/^https?:\/\//i.test(path)) return path;
    if (String(path).startsWith("materials/")) return getFileUrl(path);
    const c = cfg();
    const base = String(c.url).replace(/\/$/, "");
    return `${base}/storage/v1/object/public/materials/${path.replace(/^\//, "")}`;
  }

  function isVideoMaterial(m) {
    const mime = (m.mime_type || m.mimeType || "").toLowerCase();
    if (mime.startsWith("video/")) return true;
    const name = (m.fileName || m.file_name || "").toLowerCase();
    if (/\.(mp4|webm|mov)$/.test(name)) return true;
    return m.type === "videos" || m.material_type === "videos";
  }

  function isImageMaterial(m) {
    const mime = (m.mime_type || m.mimeType || "").toLowerCase();
    if (mime.startsWith("image/")) return true;
    const name = (m.fileName || m.file_name || "").toLowerCase();
    return /\.(jpe?g|png|gif|webp)$/.test(name);
  }

  /** Page through PostgREST (server max-rows is often 1000). */
  async function fetchAllRows(buildQuery, { pageSize = 1000, maxRows = 20000 } = {}) {
    const out = [];
    for (let from = 0; from < maxRows; from += pageSize) {
      const to = from + pageSize - 1;
      const { data, error } = await buildQuery().range(from, to);
      if (error) throw error;
      const batch = data || [];
      out.push(...batch);
      if (batch.length < pageSize) break;
    }
    return out;
  }

  async function listPublishedMaterials() {
    const sb = await getClient();
    if (!sb) return [];
    try {
      return await fetchAllRows(() =>
        sb
          .from("materials")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })
      );
    } catch (error) {
      console.warn("[EBB API] listPublishedMaterials:", error.message || error);
      return [];
    }
  }

  async function listAllMaterials() {
    const sb = await getClient();
    if (!sb) return [];
    return fetchAllRows(() =>
      sb.from("materials").select("*").order("created_at", { ascending: false })
    );
  }

  async function recordPageViewOncePerSession(path) {
    if (!isConfigured()) return;
    const key = "ebb-pv:" + (path || "/");
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch (_) { /* private mode */ }
    try {
      const sb = await getClient();
      if (!sb) return;
      await sb.rpc("record_page_view", { p_path: path || window.location.pathname || "/" });
    } catch (err) {
      console.warn("[EBB API] recordPageView:", err.message || err);
    }
  }

  async function incrementDownload(id) {
    if (!id || !isConfigured()) return;
    try {
      const sb = await getClient();
      if (!sb) return;
      await sb.rpc("increment_download", { p_id: id });
    } catch (err) {
      console.warn("[EBB API] incrementDownload:", err.message || err);
    }
  }

  async function incrementShare(id) {
    if (!id || !isConfigured()) return;
    try {
      const sb = await getClient();
      if (!sb) return;
      await sb.rpc("increment_share", { p_id: id });
    } catch (err) {
      console.warn("[EBB API] incrementShare:", err.message || err);
    }
  }

  /** Map a Supabase materials row to the UI material shape. */
  function toUiMaterial(row) {
    const course = window.EBB && row.course_code
      ? EBB.getCourseByCode(row.course_code)
      : null;
    const sizeLabel = row.file_size
      ? (row.file_size >= 1048576
          ? (row.file_size / 1048576).toFixed(1) + " MB"
          : Math.max(1, Math.round(row.file_size / 1024)) + " KB")
      : "";
    const url = getFileUrl(row);
    return {
      id: row.id,
      live: true,
      courseId: course ? course.id : null,
      course_code: row.course_code || "",
      type: row.material_type || "shared",
      topic: row.description || row.title || "Material",
      title: row.title,
      lecturer: "",
      uploadedBy: "KB4GESA",
      date: (row.created_at || "").slice(0, 10),
      downloads: row.download_count || 0,
      shares: row.share_count || 0,
      fileName: row.file_name,
      size: sizeLabel,
      file_path: row.file_path,
      mime_type: row.mime_type,
      department: row.department,
      level: row.level,
      published: row.published,
      description: row.description || "",
      source: row.source || "storage",
      external_url: row.external_url || "",
      download_url: row.download_url || url,
      file_url: url,
    };
  }

  window.EBBApi = {
    isConfigured,
    getClient,
    listPublishedMaterials,
    listAllMaterials,
    recordPageViewOncePerSession,
    incrementDownload,
    incrementShare,
    getPublicFileUrl,
    getFileUrl,
    getDownloadUrl,
    resolveGithubContentUrl,
    rawToMediaGithubUrl,
    looksLikeGitLfsPointer,
    isVideoMaterial,
    isImageMaterial,
    isAllowedFile,
    acceptAttr,
    ALLOWED_EXT,
    ALLOWED_MIME,
    toUiMaterial,
  };
})();
