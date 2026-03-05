import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import strip from 'strip-comments';

const ROOT_DIR = (() => {
  // --- ESM __dirname shim ---
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // --- Configuration ---
  // Script is in root/scripts, so ROOT_DIR is one level up
  return path.resolve(__dirname, '..');
})();

const CONFIG = {
  allowedExtensions: [
    '.ts',
    '.tsx',
    '.css',
    '.json',
    '.yaml',
    '.yml',
    '.jsonc',
    '.toml',
  ],
  ignoredDirs: [
    'node_modules',
    'dist',
    '.vscode',
    '.turbo',
    '.git',
    '.wrangler',
  ],
  ignoredFiles: [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'ai-context.txt',
    '.env.prod',
  ],
};

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { basePath: null, files: [] };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--path') result.basePath = args[++i];
    else if (args[i] === '--files') {
      // Collect everything after --files until the next flag
      while (args[i + 1] && !args[i + 1].startsWith('--')) {
        result.files.push(args[++i]);
      }
    }
  }
  return result;
}

// --- Functions ---
function getOutputFile(basePath) {
  const outputDir = path.join(ROOT_DIR, '.dist');

  // Generate filename: apps/web -> ai-context-apps.web.txt
  const fileSuffix = basePath ? `-${basePath.replace(/[\\/]/g, '.')}` : '';
  const outputFile = path.join(outputDir, `ai-context${fileSuffix}.txt`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  return outputFile;
}

function shouldIgnore(filePath) {
  const fileName = path.basename(filePath);

  if (CONFIG.ignoredFiles.includes(fileName)) return true;
  if (fileName.endsWith('.d.ts')) return true;

  const relativeFromRoot = path.relative(ROOT_DIR, filePath);
  const pathParts = relativeFromRoot.split(path.sep);
  return pathParts.some((part) => CONFIG.ignoredDirs.includes(part));
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

      if (
        CONFIG.allowedExtensions.includes(ext) ||
        fileName.startsWith('.env')
      ) {
        arrayOfFiles.push(fullPath);
      }
    }
  });
  return arrayOfFiles;
}

function main() {
  const { basePath, files } = parseArgs();
  if (!basePath) {
    console.error('❗Error: --path is required.');
    process.exit(1);
  }

  const searchPath = path.resolve(ROOT_DIR, basePath);

  // --- Execution ---
  console.log(`🔍 Target Path: ${searchPath}`);
  const outputFile = getOutputFile(basePath);

  const allFiles =
    files.length > 0
      ? files.map((f) => path.join(basePath, f))
      : getAllFiles(searchPath);

  let combinedContent = '';

  allFiles.forEach((file) => {
    const relativePath = path.relative(ROOT_DIR, file);
    combinedContent += `\n\n// --- FILE: ${relativePath} ---\n\n`;
    try {
      const rawCode = fs.readFileSync(file, 'utf8');
      combinedContent += strip(rawCode);
    } catch (err) {
      console.error(`Error reading ${file}: ${err}`);
    }
  });

  fs.writeFileSync(outputFile, combinedContent);
  console.log(`✨ Successfully generated: ${outputFile}`);
}

main();
