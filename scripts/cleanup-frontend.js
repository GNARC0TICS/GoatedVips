
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REDUNDANT_FILES = [
  'frontend/src/hooks/use-user.ts',
  'frontend/src/hooks/useApi.ts', 
  'frontend/src/lib/auth.tsx',
  'frontend/src/components/home/FeatureCard.tsx', // Use features/FeatureCard.tsx instead
  'frontend/src/services/api.ts', // Consolidated into queryClient.ts
];

const REDUNDANT_DIRS = [
  'frontend/src/components/data', // Merge into features
  'frontend/src/components/interactive', // Merge into ui
  'frontend/src/components/utils', // Merge into ui
];

console.log('🧹 Starting frontend cleanup...');

// Remove redundant files
REDUNDANT_FILES.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ Removed: ${file}`);
  }
});

// Remove redundant directories
REDUNDANT_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`✅ Removed directory: ${dir}`);
  }
});

console.log('🎉 Frontend cleanup complete!');
```
