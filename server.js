import app from "#app";
import db from "#db/client";

const PORT = process.env.PORT ?? 5000;

// Handle uncaught errors
process.on("uncaughtException", (err) => {
  console.error("✗ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("✗ Unhandled Rejection at:", promise, "reason:", reason);
});

try {
  console.log("Connecting to database...");
  await db.connect();
  console.log("✓ Database connected");

  app.listen(PORT, () => {
    console.log(`✓ Listening on port ${PORT}...`);
  });
} catch (err) {
  console.error("✗ Server startup error:", err);
  process.exit(1);
}
