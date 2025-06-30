
#!/usr/bin/env node

const http = require('http');

const checkEndpoint = (url, timeout = 5000) => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ success: false, error: 'Timeout' });
    }, timeout);

    http.get(url, (res) => {
      clearTimeout(timer);
      resolve({ success: res.statusCode === 200, status: res.statusCode });
    }).on('error', (err) => {
      clearTimeout(timer);
      resolve({ success: false, error: err.message });
    });
  });
};

async function verifyStartup() {
  console.log('🔍 Verifying server startup...\n');
  
  const checks = [
    { name: 'Backend Health', url: 'http://localhost:3000/health' },
    { name: 'Backend API', url: 'http://localhost:3000/api' },
    { name: 'Frontend Server', url: 'http://localhost:5174/' }
  ];

  for (const check of checks) {
    const result = await checkEndpoint(check.url);
    if (result.success) {
      console.log(`✅ ${check.name}: OK`);
    } else {
      console.log(`❌ ${check.name}: ${result.error || `HTTP ${result.status}`}`);
    }
  }
  
  console.log('\n🎯 If all checks pass, your application is ready!');
}

verifyStartup().catch(console.error);
