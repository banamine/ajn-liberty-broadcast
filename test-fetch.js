async function test() {
  const url = "https://archive.org/download/daily-highlights/BIG%20WESTERN%20ZONE.m3u";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://archive.org/"
      }
    });
    console.log(res.status);
    console.log(res.url);
  } catch (e) {
    console.error(e);
  }
}
test();
