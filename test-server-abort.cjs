const express = require('express');
const app = express();
app.get('/proxy', async (req, res) => {
  const ac = new AbortController();
  req.on('close', () => {
    console.log("Client closed, aborting fetch");
    ac.abort();
  });
  try {
    const response = await fetch("https://archive.org/download/daily-highlights/BIG%20WESTERN%20ZONE.m3u", { signal: ac.signal });
    res.send("OK");
  } catch (err) {
    console.log("Fetch failed with err.name:", err.name, err.message);
  }
});
const server = app.listen(3001, async () => {
  const ac = new AbortController();
  setTimeout(() => ac.abort(), 500);
  try {
    await fetch("http://localhost:3001/proxy", { signal: ac.signal });
  } catch (e) {
    console.log("Client fetch error:", e.name);
  }
  server.close();
});
