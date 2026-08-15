import { db } from './src/db/index.ts';
import { channels } from './src/db/schema.ts';
import fs from 'fs';

async function seed() {
  console.log("Loading data from all_m3u_cleaned.json...");
  const raw = fs.readFileSync('all_m3u_cleaned.json', 'utf-8');
  const data = JSON.parse(raw);

  const batchSize = 1000;
  console.log(`Inserting ${data.length} rows into DB...`);
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await db.insert(channels).values(batch).onConflictDoNothing();
    console.log(`Inserted batch ${i / batchSize + 1}`);
  }
  
  console.log("Done inserting.");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
