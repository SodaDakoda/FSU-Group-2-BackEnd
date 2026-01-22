import db from "./db/client.js";

console.log("Testing database connection...");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

try {
  await db.connect();
  console.log("✓ Database connected!");

  const result = await db.query("SELECT COUNT(*) FROM departments");
  console.log("✓ Query successful! Departments count:", result.rows[0].count);

  await db.end();
  console.log("✓ Connection closed");
} catch (err) {
  console.error("✗ Error:", err.message);
  console.error(err);
  process.exit(1);
}
