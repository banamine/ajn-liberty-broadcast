import { normalizeNewsDiscovery } from "./storage.ts";

const NOW = Date.parse("2026-09-22T12:00:00.000Z");
const ago = (hours: number) => NOW - hours * 60 * 60 * 1000;

const candidates = [
  { id: "older-page", title: "Old", url: "https://example.test/old.mp4", timestamp: ago(49), airTime: ago(49) },
  { id: "page-2-newer", title: "Newer", url: "https://example.test/newer.mp4", timestamp: ago(2), airTime: ago(2) },
  { id: "page-3-newest", title: "Newest", url: "https://example.test/newest.mp4", timestamp: ago(0.5), airTime: ago(0.5) },
  { id: "future", title: "Future", url: "https://example.test/future.mp4", timestamp: NOW + 3600000, airTime: NOW + 3600000 },
  { id: "duplicate", title: "Duplicate", url: "https://example.test/newer.mp4", timestamp: ago(1), airTime: ago(1) }
];

const result = normalizeNewsDiscovery(candidates, NOW);

if (result.length !== 2) throw new Error("Expected 2 fresh unique items, got " + result.length);
if (result[0].id !== "page-3-newest" || result[1].id !== "page-2-newer") {
  throw new Error("Newest-first airTime ordering failed");
}
if (result.some(item => item.id === "older-page" || item.id === "future")) {
  throw new Error("48-hour freshness filter failed");
}
if (result.filter(item => item.url === "https://example.test/newer.mp4").length !== 1) {
  throw new Error("URL deduplication failed");
}

console.log("AJN news discovery normalization: PASS");
