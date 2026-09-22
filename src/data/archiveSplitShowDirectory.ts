/**
 * Authoritative AJN split-show M3U directory.
 *
 * These are provenance references only. They are intentionally NOT imported into
 * the runtime playlist loader here, because the existing Split Shows 1 master
 * feed may already contain some or all of these episodes.
 */
export interface ArchiveShowM3uSource {
  id: string;
  name: string;
  url?: string;
  kind: "show" | "other";
}

const BASE = "https://archive.org/download/daily-highlights/m3u_split_shows_2026-08-05%20%281%29/split_shows/";

export const ARCHIVE_SPLIT_SHOW_DIRECTORY: readonly ArchiveShowM3uSource[] = [
  { id: "barnaby-jones", name: "Barnaby Jones", kind: "show" },
  { id: "barney-miller", name: "Barney Miller", kind: "show" },
  { id: "brooklyn-nine-nine", name: "Brooklyn Nine-Nine", kind: "show" },
  { id: "cannon", name: "Cannon", kind: "show" },
  { id: "charlies-angels", name: "Charlie's Angels", kind: "show" },
  { id: "columbo", name: "Columbo", kind: "show" },
  { id: "dick-tracy", name: "Dick Tracy", kind: "show" },
  { id: "dragnet", name: "Dragnet", kind: "show" },
  { id: "ellery-queen", name: "Ellery Queen", kind: "show" },
  { id: "gotham", name: "Gotham", kind: "show" },
  { id: "hache", name: "Hache", kind: "show" },
  { id: "hart-to-hart", name: "Hart to Hart", kind: "show" },
  { id: "hawaii-five-o", name: "Hawaii Five-O", kind: "show" },
  { id: "hunter", name: "Hunter", kind: "show" },
  { id: "knight-rider", name: "Knight Rider", kind: "show" },
  { id: "kojak", name: "Kojak", kind: "show" },
  { id: "mission-impossible", name: "Mission Impossible", kind: "show" },
  { id: "moonlighting", name: "Moonlighting", url: BASE + "Moonlighting.m3u", kind: "show" },
  { id: "police-woman", name: "Police Woman", url: BASE + "Police_Woman.m3u", kind: "show" },
  { id: "sherlock-holmes", name: "Sherlock Holmes", url: BASE + "Sherlock_Holmes.m3u", kind: "show" },
  { id: "the-fbi", name: "The FBI", url: BASE + "The_FBI.m3u", kind: "show" },
  { id: "the-fugitive", name: "The Fugitive", url: BASE + "The_Fugitive.m3u", kind: "show" },
  { id: "the-green-hornet", name: "The Green Hornet", url: BASE + "The_Green_Hornet.m3u", kind: "show" },
  { id: "the-inspector-alleyn-mysteries", name: "The Inspector Alleyn Mysteries", url: BASE + "The_Inspector_Alleyn_Mysteries.m3u", kind: "show" },
  { id: "the-mod-squad", name: "The Mod Squad", url: BASE + "The_Mod_Squad_-.m3u", kind: "show" },
  { id: "the-wild-wild-west", name: "The Wild Wild West", url: BASE + "The_Wild_Wild_West.m3u", kind: "show" },
  { id: "other-content", name: "Other Content", url: BASE + "Other_Content.m3u", kind: "other" }
] as const;

export const ARCHIVE_SPLIT_SHOW_DIRECTORY_EXPECTED_SHOW_COUNT = 26;
export const ARCHIVE_SPLIT_SHOW_DIRECTORY_VERIFIED_URL_COUNT = 10;

export function validateArchiveSplitShowDirectory(sources = ARCHIVE_SPLIT_SHOW_DIRECTORY): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const urls = new Set<string>();
  const showSources = sources.filter(source => source.kind === "show");

  if (showSources.length !== ARCHIVE_SPLIT_SHOW_DIRECTORY_EXPECTED_SHOW_COUNT) {
    errors.push(`expected ${ARCHIVE_SPLIT_SHOW_DIRECTORY_EXPECTED_SHOW_COUNT} show sources, found ${showSources.length}`);
  }

  for (const source of sources) {
    if (!source.id || ids.has(source.id)) errors.push(`duplicate/empty id: ${source.id || "<empty>"}`);
    if (!source.url || urls.has(source.url)) errors.push(`duplicate/empty url: ${source.url || "<empty>"}`);
    if (!source.url.startsWith(BASE)) errors.push(`unexpected source root: ${source.url}`);
    if (!source.url.toLowerCase().endsWith(".m3u")) errors.push(`non-M3U source: ${source.url}`);
    ids.add(source.id);
    urls.add(source.url);
  }

  return errors;
}
