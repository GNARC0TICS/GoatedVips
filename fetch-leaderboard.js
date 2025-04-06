// Script to fetch the raw leaderboard data
import fetch from 'node-fetch';

async function fetchLeaderboard() {
  const ENDPOINT = 'https://api.goated.com/user2/affiliate/referral-leaderboard/2RW440E';
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJNZ2xjTU9DNEl6cWpVbzVhTXFBVyIsInNlc3Npb24iOiJUWlNlWlJVWkFZbzEiLCJpYXQiOjE3NDM5MTM3NzYsImV4cCI6MTc0NDAwMDE3Nn0.8JHA2VNfP1FyS4HXIONlKBuDNjS98o8Waxnl6WOXCus';

  console.log(`Using full URL: ${ENDPOINT}`);
  console.log(`Using token: ${TOKEN.substring(0, 10)}...`);
  console.log(`Token expiry check: ${new Date(1744000176 * 1000).toISOString()} (should be in the future)`);
  const now = Math.floor(Date.now() / 1000);
  console.log(`Current time: ${now}, Token expires: 1744000176, Valid: ${now < 1744000176}`);

  try {
    // Add timeout of 10 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    console.log('Starting fetch request...');
    const response = await fetch(ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log('Response data structure:');
    console.log(JSON.stringify(data, null, 2).substring(0, 1000) + '...');
    
    // Check if we have users in the all_time category
    if (data.data && data.data.all_time && data.data.all_time.data) {
      console.log(`Number of users in all_time: ${data.data.all_time.data.length}`);
      
      if (data.data.all_time.data.length > 0) {
        console.log('First user sample:');
        console.log(JSON.stringify(data.data.all_time.data[0], null, 2));
      } else {
        console.log('No users found in the all_time data.');
      }
    } else {
      console.log('No all_time data found in the response.');
      console.log('Full response structure:');
      console.log(Object.keys(data));
      
      if (data.data) {
        console.log('Data structure:');
        console.log(Object.keys(data.data));
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchLeaderboard();