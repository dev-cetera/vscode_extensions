import * as path from 'path';
import * as Mocha from 'mocha';
import { sync as globSync } from 'glob';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((resolve, reject) => {
    try {
      // Use glob.sync to find all files ending in .test.js
      const files = globSync('**/**.test.js', { cwd: testsRoot });

      // Add all the found test files to the mocha test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      // Run the mocha test
      mocha.run(failures => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}