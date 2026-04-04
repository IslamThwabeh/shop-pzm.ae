import { createHash, createHmac } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

function printUsage() {
  console.log(`Usage: node scripts/sync-products-to-shop.mjs <manifest.json>

Environment variables:
  PZM_SITE_URL             Optional. Defaults to https://shop.pzm.ae
  PZM_ADMIN_TOKEN          Optional. Reuses an existing admin token.
  PZM_ADMIN_USERNAME       Required if token is not provided.
  PZM_ADMIN_PASSWORD       Plain-text password. Script hashes it before login.
  PZM_ADMIN_PASSWORD_HASH  Pre-hashed SHA-256 password.

Manifest shape:
{
  "products": [
    {
      "id": "optional-existing-product-id",
      "model": "iPhone 17 Pro Max",
      "storage": "256GB",
      "condition": "new",
      "color": "Black",
      "price": 5999,
      "quantity": 3,
      "description": "optional",
      "replaceImages": true,
      "imagePaths": [
        "C:/Users/you/Pictures/catalog/iphone-17-black-front.jpg",
        "./relative/path/from-manifest.jpg"
      ]
    }
  ]
}`);
}

function normalizeSiteUrl(value) {
  return (value || 'https://shop.pzm.ae').replace(/\/+$/, '');
}

function parseArgs(argv) {
  const firstArg = argv[2];
  if (!firstArg || firstArg === '--help' || firstArg === '-h') {
    printUsage();
    process.exit(0);
  }

  return {
    manifestPath: path.resolve(firstArg),
  };
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
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
    // Local env files are optional.
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function generateAdminToken(secret) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: 'catalog-sync',
      type: 'admin',
      email: 'catalog-sync@pzm.ae',
      username: 'catalog-sync',
      iat: now,
      exp: now + 24 * 60 * 60,
    })
  );

  const hmac = createHmac('sha256', secret);
  hmac.update(`${header}.${payload}`);
  const encodedSignature = hmac
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `${header}.${payload}.${encodedSignature}`;
}

async function login(siteUrl) {
  if (process.env.PZM_ADMIN_TOKEN) {
    return process.env.PZM_ADMIN_TOKEN;
  }

  if (process.env.ADMIN_SECRET) {
    return generateAdminToken(process.env.ADMIN_SECRET);
  }

  const username = process.env.PZM_ADMIN_USERNAME;
  const passwordHash = process.env.PZM_ADMIN_PASSWORD_HASH || (process.env.PZM_ADMIN_PASSWORD ? hashPassword(process.env.PZM_ADMIN_PASSWORD) : '');

  if (!username || !passwordHash) {
    throw new Error('Missing admin credentials. Set PZM_ADMIN_TOKEN or PZM_ADMIN_USERNAME with PZM_ADMIN_PASSWORD/PZM_ADMIN_PASSWORD_HASH.');
  }

  const response = await fetch(`${siteUrl}/api/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: passwordHash }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Admin login failed (${response.status}): ${errorBody}`);
  }

  const payload = await response.json();
  return payload.data?.token;
}

async function fetchProducts(siteUrl, token) {
  const response = await fetch(`${siteUrl}/api/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch current products (${response.status})`);
  }

  const payload = await response.json();
  return payload.data || [];
}

function findExistingProduct(products, product) {
  if (product.id) {
    return products.find((item) => item.id === product.id) || null;
  }

  return (
    products.find(
      (item) =>
        item.model === product.model &&
        item.storage === product.storage &&
        item.condition === product.condition &&
        item.color === product.color
    ) || null
  );
}

async function buildFormData(product, manifestDir, existingProduct) {
  const mergedProduct = existingProduct ? { ...existingProduct, ...product } : product;
  const formData = new FormData();
  formData.append('model', mergedProduct.model);
  formData.append('storage', mergedProduct.storage);
  formData.append('condition', mergedProduct.condition);
  formData.append('color', mergedProduct.color);
  formData.append('price', String(mergedProduct.price));
  formData.append('quantity', String(mergedProduct.quantity ?? 0));
  formData.append('description', mergedProduct.description || '');

  if (product.replaceImages) {
    formData.append('replace_images', 'true');
  }

  const imagePaths = product.imagePaths || [];
  for (let index = 0; index < imagePaths.length; index += 1) {
    const sourcePath = path.isAbsolute(imagePaths[index])
      ? imagePaths[index]
      : path.resolve(manifestDir, imagePaths[index]);

    const fileBuffer = await fs.readFile(sourcePath);
    const blob = new Blob([fileBuffer], { type: getMimeType(sourcePath) });
    formData.append(`image${index}`, blob, path.basename(sourcePath));
  }

  return formData;
}

function validateManifest(manifest) {
  if (!manifest || !Array.isArray(manifest.products) || manifest.products.length === 0) {
    throw new Error('Manifest must contain a non-empty products array.');
  }

  for (const product of manifest.products) {
    if (product.id) {
      continue;
    }

    for (const field of ['model', 'storage', 'condition', 'color', 'price']) {
      if (product[field] === undefined || product[field] === null || product[field] === '') {
        throw new Error(`Product is missing required field: ${field}`);
      }
    }
  }
}

async function syncProduct(siteUrl, token, product, existingProduct, manifestDir) {
  if (!existingProduct && product.id) {
    throw new Error(`Product ${product.id} was not found in the live catalog.`);
  }

  const formData = await buildFormData(product, manifestDir, existingProduct);
  const method = existingProduct ? 'PUT' : 'POST';
  const endpoint = existingProduct
    ? `${siteUrl}/api/products/${existingProduct.id}`
    : `${siteUrl}/api/products`;

  const response = await fetch(endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`${method} ${endpoint} failed (${response.status}): ${errorBody}`);
  }

  const payload = await response.json();
  return payload.data;
}

async function main() {
  const { manifestPath } = parseArgs(process.argv);
  await loadDotEnv(path.resolve('backend/.dev.vars'));
  await loadDotEnv(path.resolve('backend/.cloudflare-deploy.env'));
  const siteUrl = normalizeSiteUrl(process.env.PZM_SITE_URL);
  const manifest = await readJson(manifestPath);
  validateManifest(manifest);

  const token = await login(siteUrl);
  if (!token) {
    throw new Error('Failed to obtain admin token.');
  }

  const manifestDir = path.dirname(manifestPath);
  const currentProducts = await fetchProducts(siteUrl, token);

  const summary = {
    created: 0,
    updated: 0,
  };

  for (const product of manifest.products) {
    const existingProduct = findExistingProduct(currentProducts, product);
    const result = await syncProduct(siteUrl, token, product, existingProduct, manifestDir);

    if (existingProduct) {
      summary.updated += 1;
      console.log(`Updated ${result.id}: ${result.model} (${result.color})`);
    } else {
      summary.created += 1;
      currentProducts.unshift(result);
      console.log(`Created ${result.id}: ${result.model} (${result.color})`);
    }
  }

  console.log(`\nDone. Created: ${summary.created}, Updated: ${summary.updated}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});