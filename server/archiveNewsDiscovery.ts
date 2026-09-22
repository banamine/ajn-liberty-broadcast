export type ArchiveNewsCandidate = {
  identifier: string;
  title: string;
  airTime: number;
  publicdate?: string;
  mediaUrl?: string;
};

export type ArchiveFetch = (input: string, init?: RequestInit) => Promise<Response>;

export const NEWS_FRESHNESS_MS = 48 * 60 * 60 * 1000;
export const PAGE_ROWS = 50;
export const MAX_PAGES = 8;

const ID_RE = /^([A-Z0-9]+)_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})_(.+)$/;

export function airTimeFromIdentifier(identifier: string, fallback?: string): number {
  const m = identifier.match(ID_RE);
  if (m) return Date.parse(m[2]+"-"+m[3]+"-"+m[4]+"T"+m[5]+":"+m[6]+":"+m[7]+"Z");
  const t = fallback ? Date.parse(fallback) : NaN;
  return Number.isFinite(t) ? t : NaN;
}

export function normalizeArchiveDoc(doc: any): ArchiveNewsCandidate | null {
  const identifier = String(doc?.identifier || "");
  if (!identifier) return null;
  const airTime = airTimeFromIdentifier(identifier, doc?.publicdate || doc?.addeddate);
  if (!Number.isFinite(airTime)) return null;
  return {
    identifier,
    title: String(doc?.title || identifier),
    airTime,
    publicdate: doc?.publicdate || doc?.addeddate
  };
}

export function buildArchiveNewsSearchUrl(
  network: string,
  now: number,
  start: number,
  rows = PAGE_ROWS
): string {
  const from = new Date(now - NEWS_FRESHNESS_MS).toISOString();
  const end = new Date(now).toISOString().slice(0,10);
  const params = new URLSearchParams({
    q: "collection:"+network+" AND date:["+from+" TO "+end+"T23:59:59Z]",
    output: "json",
    rows: String(rows),
    start: String(start)
  });
  for (const field of ["identifier","title","publicdate","addeddate","description","subject"]) params.append("fl[]", field);
  params.append("sort[]", "publicdate desc");
  return "https://archive.org/advancedsearch.php?"+params.toString();
}

export async function discoverArchiveNews(
  network: string,
  now: number,
  fetcher: ArchiveFetch,
  maxPages = MAX_PAGES
): Promise<ArchiveNewsCandidate[]> {
  const seen = new Set<string>();
  const results: ArchiveNewsCandidate[] = [];
  let start = 0;

  for (let page = 0; page < maxPages; page++) {
    const response = await fetcher(buildArchiveNewsSearchUrl(network, now, start));
    if (!response.ok) throw new Error("Archive search HTTP "+response.status);
    const data: any = await response.json();
    const docs = Array.isArray(data?.response?.docs) ? data.response.docs : [];
    const total = Number(data?.response?.numFound || 0);

    for (const doc of docs) {
      const item = normalizeArchiveDoc(doc);
      if (item && !seen.has(item.identifier)) {
        seen.add(item.identifier);
        results.push(item);
      }
    }

    if (docs.length < PAGE_ROWS || results.length >= total) break;
    start += PAGE_ROWS;
  }

  const cutoff = now - NEWS_FRESHNESS_MS;
  return results
    .filter(item => item.airTime >= cutoff && item.airTime <= now)
    .sort((a,b) => b.airTime - a.airTime);
}

export async function validateArchiveMedia(
  identifier: string,
  fetcher: ArchiveFetch
): Promise<{ok:true;url:string}|{ok:false;reason:string}> {
  try {
    const meta = await fetcher("https://archive.org/metadata/"+encodeURIComponent(identifier));
    if (!meta.ok) return {ok:false,reason:"metadata_http_"+meta.status};
    const data: any = await meta.json();
    const files = Array.isArray(data?.files) ? data.files : [];
    const file = files.find((f:any) => {
      const n=String(f?.name||"").toLowerCase();
      const fmt=String(f?.format||"").toLowerCase();
      return (/\.(mp4|m4v|webm|mov|ts)$/i.test(n) || fmt.includes("mpeg4")) &&
             !n.includes("_thumb") && !n.includes("_meta");
    });
    if (!file?.name) return {ok:false,reason:"no_playable_media_file"};
    const encoded=String(file.name).split("/").map(encodeURIComponent).join("/");
    const url="https://archive.org/download/"+identifier+"/"+encoded;
    const head=await fetcher(url,{method:"HEAD",redirect:"follow",headers:{"Range":"bytes=0-0"}});
    if (head.status===403 || head.status===404) return {ok:false,reason:"media_http_"+head.status};
    if (!head.ok && head.status!==206) return {ok:false,reason:"media_http_"+head.status};
    return {ok:true,url};
  } catch (e:any) {
    return {ok:false,reason:String(e?.message||"media_validation_error")};
  }
}

export async function discoverPlayableArchiveNews(
  network: string,
  now: number,
  fetcher: ArchiveFetch,
  maxPages = MAX_PAGES
): Promise<Array<ArchiveNewsCandidate & {mediaUrl:string}>> {
  const discovered=await discoverArchiveNews(network,now,fetcher,maxPages);
  const output:Array<ArchiveNewsCandidate & {mediaUrl:string}>=[];
  for (const item of discovered) {
    const validation=await validateArchiveMedia(item.identifier,fetcher);
    if (validation.ok) output.push({...item,mediaUrl:validation.url});
    // A failed item is intentionally skipped; discovery continues.
  }
  return output.sort((a,b)=>b.airTime-a.airTime);
}
