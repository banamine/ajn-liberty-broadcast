import assert from "node:assert/strict";
import { resolveArchiveMedia } from "./archiveMediaResolver";

function response(status: number, body: any, headers: Record<string,string> = {}): Response {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers }
  });
}

const calls: string[] = [];
const fetcher = async (url: string, init?: RequestInit): Promise<Response> => {
  calls.push((init?.method || "GET") + " " + url);
  if (url.includes("/metadata/fixture")) {
    return response(200, {
      files: [
        { name: "episode.mkv", format: "Matroska" },
        { name: "episode_512kb.mp4", format: "512Kb MPEG4", length: "1234" },
        { name: "episode_512kb.mp4_thumb.jpg", format: "JPEG" }
      ]
    });
  }
  if (init?.method === "HEAD") {
    return new Response(null, { status: 200, headers: { "content-type": "video/mp4" } });
  }
  return new Response(null, { status: 206, headers: { "content-type": "video/mp4" } });
};

const resolved = await resolveArchiveMedia("fixture", "episode.mkv", fetcher);
assert.equal(resolved.status, "PLAYABLE");
assert.equal(resolved.isAvailable, true);
assert.equal(resolved.originalName, "episode_512kb.mp4");
assert.equal(resolved.mimeType, "video/mp4");
assert.equal(resolved.duration, 1234);
assert.match(resolved.streamUrl, /episode_512kb\.mp4$/);

const second = await resolveArchiveMedia("fixture", "episode.mkv", fetcher);
assert.deepEqual(second, resolved);
assert.equal(calls.filter(c => c.includes("/metadata/fixture")).length, 1);
assert.equal(calls.filter(c => c.startsWith("HEAD ")).length, 1);

console.log("archive media resolver tests passed");
