
#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🔧 Fixing port conflicts...');

// Kill any processes on our target ports
const killPort = (port) => {
  return new Promise((resolve) => {
    exec(`lsof -ti:${port} | xargs kill -9`, (error) => {
      if (error) {
        console.log(`ℹ️  Port ${port} was already free`);
      } else {
        console.log(`✅ Freed port ${port}`);
      }
      resolve();
    });
  });
};

async function fixPorts() {
  await killPort(3000);
  await killPort(5174);
  await killPort(5175);
  
  console.log('🎉 Port cleanup complete. You can now restart the servers.');
}

fixPorts().catch(console.error);
