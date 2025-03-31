
/**
 * This script boosts Ruffrollr777's position in the monthly race to 3rd place
 * Run with: npx tsx server/scripts/boost-ruffrollr.ts
 */
import { modifyRuffrollrWager } from "../utils/modify-ruffrollr";

console.log("🚀 Boosting Ruffrollr777 to 3rd place in the monthly race...");

modifyRuffrollrWager()
  .then(() => {
    console.log("✅ Operation complete! Refresh the leaderboard to see the changes.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
