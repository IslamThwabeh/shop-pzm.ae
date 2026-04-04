import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

function printUsage() {
  console.log(`Usage: node scripts/upload-owned-media-to-r2.mjs --folder <folder> <file-or-directory> [more paths...]

Examples:
  node scripts/upload-owned-media-to-r2.mjs --folder blog C:/Users/you/Pictures/blog
  node scripts/upload-owned-media-to-r2.mjs --folder products ./product-images

Optional environment:
  CLOUDFLARE_API_TOKEN   Loaded automatically from backend/.cloudflare-deploy.env when present.
  CLOUDFLARE_ACCOUNT_ID  Loaded automatically from backend/.cloudflare-deploy.env when present.
`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const folderIndex = args.indexOf('--folder');
  if (folderIndex === -1 || !args[folderIndex + 1]) {
    throw new Error('Missing required --folder argument.');
  }

  const folder = args[folderIndex + 1].replace(/^\/+|\/+$/g, '');
  const sources = args.filter((_, index) => index !== folderIndex && index !== folderIndex + 1);

  if (sources.length === 0) {
    throw new Error('Provide at least one file or directory path to upload.');
  }

  return {
    folder,
    sources: sources.map((source) => path.resolve(source)),
  };
}

async function loadDotEnv(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      let value = rawValue.trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Local deploy env is optional.
  }
}

async function collectFiles(sourcePath, root = sourcePath) {
  const stat = await fs.stat(sourcePath);
  if (stat.isDirectory()) {
    const entries = await fs.readdir(sourcePath, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      files.push(...(await collectFiles(path.join(sourcePath, entry.name), root)));
    }
    return files;
  }

  if (!IMAGE_EXTENSIONS.has(path.extname(sourcePath).toLowerCase())) {
    return [];
  }

  return [{
    absolutePath: sourcePath,
    relativePath: (path.relative(root, sourcePath) || path.basename(sourcePath)).replace(/\\/g, '/'),
  }];
}

function getWranglerCommand() {
  return 'npx';
}

function quoteForPowerShell(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runWrangler(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = process.platform === 'win32'
      ? spawn(
          'powershell.exe',
          [
            '-NoProfile',
            '-Command',
            `& ${getWranglerCommand()} wrangler ${args.map(quoteForPowerShell).join(' ')}`,
          ],
          {
            cwd,
            env: process.env,
            stdio: ['ignore', 'pipe', 'pipe'],
          }
        )
      : spawn(getWranglerCommand(), ['wrangler', ...args], {
          cwd,
          env: process.env,
          stdio: ['ignore', 'pipe', 'pipe'],
        });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr || stdout || `wrangler exited with code ${code}`));
    });
  });
}

async function main() {
  const { folder, sources } = parseArgs(process.argv);
  await loadDotEnv(path.resolve('backend/.cloudflare-deploy.env'));

  const files = [];
  for (const source of sources) {
    files.push(...(await collectFiles(source)));
  }

  if (files.length === 0) {
    throw new Error('No image files found in the provided paths.');
  }

  const results = [];
  for (const file of files) {
    const normalizedRelativePath = file.relativePath.replace(/^\.+\//, '');
    const objectKey = `${folder}/${normalizedRelativePath}`;
    await runWrangler(['r2', 'object', 'put', `pzm-images/${objectKey}`, `--file=${file.absolutePath}`, '--remote'], path.resolve('backend'));
    const publicUrl = `https://shop.pzm.ae/api/media/${objectKey}`;
    results.push({
      source: file.absolutePath,
      url: publicUrl,
    });
    console.log(`Uploaded ${file.absolutePath} -> ${publicUrl}`);
  }

  console.log('\nUpload summary:');
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});