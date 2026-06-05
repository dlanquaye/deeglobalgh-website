require("dotenv").config();

const { Client } = require("pg");

console.log("DB URL EXISTS:", !!process.env.DATABASE_URL);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

async function test() {
  try {
    await client.connect();
    console.log("CONNECTED");

    const result = await client.query("SELECT NOW()");
    console.log(result.rows);

    await client.end();
  } catch (err) {
    console.error("FAILED");
console.error(err);
  }
}

test();