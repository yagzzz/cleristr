import { createClient } from "@libsql/client";
import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/cleris.db";
if (databaseUrl.startsWith("file:")) {
  const filePath = databaseUrl.slice("file:".length);
  await mkdir(path.dirname(path.resolve(filePath)), { recursive: true });
}

const client = createClient({
  url: databaseUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});

await client.execute(`
  CREATE TABLE IF NOT EXISTS __cleris_migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )
`);

const migrationDirectory = path.resolve("src/db/migrations");
const migrationFiles = (await readdir(migrationDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const file of migrationFiles) {
  const applied = await client.execute({
    sql: "SELECT 1 FROM __cleris_migrations WHERE name = ? LIMIT 1",
    args: [file],
  });
  if (applied.rows.length > 0) continue;

  const sql = await readFile(path.join(migrationDirectory, file), "utf8");
  await client.executeMultiple(sql);
  await client.execute({
    sql: "INSERT INTO __cleris_migrations (name, applied_at) VALUES (?, ?)",
    args: [file, new Date().toISOString()],
  });
  console.log(`Applied ${file}`);
}

client.close();
