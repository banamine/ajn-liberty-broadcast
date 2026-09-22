import { normalizeNewsDiscovery, NEWS_DISCOVERY_FRESHNESS_MS } from "./storage.ts";

const NOW = Date.parse("2026-09-22T12:00:00.000Z");
const ago = (hours: number) => NOW - hours * 60 * 60 * 1000;

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

// Boundary: exactly 48h is retained; older and future records are rejected.
const boundary = normalizeNewsDiscovery([
  { id: "exact", title: "Exact", url: "https://e.test/exact", timestamp: ago(48), airTime: ago(48) },
  { id: "old", title: "Old", url: "https://e.test/old", timestamp: ago(48.001), airTime: ago(48.001) },
  { id: "future", title: "Future", url: "https://e.test/future", timestamp: NOW + 1, airTime: NOW + 1 },
], NOW);
assert(boundary.some(x => x.id === "exact"), "48-hour boundary must be inclusive");
assert(!boundary.some(x => x.id === "old"), "records older than 48h must be rejected");
assert(!boundary.some(x => x.id === "future"), "future records must be rejected");

// Ordering must use airTime, not insertion order or title.
const ordered = normalizeNewsDiscovery([
  { id: "older", title: "ZZZ", url: "https://e.test/older", timestamp: ago(1), airTime: ago(2) },
  { id: "newest", title: "AAA", url: "https://e.test/newest", timestamp: ago(3), airTime: ago(0.5) },
  { id: "middle", title: "MMM", url: "https://e.test/middle", timestamp: ago(2), airTime: ago(1) },
], NOW);
assert(ordered.map(x => x.id).join(",") === "newest,middle,older", "airTime newest-first ordering failed");

// Duplicate URLs must collapse deterministically, retaining the first item after filtering.
const duplicates = normalizeNewsDiscovery([
  { id: "first", title: "First", url: "https://e.test/same", timestamp: ago(1), airTime: ago(1) },
  { id: "second", title: "Second", url: "https://e.test/same", timestamp: ago(0.5), airTime: ago(0.5) },
], NOW);
assert(duplicates.length === 1 && duplicates[0].id === "first", "duplicate URL suppression is not deterministic");

// Invalid media candidates must not enter the normalized result.
const invalid = normalizeNewsDiscovery([
  { id: "empty-url", title: "No URL", url: "", timestamp: ago(1), airTime: ago(1) },
  { id: "nan-time", title: "NaN", url: "https://e.test/nan", timestamp: ago(1), airTime: Number.NaN },
], NOW);
assert(invalid.length === 0, "invalid URL/time candidates must be rejected");

// Explicit freshness override remains deterministic for future policy changes.
const shortWindow = normalizeNewsDiscovery([
  { id: "fresh", title: "Fresh", url: "https://e.test/fresh", timestamp: ago(2), airTime: ago(2) },
  { id: "stale", title: "Stale", url: "https://e.test/stale", timestamp: ago(3), airTime: ago(3) },
], NOW, 2.5 * 60 * 60 * 1000);
assert(shortWindow.length === 1 && shortWindow[0].id === "fresh", "custom freshness window failed");

assert(NEWS_DISCOVERY_FRESHNESS_MS === 48 * 60 * 60 * 1000, "default freshness contract changed unexpectedly");

console.log("AJN comprehensive news discovery invariants: PASS");
