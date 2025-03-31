// Simple test runner script
import { execSync } from 'child_process';

try {
  console.log('Running inputSanitization tests...');
  execSync('npx vitest run src/utils/inputSanitization.test.ts', { stdio: 'inherit' });

  console.log('\nRunning performanceMonitoring tests...');
  execSync('npx vitest run src/utils/performanceMonitoring.test.ts', { stdio: 'inherit' });

  console.log('\nAll tests completed successfully!');
} catch (error) {
  console.error('Test execution failed:', error.message);
  process.exit(1);
}
