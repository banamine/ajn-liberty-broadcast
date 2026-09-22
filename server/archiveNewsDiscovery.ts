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

const ID_RE = /^([A-Z0-9]+)_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})(?:_(.+))?$/;

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
  const candidates = getArchiveCollectionCandidates(network);
  let selected: string | null = null;
  let selectedDocs: any[] = [];

  // Archive TV News is not consistent about collection aliases. Test the
  // canonical slug first, then the TV-* alias used by the known-good
  // behavioral implementation. Select the first candidate with results.
  for (const collection of candidates) {
    const response = await fetcher(buildArchiveNewsSearchUrl(collection, now, 0));
    if (!response.ok) continue;

    const data: any = await response.json();
    const docs = Array.isArray(data?.response?.docs) ? data.response.docs : [];
    const total = Number(data?.response?.numFound || 0);
    if (docs.length > 0 || total > 0) {
      selected = collection;
      selectedDocs = docs;
      break;
    }
  }

  if (!selected) return [];

  const seen = new Set<string>();
  const results: ArchiveNewsCandidate[] = [];

  const addDocs = (docs: any[]) => {
    for (const doc of docs) {
      const item = normalizeArchiveDoc(doc);
      if (item && !seen.has(item.identifier)) {
        seen.add(item.identifier);
        results.push(item);
      }
    }
  };

  addDocs(selectedDocs);

  let start = PAGE_ROWS;
  for (let page = 1; page < maxPages; page++) {
    const response = await fetcher(buildArchiveNewsSearchUrl(selected, now, start));
    if (!response.ok) break;

    const data: any = await response.json();
    const docs = Array.isArray(data?.response?.docs) ? data.response.docs : [];
    const total = Number(data?.response?.numFound || 0);
    addDocs(docs);

    if (docs.length < PAGE_ROWS || results.length >= total) break;
    start += PAGE_ROWS;
  }

  const cutoff = now - NEWS_FRESHNESS_MS;
  return results
    .filter(item => item.airTime >= cutoff && item.airTime <= now)
    .sort((a,b)=>b.airTime-a.airTime);
}

