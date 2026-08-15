const { createServer } = require('vite');
async function run() {
  try {
    const vite = await createServer({
      server: { middlewareMode: true, watch: null },
      appType: "spa"
    });
    console.log("SUCCESS");
    process.exit(0);
  } catch (err) {
    console.error("VITE ERROR:", err);
  }
}
run();
