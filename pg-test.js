require("dotenv").config();

const { Client } = require("pg");

(async () => {
  console.log("=== PostgreSQL Diagnostic ===");

  console.log("Node:", process.version);
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

  const host = process.env.DATABASE_URL.match(/@([^/?]+)/)?.[1];
  console.log("Host:", host);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log("Connecting...");

    await client.connect();

    console.log("✅ Connected");

    const result = await client.query("SELECT version();");

    console.log(result.rows);

    await client.end();

    console.log("Finished.");
  } catch (err) {
    console.error("❌ ERROR");
    console.error(err);
  }

  process.exit(0);
})();