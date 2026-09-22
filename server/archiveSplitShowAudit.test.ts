import { strict as assert } from "node:assert";
import { auditM3UProvenance, extractArchiveIdentifier, parseM3UProvenance } from "./archiveSplitShowAudit.ts";

const source = "https://archive.org/download/daily-highlights/m3u_split_shows_2026-08-05%20%281%29/split_shows/Moonlighting.m3u";
const fixture = [
  "#EXTM3U",
  '#EXTINF:-1 tvg-id="moonlighting" group-title="Moonlighting",Moonlighting S01E01',
  "Moonlighting/S01E01.mp4",
  '#EXTINF:-1 group-title="Moonlighting",Moonlighting S01E02',
  "https://archive.org/download/example/Moonlighting/S01E02.mp4",
  '#EXTINF:-1 group-title="Moonlighting",Moonlighting S01E02 duplicate',
  "https://archive.org/download/example/Moonlighting/S01E02.mp4"
].join("\n");

const parsed = parseM3UProvenance(fixture, source);
assert.equal(parsed.length, 3);
assert.equal(parsed[0].sourceM3uUrl, source);
assert.equal(parsed[0].title, "Moonlighting S01E01");
assert.equal(parsed[0].groupTitle, "Moonlighting");
assert.match(parsed[0].url, /archive\.org\/download\/daily-highlights/);

const audit = auditM3UProvenance(fixture, source);
assert.equal(audit.entryCount, 3);
assert.equal(audit.duplicateUrls.length, 1);
assert.equal(audit.archiveIdentifiers.includes("example"), true);
assert.equal(extractArchiveIdentifier("https://archive.org/download/foo/bar.mp4"), "foo");

console.log("Archive split-show provenance tests: PASS");
