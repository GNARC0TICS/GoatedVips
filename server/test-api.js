
// JavaScript version of test-api.ts
import { API_CONFIG } from "./config/api.js";

async function analyzeLeaderboardAPI() {
  try {
    console.log("\n=== Starting API Analysis ===\n");

    // Check API token
    console.log("API Token Status:", {
      exists: !!API_CONFIG.token,
      length: API_CONFIG.token?.length || 0,
      firstChars: API_CONFIG.token
        ? `${API_CONFIG.token.substring(0, 4)}...`
        : "none",
    });

    // Test API health
    console.log(
      "Making health check request to:",
      `${API_CONFIG.baseUrl}/health`,
    );
    const healthCheck = await fetch(`${API_CONFIG.baseUrl}/health`, {
      headers: {
        Authorization: `Bearer ${API_CONFIG.token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(
      "API Health Check:",
      healthCheck.status,
      healthCheck.statusText,
    );

    // Make leaderboard request
    const response = await fetch(`${API_CONFIG.baseUrl}/affiliate/referral-leaderboard/2RW440E`, {
      headers: {
        Authorization: `Bearer ${API_CONFIG.token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("\nResponse Status:", response.status);
    console.log(
      "Response Headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (response.ok) {
      const rawData = await response.json();

      // Basic Structure Analysis
      console.log("\nAPI Response Structure:", {
        success: rawData.success,
        dataType: typeof rawData.data,
        isArray: Array.isArray(rawData.data),
        totalEntries: rawData.data?.length || 0,
        responseKeys: Object.keys(rawData),
      });

      if (Array.isArray(rawData.data) && rawData.data.length > 0) {
        // Sample a few entries
        console.log("\nSample Entries:", rawData.data.slice(0, 3));
      } else if (rawData.data) {
        console.log("\nData Structure:", rawData.data);
      }
    } else {
      console.log("\nAPI Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("\nError analyzing API:", error);
  }
}

analyzeLeaderboardAPI();
