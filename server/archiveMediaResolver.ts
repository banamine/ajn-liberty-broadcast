export type ResolvedMedia = {
  identifier: string;
  originalName: string;
  streamUrl: string;
  mimeType: string;
  duration?: number;
  isAvailable: boolean;
  status: "PLAYABLE" | "UNAVAILABLE";
  reason?: string;
};

export type ArchiveMediaFetch = (input: string, init?: RequestInit) => Promise<Response>;

type ArchiveFile = {
  name?: string;
  format?: string;
  mimetype?: string;
  mimeType?: string;
  length?: string | number;
  original?: string;
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;
const cache = new Map<string, { expiresAt: number; value: ResolvedMedia }>();

function cacheKey(identifier: string, requestedFile?: string): string {
  return identifier + "|" + (requestedFile || "");
}

function remember(key: string, value: ResolvedMedia): ResolvedMedia {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
  return value;
}

function fromCache(key: string): ResolvedMedia | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function normalizedName(name: string): string {
  try { return decodeURIComponent(name); } catch { return name; }
}

function extension(name: string): string {
  const match = normalizedName(name).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || "";
}

function isBrowserVideo(file: ArchiveFile): boolean {
  const name = normalizedName(String(file.name || ""));
  const format = String(file.format || "").toLowerCase();
  const ext = extension(name);
  if (!name || name.includes("_thumb") || name.includes("_meta")) return false;
  return (
    ext === "mp4" ||
    ext === "m4v" ||
    ext === "webm" ||
    format.includes("h.264") ||
    format.includes("mpeg4") ||
    format.includes("webm")
  );
}

function mediaScore(file: ArchiveFile, requestedRoot?: string): number {
  const name = normalizedName(String(file.name || ""));
  const format = String(file.format || "").toLowerCase();
  const ext = extension(name);
  let score = 0;

  if (requestedRoot && name.replace(/\.[^.]+$/, "") === requestedRoot) score += 100;
  if (requestedRoot && name.replace(/\.[^.]+$/, "").startsWith(requestedRoot + "_")) score += 70;
  if (ext === "mp4") score += 30;
  if (format.includes("h.264")) score += 25;
  if (format.includes("512kb mpeg4")) score += 20;
  if (format.includes("mpeg4")) score += 15;
  if (ext === "webm" || format.includes("webm")) score += 5;
  if (file.mimetype === "video/mp4" || file.mimeType === "video/mp4") score += 5;
  return score;
}

function buildDownloadUrl(identifier: string, fileName: string): string {
  const encoded = normalizedName(fileName)
    .split("/")
    .map(part => encodeURIComponent(part))
    .join("/");
  return "https://archive.org/download/" + encodeURIComponent(identifier) + "/" + encoded;
}

async function verifyMedia(
  url: string,
  fetcher: ArchiveMediaFetch
): Promise<{ ok: true; mimeType: string } | { ok: false; reason: string }> {
  try {
    const head = await fetcher(url, {
      method: "HEAD",
      headers: { Accept: "video/*,*/*;q=0.8" },
      signal: AbortSignal.timeout(10000)
    });
    if (head.ok) {
      return { ok: true, mimeType: head.headers.get("content-type") || "video/mp4" };
    }

    // Some Archive nodes reject HEAD while permitting ranged GETs.
    if (head.status !== 403 && head.status !== 405) {
      return { ok: false, reason: "media_http_" + head.status };
    }
  } catch {
    // Fall through to the ranged GET probe.
  }

  try {
    const probe = await fetcher(url, {
      headers: { Range: "bytes=0-1", Accept: "video/*,*/*;q=0.8" },
      signal: AbortSignal.timeout(10000)
    });
    if (probe.ok || probe.status === 206) {
      return { ok: true, mimeType: probe.headers.get("content-type") || "video/mp4" };
    }
    return { ok: false, reason: "media_http_" + probe.status };
  } catch (error: any) {
    return { ok: false, reason: error?.message || "media_probe_failed" };
  }
}

export async function resolveArchiveMedia(
  identifier: string,
  requestedFile: string | undefined,
  fetcher: ArchiveMediaFetch = fetch
): Promise<ResolvedMedia> {
  const cleanIdentifier = identifier.trim();
  const cleanRequested = requestedFile?.trim() || undefined;
  const key = cacheKey(cleanIdentifier, cleanRequested);
  const cached = fromCache(key);
  if (cached) return cached;

  if (!cleanIdentifier) {
    return remember(key, {
      identifier: "",
      originalName: cleanRequested || "",
      streamUrl: "",
      mimeType: "",
      isAvailable: false,
      status: "UNAVAILABLE",
      reason: "missing_identifier"
    });
  }

  try {
    const meta = await fetcher("https://archive.org/metadata/" + encodeURIComponent(cleanIdentifier), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000)
    });
    if (!meta.ok) {
      return remember(key, {
        identifier: cleanIdentifier,
        originalName: cleanRequested || "",
        streamUrl: "",
        mimeType: "",
        isAvailable: false,
        status: "UNAVAILABLE",
        reason: "metadata_http_" + meta.status
      });
    }

    const data: any = await meta.json();
    const files: ArchiveFile[] = Array.isArray(data?.files) ? data.files : [];
    if (!files.length) {
      return remember(key, {
        identifier: cleanIdentifier,
        originalName: cleanRequested || "",
        streamUrl: "",
        mimeType: "",
        isAvailable: false,
        status: "UNAVAILABLE",
        reason: "no_archive_files"
      });
    }

    const decodedRequested = cleanRequested ? normalizedName(cleanRequested) : undefined;
    const requestedRoot = decodedRequested?.replace(/\.[^.]+$/, "");
    const exact = decodedRequested
      ? files.find(file => normalizedName(String(file.name || "")) === decodedRequested)
      : undefined;

    const candidates = files
      .filter(isBrowserVideo)
      .filter(file => {
        if (!requestedRoot) return true;
        const root = normalizedName(String(file.name || "")).replace(/\.[^.]+$/, "");
        return root === requestedRoot || root.startsWith(requestedRoot + "_");
      })
      .sort((a, b) => mediaScore(b, requestedRoot) - mediaScore(a, requestedRoot));

    // If the requested file itself is browser-compatible, prefer that exact metadata file.
    const ordered = exact && isBrowserVideo(exact)
      ? [exact, ...candidates.filter(file => file !== exact)]
      : candidates;

    if (!ordered.length) {
      return remember(key, {
        identifier: cleanIdentifier,
        originalName: String(exact?.name || cleanRequested || ""),
        streamUrl: "",
        mimeType: "",
        isAvailable: false,
        status: "UNAVAILABLE",
        reason: "no_browser_compatible_video"
      });
    }

    for (const file of ordered) {
      const fileName = String(file.name || "");
      const streamUrl = buildDownloadUrl(cleanIdentifier, fileName);
      const verified = await verifyMedia(streamUrl, fetcher);
      if (!verified.ok) continue;

      const rawLength = Number(file.length);
      return remember(key, {
        identifier: cleanIdentifier,
        originalName: fileName,
        streamUrl,
        mimeType: verified.mimeType || String(file.mimetype || file.mimeType || "video/mp4"),
        duration: Number.isFinite(rawLength) && rawLength > 0 ? rawLength : undefined,
        isAvailable: true,
        status: "PLAYABLE"
      });
    }

    return remember(key, {
      identifier: cleanIdentifier,
      originalName: String(ordered[0]?.name || cleanRequested || ""),
      streamUrl: "",
      mimeType: "",
      isAvailable: false,
      status: "UNAVAILABLE",
      reason: "media_unverified"
    });
  } catch (error: any) {
    return remember(key, {
      identifier: cleanIdentifier,
      originalName: cleanRequested || "",
      streamUrl: "",
      mimeType: "",
      isAvailable: false,
      status: "UNAVAILABLE",
      reason: error?.message || "archive_resolution_failed"
    });
  }
}

export function clearArchiveMediaCache(): void {
  cache.clear();
}
