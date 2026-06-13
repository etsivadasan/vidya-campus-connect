import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

const zip = new AdmZip();

const excludeFiles = [
  'node_modules',
  'dist',
  'package-lock.json',
  '.git',
  '.env',
  'campus-connect-source.zip', // avoid recursive zipping
];

function addLocalFiles(curDir: string, relativePath = '') {
  const items = fs.readdirSync(curDir);
  for (const item of items) {
    if (excludeFiles.includes(item) || item.startsWith('.')) {
      if (item !== '.env.example' && item !== '.gitignore') {
        continue; // Skip hidden configs and system dirs except env.example & gitignore
      }
    }
    const fullPath = path.join(curDir, item);
    const relPath = relativePath ? path.join(relativePath, item) : item;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      addLocalFiles(fullPath, relPath);
    } else {
      const fileContent = fs.readFileSync(fullPath);
      zip.addFile(relPath.replace(/\\/g, '/'), fileContent);
    }
  }
}

const rootDir = process.cwd();
try {
  addLocalFiles(rootDir);

  // Ensure public directory exists
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const zipPath = path.join(publicDir, 'campus-connect-source.zip');
  zip.writeZip(zipPath);
  console.log('ZIP successfully written to:', zipPath);
} catch (error) {
  console.error('Failed to generate ZIP archive:', error);
  process.exit(1);
}
