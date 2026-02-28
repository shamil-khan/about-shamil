import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- ESM __dirname shim ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
// Script is in root/scripts, so ROOT_DIR is one level up
const ROOT_DIR = path.resolve(__dirname, '..');
const outputDir = path.join(ROOT_DIR, 'dist');

const allowedExtensions = ['.ts', '.tsx', '.css', '.json', '.yaml', '.yml'];
const ignoredDirs = [
  'node_modules',
  'dist',
  '.vscode',
  '.turbo',
  '.git',
  '.wrangler',
];
const ignoredFiles = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'ai-context.txt',
  '.env.prod',
];

// --- Argument & Output Logic ---
const pathArgIndex = process.argv.indexOf('--path');
const relativeTarget =
  pathArgIndex !== -1 ? process.argv[pathArgIndex + 1] : '';
const searchPath = path.resolve(ROOT_DIR, relativeTarget);

// Generate filename: apps/web -> ai-context-apps.web.txt
const fileSuffix = relativeTarget
  ? `-${relativeTarget.replace(/[\\/]/g, '.')}`
  : '';
const outputFile = path.join(outputDir, `ai-context${fileSuffix}.txt`);

// --- Functions ---
function ensureDirectoryExistence() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

function shouldIgnore(filePath) {
  const fileName = path.basename(filePath);
  if (ignoredFiles.includes(fileName)) return true;

  const relativeFromRoot = path.relative(ROOT_DIR, filePath);
  const pathParts = relativeFromRoot.split(path.sep);
  return pathParts.some((part) => ignoredDirs.includes(part));
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) {
    console.error(`Error: Path does not exist: ${dirPath}`);
    return arrayOfFiles;
  }

  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (shouldIgnore(fullPath)) return;

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(fullPath);
      const fileName = path.basename(fullPath);

      if (allowedExtensions.includes(ext) || fileName.startsWith('.env')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });
  return arrayOfFiles;
}

// --- Execution ---
console.log(`🔍 Target Path: ${searchPath}`);
ensureDirectoryExistence();

const allFiles = getAllFiles(searchPath);
let combinedContent = '';

allFiles.forEach((file) => {
  const relativePath = path.relative(ROOT_DIR, file);
  combinedContent += `\n\n// --- FILE: ${relativePath} ---\n\n`;
  try {
    combinedContent += fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Error reading ${file}: ${err}`);
  }
});

fs.writeFileSync(outputFile, combinedContent);
console.log(`✨ Successfully generated: ${outputFile}`);
