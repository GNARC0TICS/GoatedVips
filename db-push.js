// Simple script to push database schema changes
console.log("Pushing database schema changes...");

import { execSync } from 'child_process';

try {
  execSync("npm run db:push", { stdio: "inherit" });
  console.log("Schema changes applied successfully!");
} catch (error) {
  console.error("Error applying schema changes:", error);
  process.exit(1);
}