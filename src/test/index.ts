import * as path from 'path';
import * as Mocha from 'mocha';
import { glob } from 'glob';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 60000,
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((resolve, reject) => {
    try {
      // Find all test files synchronously
      const files = glob.sync('**/**.test.js', { cwd: testsRoot });

      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      // Run the mocha tests
      mocha.run(failures => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
