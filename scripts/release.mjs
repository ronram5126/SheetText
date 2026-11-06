import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const releaseDir = path.join(distDir, 'release');
const rootPackageJsonPath = path.join(rootDir, 'package.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function writeFile(target, content) {
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, content, 'utf8');
}

function getFileSize(filePath) {
  const bytes = fs.statSync(filePath).size;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

// Try zip first, fall back to tar.gz. Returns the path of the archive created.
function createArchive(sourceDir, outputBasePath) {
  const parentDir = path.dirname(sourceDir);
  const folderName = path.basename(sourceDir);
  const zipPath = `${outputBasePath}.zip`;
  const tarPath = `${outputBasePath}.tar.gz`;

  // Remove stale archives so old contents never leak into a new package
  fs.rmSync(zipPath, { force: true });
  fs.rmSync(tarPath, { force: true });

  try {
    execFileSync('zip', ['-r', '-q', zipPath, folderName], {
      cwd: parentDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return zipPath;
  } catch {
    fs.rmSync(zipPath, { force: true });
    console.log('  (zip not available, using tar.gz instead)');
  }

  try {
    execFileSync('tar', ['-czf', tarPath, '-C', parentDir, folderName], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return tarPath;
  } catch (error) {
    throw new Error(`Failed to create archive for ${folderName}: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Package definitions
// ---------------------------------------------------------------------------

const PACKAGES = [
  {
    id: 'excel',
    title: 'Excel',
    distSubdir: 'excel',
    configSource: path.join(rootDir, 'src', 'excel', 'manifest.xml'),
    configName: 'manifest.xml',
    readme: (version) => [
      '# SheetText Rich Text Editor - Excel Add-in',
      '',
      `Version: ${version}`,
      '',
      '## Installation',
      '',
      '1. In Excel, go to **Insert > Add-ins > My Add-ins > Upload My Add-in**',
      '2. Select the **manifest.xml** file from this package',
      '3. Click **Upload**',
      '',
      '## Contents',
      '',
      '- **manifest.xml** - Excel add-in manifest (required for installation)',
      '- **dist/** - Compiled plugin library files',
      '',
      '## Support',
      '',
      'For issues or questions, refer to the project documentation.',
      ''
    ].join('\n')
  },
  {
    id: 'onlyoffice',
    title: 'OnlyOffice',
    distSubdir: 'onlyoffice',
    configSource: path.join(rootDir, 'src', 'onlyoffice', 'config.json'),
    configName: 'config.json',
    readme: (version) => [
      '# SheetText Rich Text Editor - OnlyOffice Plugin',
      '',
      `Version: ${version}`,
      '',
      '## Installation',
      '',
      '1. Copy the **config.json** and **dist/** folder to your OnlyOffice plugin directory',
      '2. For ONLYOFFICE Document Server, plugins go in: `/var/www/onlyoffice/documentserver/sdkjs/plugins/`',
      '3. For ONLYOFFICE Community, plugins go in: `<ONLYOFFICE_INSTALL_DIR>/plugins/`',
      '4. Restart the ONLYOFFICE service',
      '',
      '## Contents',
      '',
      '- **config.json** - OnlyOffice plugin configuration (required)',
      '- **dist/** - Compiled plugin library files',
      '',
      '## Configuration',
      '',
      'Update **config.json** with your deployment URLs and settings before installation.',
      '',
      '## Support',
      '',
      'For issues or questions, refer to the project documentation.',
      ''
    ].join('\n')
  }
];

function createPackage(pkg, version) {
  const packageName = `sheettext-${pkg.id}-${version}`;
  const packageDir = path.join(releaseDir, packageName);

  if (fs.existsSync(packageDir)) {
    fs.rmSync(packageDir, { recursive: true, force: true });
  }
  ensureDir(packageDir);

  // Copy compiled files: shared editor + platform-specific build
  // (copied selectively to avoid recursing into dist/release/)
  const packageDistDir = path.join(packageDir, 'dist');
  ensureDir(packageDistDir);
  copyDir(path.join(distDir, 'editor'), path.join(packageDistDir, 'editor'));
  copyDir(path.join(distDir, pkg.distSubdir), path.join(packageDistDir, pkg.distSubdir));

  // Copy platform manifest/config
  copyFile(pkg.configSource, path.join(packageDir, pkg.configName));

  // README
  writeFile(path.join(packageDir, 'README.md'), pkg.readme(version));

  // Archive
  const archivePath = createArchive(packageDir, path.join(releaseDir, packageName));
  console.log(`✓ ${pkg.title} package created: ${path.basename(archivePath)}`);

  return { path: archivePath, dir: packageDir };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('\n' + '='.repeat(70));
  console.log('📦 SheetText Package Builder');
  console.log('='.repeat(70));

  // Read the version (read-only) so packages can be named after it
  const { version } = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
  if (!version) {
    throw new Error('package.json version is required to build a release package.');
  }
  console.log(`\n📌 Version: ${version}`);

  // Build
  console.log('\n🔨 Building project...');
  try {
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  } catch (error) {
    throw new Error(`Build failed: ${error.message}`);
  }
  console.log('✓ Build completed successfully');

  // Validate build output (checked after the build, since the build may recreate dist/)
  if (!fs.existsSync(distDir)) {
    throw new Error('Build artifacts not found. The build did not produce a dist/ directory.');
  }
  ensureDir(releaseDir);

  // Package
  console.log('\n📦 Creating release packages...');
  const results = PACKAGES.map((pkg) => ({ pkg, ...createPackage(pkg, version) }));

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('✅ Packages created successfully!');
  console.log('='.repeat(70));
  console.log(`\n  Version:  v${version}`);
  console.log(`  Location: ${releaseDir}\n`);
  for (const { pkg, path: archivePath, dir } of results) {
    console.log(`  • ${path.basename(dir)}`);
    console.log(`    └─ ${path.basename(archivePath)} (${getFileSize(archivePath)})`);
  }
  console.log('\n' + '='.repeat(70) + '\n');
}

try {
  main();
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
