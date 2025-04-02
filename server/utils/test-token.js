/**
 * Test utility for validating Goated.com API token (JavaScript version - ES Modules)
 * 
 * This script will:
 * 1. Retrieve the current API token
 * 2. Make a test request to the Goated API leaderboard endpoint
 * 3. Report the status of the API connection
 * 
 * Run with: node server/utils/test-token.js
 */

import https from 'node:https';
import { parse } from 'node:url';

// Default API token fallback
const DEFAULT_API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJNZ2xjTU9DNEl6cWpVbzVhTXFBVyIsInNlc3Npb24iOiIxazVqRkNtdlcxQk0iLCJpYXQiOjE3NDM0OTM1ODksImV4cCI6MTc0MzU3OTk4OX0.l0YfA34QPzdNqwL0GNZ3oJK9LQNKoJn0cNQOA0u8TZs";

// Base URL and endpoints
const API_CONFIG = {
  baseUrl: "https://api.goated.com/user2",
  endpoints: {
    leaderboard: "/affiliate/referral-leaderboard/2RW440E",
    health: "/health"
  }
};

// Get API token
function getApiToken() {
  return process.env.API_TOKEN || DEFAULT_API_TOKEN;
}

// Get headers for API requests
function getApiHeaders() {
  return {
    'Authorization': `Bearer ${getApiToken()}`,
    'Content-Type': 'application/json'
  };
}

// Helper function to make HTTP requests using Node.js https module
function makeRequest(requestUrl, headers) {
  return new Promise((resolve, reject) => {
    const parsedUrl = parse(requestUrl);
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: 'GET',
      headers: headers
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          headers: res.headers,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Main test function
async function testApiToken() {
  console.log('Testing Goated.com API token...');
  
  try {
    // Get API headers with token
    const apiHeaders = getApiHeaders();
    console.log('Retrieved API headers successfully');
    
    // Make a test request to the leaderboard endpoint
    const requestUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`;
    console.log(`Making test request to: ${requestUrl}`);
    
    const response = await makeRequest(requestUrl, apiHeaders);
    
    if (response.ok) {
      console.log('✅ API token is valid! Response status:', response.status);
      
      // Get the response data
      const data = await response.json();
      
      // Check if we have data in the response
      if (data && data.data) {
        const timeframes = Object.keys(data.data);
        
        if (timeframes.length > 0) {
          console.log('Received data for timeframes:', timeframes.join(', '));
          
          // Get sample user count for each timeframe
          for (const timeframe of timeframes) {
            const timeframeData = data.data[timeframe];
            const users = timeframeData && timeframeData.data ? timeframeData.data : [];
            console.log(`- ${timeframe}: ${users.length} users`);
            
            // Show sample user if available
            if (users.length > 0) {
              const sampleUser = users[0];
              console.log('  Sample user:', {
                uid: sampleUser.uid || 'N/A',
                name: sampleUser.name || 'N/A',
                points: sampleUser.points || 0
              });
            }
          }
        } else {
          console.log('Response has data object but no timeframes');
        }
      } else {
        console.log('Response is valid but contains no data');
      }
      
    } else {
      console.log('❌ API token is invalid! Response status:', response.status);
      console.log('Response text:', await response.text());
    }
  } catch (error) {
    console.error('Error testing API token:', error);
  }
}

// Run the test
testApiToken();
