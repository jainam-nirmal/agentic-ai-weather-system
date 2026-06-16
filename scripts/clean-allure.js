import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const dirsToClean = [
  path.join(projectRoot, 'reports', 'allure-results'),
  path.join(projectRoot, 'reports', 'allure-report'),
];

for (const dir of dirsToClean) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log('Allure report directories cleaned.');
