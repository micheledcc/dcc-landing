import { setupDatabase } from "../lib/db";

async function main() {
  console.log("Creating tables...");
  await setupDatabase();
  console.log("Done. Tables created successfully.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Failed to set up database:", e);
  process.exit(1);
});
