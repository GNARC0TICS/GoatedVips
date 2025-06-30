
const http = require('http');

const checkPort = (port, name) => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      timeout: 5000
    }, (res) => {
      console.log(`✅ ${name} is running on port ${port}`);
      resolve(true);
    });

    req.on('error', () => {
      console.log(`❌ ${name} is not running on port ${port}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${name} on port ${port} timed out`);
      resolve(false);
    });

    req.end();
  });
};

async function verifyStartup() {
  console.log('🔍 Verifying server startup...');
  
  // Give servers time to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const backendRunning = await checkPort(3000, 'Backend');
  const frontendRunning = await checkPort(5174, 'Frontend');
  
  if (backendRunning && frontendRunning) {
    console.log('🎉 All servers are running successfully!');
    console.log('🌐 Frontend: http://localhost:5174');
    console.log('🔧 Backend: http://localhost:3000');
  } else {
    console.log('⚠️  Some servers may not be running properly');
  }
}

verifyStartup().catch(console.error);
