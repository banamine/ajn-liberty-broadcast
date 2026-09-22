import { ARCHIVE_SPLIT_SHOW_DIRECTORY } from "../src/data/archiveSplitShowDirectory.ts";
import { auditM3UProvenance } from "../server/archiveSplitShowAudit.ts";

const MASTER_URL =
  "https://archive.org/download/m3u_split_shows_2026-08-05%20%281%29/m3u_split_shows_2026-08-05%20%281%29_vbr.m3u";

const sources = [
  { name: "Split Shows 1 master", url: MASTER_URL },
  ...ARCHIVE_SPLIT_SHOW_DIRECTORY
    .filter(source => source.url)
    .map(source => ({ name: source.name, url: source.url! }))
];

const results: Array<ReturnType<typeof auditM3UProvenance> & { name: string; fetchStatus: number }> = [];

for (const source of sources) {
  try {
    const response = await fetch(source.url);
    const text = await response.text();

    if (!response.ok) {
      console.log(JSON.stringify({ name: source.name, url: source.url, status: response.status }, null, 2));
      continue;
    }

    const audit = auditM3UProvenance(text, source.url);
    results.push({ ...audit, name: source.name, fetchStatus: response.status });

    console.log(JSON.stringify({
      name: source.name,
      url: source.url,
      status: response.status,
      entryCount: audit.entryCount,
      duplicateUrlCount: audit.duplicateUrls.length,
      archiveIdentifierCount: audit.archiveIdentifiers.length
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      name: source.name,
      url: source.url,
      error: error instanceof Error ? error.message : String(error)
    }, null, 2));
  }
}

const allUrls = new Map<string, string[]>();
for (const result of results) {
  for (const entry of result.entries) {
    const owners = allUrls.get(entry.url) || [];
    owners.push(result.name);
    allUrls.set(entry.url, owners);
  }
}

const overlaps = Array.from(allUrls.entries())
  .filter(([, owners]) => owners.length > 1)
  .map(([url, owners]) => ({ url, owners }));

console.log("\n=== ARCHIVE SPLIT-SHOW PROVENANCE SUMMARY ===");
console.log(JSON.stringify({
  sourcesAttempted: sources.length,
  sourcesFetched: results.length,
  totalEntries: results.reduce((sum, result) => sum + result.entryCount, 0),
  uniqueUrls: allUrls.size,
  crossSourceOverlapCount: overlaps.length,
  overlaps,
  note: "This audit is read-only. It does not import or mutate runtime playlists."
}, null, 2));
