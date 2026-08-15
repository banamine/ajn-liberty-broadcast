const ac = new AbortController();
ac.abort();
fetch("https://google.com", { signal: ac.signal })
  .catch(e => console.log("Error:", e.name, e.message));
