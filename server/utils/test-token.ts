/**
 * Test utility for validating Goated.com API token
 * 
 * This script will:
 * 1. Retrieve the current API token
 * 2. Make a test request to the Goated API leaderboard endpoint
 * 3. Report the status of the API connection
 * 
 * Run with: npx ts-node server/utils/test-token.ts
 */

import { getApiHeaders } from './api-token';
import { API_CONFIG } from '../config/api';

async function testApiToken() {
  console.log('Testing Goated.com API token...');
  
  try {
    // Get API headers with token
    const apiHeaders = getApiHeaders();
    console.log('Retrieved API headers successfully');
    
    // Make a test request to the leaderboard endpoint
    console.log(`Making test request to: ${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`);
    
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`,
      { headers: apiHeaders }
    );
    
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
