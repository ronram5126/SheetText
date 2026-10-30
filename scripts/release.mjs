import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const releaseDir = path.join(rootDir, 'release');
const releasePackageDir = path.join(releaseDir, 'sheettext-plugin');

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function writeFile(target, content) {
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, content, 'utf8');
}

ensureDir(releaseDir);
if (fs.existsSync(releasePackageDir)) {
  fs.rmSync(releasePackageDir, { recursive: true, force: true });
}

if (!fs.existsSync(distDir)) {
  throw new Error('Build artifacts not found. Run `npm run build` first.');
}

copyDir(distDir, path.join(releasePackageDir, 'dist'));
copyDir(path.join(rootDir, 'src', 'excel'), path.join(releasePackageDir, 'excel'));
copyDir(path.join(rootDir, 'src', 'onlyoffice'), path.join(releasePackageDir, 'onlyoffice'));

const packageJson = {
  name: 'sheettext-plugin',
  version: '1.0.0',
  description: 'SheetText rich text editor plugin bundle for Excel and ONLYOFFICE',
  private: true,
  files: ['dist', 'excel', 'onlyoffice']
};

writeFile(path.join(releasePackageDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
writeFile(path.join(releasePackageDir, 'README.txt'), [
  'SheetText plugin bundle',
  '',
  'This archive contains the compiled TypeScript library, Excel manifest, and ONLYOFFICE plugin config.',
  'Use the files in excel/manifest.xml and onlyoffice/config.json with your host environment.',
  ''
].join('\n'));

const zipName = 'sheettext-plugin.zip';
const zipPath = path.join(releaseDir, zipName);

const zipEntries = [];
function addFileToZip(base, currentPath) {
  const stat = fs.statSync(currentPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
      addFileToZip(base, path.join(currentPath, entry.name));
    }
    return;
  }

  const relative = path.relative(base, currentPath).split(path.sep).join('/');
  zipEntries.push(relative);
}

addFileToZip(releasePackageDir, releasePackageDir);

const zipContent = zipEntries.map((entry) => `"${entry}"`).join('\n');
fs.writeFileSync(path.join(releaseDir, 'MANIFEST.txt'), zipContent + '\n', 'utf8');

console.log(`Release package created at ${releasePackageDir}`);
console.log(`Archive manifest saved to ${path.join(releaseDir, 'MANIFEST.txt')}`);
