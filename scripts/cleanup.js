import { rm } from 'node:fs/promises';
import { glob } from 'glob';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function cleanUp() {
  // 1. Resolve target (Arg or one step up from /scripts)
  const targetDir = process.argv[2]
    ? resolve(process.argv[2])
    : resolve(__dirname, '..');

  console.log(`🧹 Deep cleaning workspace at: ${targetDir}`);

  // 2. Define search patterns for all levels
  const patterns = [
    '**/node_modules',
    '**/.turbo',
    '**/.vscode',
    '**/.wrangler',
    '**/dist',
    '**/*lock.yaml',
    '**/*lock.json',
    '**/*.lockb',
    '**/yarn.lock',
  ];

  // 3. Glob with strict root protection
  const allTargets = await glob(patterns, {
    cwd: targetDir,
    dot: true,
    ignore: [
      'node_modules/**', // Protects root/node_modules content
      'node_modules', // Protects root/node_modules folder
      '.turbo/**', // Protects root/.turbo content
      '.turbo', // Protects root/.turbo folder
      '.vscode/**', // Protects root/vscode content
      'vscode', // Protects root/vscode folder
    ],
  });

  // 4. Execution
  let count = 0;
  for (const target of allTargets) {
    try {
      const fullPath = join(targetDir, target);
      await rm(fullPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${target}`);
      count++;
    } catch (err) {
      /* Skip errors */
    }
  }

  console.log(
    `✨ Cleaned ${count} items. Root node_modules and .turbo were preserved.`,
  );
}

cleanUp().catch(console.error);
