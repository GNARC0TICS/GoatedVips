// Temporary script to examine client methods
export const profileService = {
  requestGoatedAccountLink: async (username) => {
    // Expected implementation
    const response = await fetch('/api/account/request-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ goatedUsername: username })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to request account link: ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  checkGoatedUsername: async (username) => {
    // Expected implementation
    const response = await fetch(`/api/account/check-goated-username/${username}`);
    
    if (!response.ok) {
      throw new Error(`Failed to check username: ${response.statusText}`);
    }
    
    return await response.json();
  }
};