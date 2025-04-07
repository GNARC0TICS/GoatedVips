
/**
 * API Format Test Script
 * 
 * This script makes a direct call to the Goated API and logs the
 * detailed structure of the response to help debug format issues.
 */

const fetch = require('node-fetch');

async function testApiFormat() {
  try {
    // Use the same token and URL as in your main application
    const apiToken = process.env.API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJNZ2xjTU9DNEl6cWpVbzVhTXFBVyIsInNlc3Npb24iOiJUWlNlWlJVWkFZbzEiLCJpYXQiOjE3NDM5MTM3NzYsImV4cCI6MTc0NDAwMDE3Nn0.8JHA2VNfP1FyS4HXIONlKBuDNjS98o8Waxnl6WOXCus";
    const apiUrl = "https://api.goated.com/user2/affiliate/referral-leaderboard/2RW440E";
    
    console.log(`Making API request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Detailed logging
    console.log("\n===== API RESPONSE ANALYSIS =====");
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Response Keys: ${Object.keys(data)}`);
    
    // Check if data property exists
    if (data.data) {
      console.log("\n----- Data Property Analysis -----");
      console.log(`Data type: ${typeof data.data}`);
      console.log(`Is array: ${Array.isArray(data.data)}`);
      console.log(`Keys in data: ${Object.keys(data.data)}`);
      
      // Sample a few entries
      const keys = Object.keys(data.data);
      if (keys.length > 0) {
        // Get first 3 keys
        const sampleKeys = keys.slice(0, 3);
        console.log("\n----- Sample Entries -----");
        
        for (const key of sampleKeys) {
          console.log(`Entry for key "${key}":`);
          console.log(JSON.stringify(data.data[key], null, 2));
        }
      }
      
      // Check for specific properties we expect
      console.log("\n----- Expected Properties Check -----");
      console.log(`Has today: ${!!data.data.today}`);
      console.log(`Has this_week: ${!!data.data.this_week}`);
      console.log(`Has this_month: ${!!data.data.this_month}`);
      console.log(`Has all_time: ${!!data.data.all_time}`);
      
      // Count entries if data appears to use numeric keys
      let numericKeys = 0;
      for (const key of keys) {
        if (!isNaN(Number(key))) {
          numericKeys++;
        }
      }
      
      if (numericKeys > 0) {
        console.log(`\nFound ${numericKeys} numeric keys in the data object`);
        
        // Check structure of the first entry with a numeric key
        for (const key of keys) {
          if (!isNaN(Number(key)) && data.data[key]) {
            console.log("\n----- Sample Numeric Key Entry Structure -----");
            console.log(`Structure of entry with key "${key}":`);
            
            const entry = data.data[key];
            console.log(`Entry type: ${typeof entry}`);
            if (typeof entry === 'object') {
              console.log(`Entry keys: ${Object.keys(entry)}`);
              console.log(`Entry data: ${JSON.stringify(entry, null, 2)}`);
              
              // Check for critical fields we need
              console.log(`\nCritical fields check:`);
              console.log(`Has uid: ${!!entry.uid}`);
              console.log(`Has name: ${!!entry.name}`);
              console.log(`Has wager/wager_amount: ${!!(entry.wager || entry.wager_amount)}`);
            }
            
            break; // Only examine one entry
          }
        }
      }
    }
    
    // Log a chunk of the raw response
    console.log("\n----- Raw Response Sample -----");
    console.log(JSON.stringify(data).substring(0, 1000) + "...");
    
  } catch (error) {
    console.error("Error testing API format:", error);
  }
}

testApiFormat();
