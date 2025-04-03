// This is a simple test client to interact with the verification API

async function testVerificationAPI() {
  // Use localhost with the specific port
  const BASE_URL = "http://localhost:5000/api/verification";

  // Function to make API requests
  async function makeRequest(endpoint, method = "GET", data = null) {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`Making ${method} request to ${url}`);
    
    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json"
        }
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const responseData = await response.json();

      console.log("Response status:", response.status);
      console.log("Response data:", JSON.stringify(responseData, null, 2));
      return { status: response.status, data: responseData };
    } catch (error) {
      console.error("Error making request:", error);
      return { error: error.message };
    }
  }

  // Test the verification request endpoint
  async function testRequestVerification() {
    console.log("\n--- Testing Verification Request ---");
    
    // Using a valid Goated ID from our database
    const data = {
      goatedId: "MMWGoLCkQ8JAIoyOAcP5", // User ID for "Sunil"
      goatedUsername: "Sunil",
      telegramId: "12345678",
      telegramUsername: "sunil_telegram",
      notes: "This is a test verification request"
    };

    return makeRequest("/request", "POST", data);
  }

  // Test checking verification status
  async function testCheckStatus(goatedId) {
    console.log("\n--- Testing Verification Status Check ---");
    return makeRequest(`/status/${goatedId}`);
  }

  // Run the tests
  console.log("Starting verification API tests...");
  
  const requestResult = await testRequestVerification();
  
  // If request was successful, check the status
  if (requestResult.status === 201) {
    // Use the same Goated ID as in the request
    await testCheckStatus("MMWGoLCkQ8JAIoyOAcP5");
  }

  console.log("Verification API tests completed.");
}

// Execute the tests
testVerificationAPI();