/* Engineering Brain Bank — Supabase client helpers (vanilla, no bundler) */
(function () {
  "use strict";

  const ALLOWED_EXT = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".txt", ".md"];
  const ALLOWED_MIME = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "text/x-markdown",
  ];

  let _client = null;
  let _createClient = null;

  function cfg() {
    return window.EBB_SUPABASE || { url: "", anonKey: "" };
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
    if (!file.type) return true; // some browsers omit MIME for md/txt
    return ALLOWED_MIME.includes(file.type) || file.type === "";
  }

  function acceptAttr() {
    return ALLOWED_EXT.join(",");
  }

  async function listPublishedMaterials({ limit = 200 } = {}) {
    const sb = await getClient();
    if (!sb) return [];
    const { data, error } = await sb
      .from("materials")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.warn("[EBB API] listPublishedMaterials:", error.message);
      return [];
    }
    return data || [];
  }

  async function listAllMaterials() {
    const sb = await getClient();
    if (!sb) return [];
    const { data, error } = await sb
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  function getPublicFileUrl(path) {
    if (!path || !isConfigured()) return "";
    const c = cfg();
    const base = String(c.url).replace(/\/$/, "");
    return `${base}/storage/v1/object/public/materials/${path.replace(/^\//, "")}`;
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

  /** Map a Supabase materials row to the mock EBB.materials shape used by the UI. */
  function toUiMaterial(row) {
    const course = window.EBB && row.course_code
      ? EBB.getCourseByCode(row.course_code)
      : null;
    const sizeLabel = row.file_size
      ? (row.file_size >= 1048576
          ? (row.file_size / 1048576).toFixed(1) + " MB"
          : Math.max(1, Math.round(row.file_size / 1024)) + " KB")
      : "";
    return {
      id: row.id,
      live: true,
      courseId: course ? course.id : null,
      course_code: row.course_code || "",
      type: row.material_type || "shared",
      topic: row.description || row.title || "Material",
      title: row.title,
      lecturer: "",
      uploadedBy: "KB4GESA Admin",
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
    isAllowedFile,
    acceptAttr,
    ALLOWED_EXT,
    ALLOWED_MIME,
    toUiMaterial,
  };
})();
