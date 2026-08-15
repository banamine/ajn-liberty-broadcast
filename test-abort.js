async function test() {
  const url = "https://archive.org/download/daily-highlights/BIG%20WESTERN%20ZONE.m3u";
  try {
    const ac = new AbortController();
    setTimeout(() => ac.abort(), 10); // Abort very quickly
    const res = await fetch(url, { signal: ac.signal });
    console.log(res.status);
  } catch (e) {
    console.log("Error name:", e.name);
    console.log("Error message:", e.message);
    if (e.cause) {
       console.log("Cause name:", e.cause.name);
    }
  }
}
test();
