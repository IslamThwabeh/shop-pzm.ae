import fs from 'node:fs/promises';
import path from 'node:path';

function normalizeSiteUrl(value) {
  return (value || 'https://pzm.ae').replace(/\/+$/, '');
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(value) {
  return normalizeText(value)
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

function deriveBrand(model) {
  const normalized = normalizeText(model);
  const patterns = [
    [/^iphone|^ipad|^macbook/i, 'Apple'],
    [/^samsung|\bgalaxy\b|^tab /i, 'Samsung'],
    [/^redmi|^xiaomi/i, 'Xiaomi'],
    [/^huawei|^matepad/i, 'Huawei'],
    [/^honor/i, 'Honor'],
    [/^nokia/i, 'Nokia'],
    [/^tecno/i, 'Tecno'],
    [/^nintendo|switch/i, 'Nintendo'],
    [/^ps4|^ps5|playstation/i, 'PlayStation'],
    [/^xbox/i, 'Xbox'],
    [/^lenovo|thinkbook/i, 'Lenovo'],
    [/^microsoft|surface/i, 'Microsoft'],
    [/^dell|inspiron/i, 'Dell'],
    [/^hp\b/i, 'HP'],
    [/^asus|rog/i, 'ASUS'],
    [/^lg\b/i, 'LG'],
    [/^aorus/i, 'AORUS'],
    [/^alienware/i, 'Alienware'],
    [/^gaming pc/i, 'Gaming PC'],
  ];

  for (const [pattern, brand] of patterns) {
    if (pattern.test(normalized)) {
      return brand;
    }
  }

  return undefined;
}

function classifyProduct(product) {
  const text = `${normalizeText(product.model)} ${normalizeText(product.storage)}`.toLowerCase();
  const prefix = product.condition === 'used' ? 'Used Devices' : 'Brand New Devices';

  if (/\bps4\b|\bps5\b|playstation|\bxbox\b|nintendo switch/.test(text)) {
    return {
      productType: `${prefix} > Gaming`,
      googleProductCategory: 'Electronics > Video Game Consoles',
    };
  }

  if (/gaming pc|desktop/.test(text)) {
    return {
      productType: `${prefix} > Gaming`,
      googleProductCategory: 'Electronics > Computers > Desktop Computers',
    };
  }

  if (/monitor|viewfinity|ultragear|rog swift|displayhdr|oled curved/.test(text)) {
    return {
      productType: `${prefix} > Laptops & Computers`,
      googleProductCategory: 'Electronics > Computers > Computer Monitors',
    };
  }

  if (/ipad|\btab\b|matepad/.test(text)) {
    return {
      productType: `${prefix} > Phones & Tablets`,
      googleProductCategory: 'Electronics > Computers > Tablet Computers',
    };
  }

  if (/iphone|spark|nokia|redmi|honor|huawei|\ba\d{2,3}\b|galaxy/.test(text)) {
    return {
      productType: `${prefix} > Phones & Tablets`,
      googleProductCategory: 'Electronics > Communications > Telephony > Mobile Phones',
    };
  }

  if (/macbook|thinkbook|surface pro|laptop|inspiron|alienware|aorus|rog|^hp\b|^dell\b|^lenovo\b/.test(text)) {
    return {
      productType: `${prefix} > Laptops & Computers`,
      googleProductCategory: 'Electronics > Computers > Laptops',
    };
  }

  return {
    productType: prefix,
    googleProductCategory: undefined,
  };
}

function normalizeStorage(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return '';
  }

  if (/^(brand new console|gaming console|console|console bundle)$/i.test(normalized)) {
    return '';
  }

  return normalized;
}

function extractColorDetails(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return {};
  }

  if (/^(official warranty|retail stock|latest stock|contact for color|used laptop)$/i.test(normalized)) {
    return { color: '' };
  }

  if (/^\d+\+?\s*pcs available$/i.test(normalized)) {
    return { color: '' };
  }

  if (/^with keyboard$/i.test(normalized)) {
    return {
      color: '',
      accessoriesIncluded: 'Keyboard',
    };
  }

  if (/^never fixed$/i.test(normalized)) {
    return {
      color: '',
      repairHistory: 'Never fixed',
    };
  }

  const connectivityMatch = normalized.match(/^(.*?)\s*\/\s*(Wi-?Fi(?:\s*\+\s*Cellular)?|Cellular)$/i);
  if (connectivityMatch) {
    return {
      color: titleCase(connectivityMatch[1]),
      connectivity: connectivityMatch[2].replace(/\s+/g, ' '),
    };
  }

  return { color: normalized };
}

function extractBatteryHealth(...sources) {
  for (const source of sources) {
    const match = normalizeText(source).match(/battery\s*(\d{2,3})\s*%/i);
    if (match) {
      return Number(match[1]);
    }
  }

  return undefined;
}

function extractRepairHistory(...sources) {
  for (const source of sources) {
    if (/never fixed/i.test(normalizeText(source))) {
      return 'Never fixed';
    }
  }

  return undefined;
}

function extractWarranty(product, ...sources) {
  for (const source of [product.warranty, ...sources]) {
    if (/official warranty|manufacturer warranty/i.test(normalizeText(source))) {
      return 'Official manufacturer warranty';
    }
  }

  return undefined;
}

function extractAccessories(...sources) {
  const accessories = new Set();

  for (const source of sources) {
    const normalized = normalizeText(source).toLowerCase();
    if (!normalized) {
      continue;
    }

    if (normalized.includes('controller')) {
      accessories.add('Controller');
    }
    if (normalized.includes('keyboard')) {
      accessories.add('Keyboard');
    }
  }

  return accessories.size > 0 ? Array.from(accessories).join(', ') : undefined;
}

function extractReleaseYear(...sources) {
  for (const source of sources) {
    const match = normalizeText(source).match(/\b(20\d{2})\b/);
    if (match) {
      return Number(match[1]);
    }
  }

  return undefined;
}

function buildItemGroupId(product, brand) {
  if (!brand) {
    return undefined;
  }

  const normalizedModel = normalizeText(product.model)
    .replace(/\b(with controller|good condition|open box)\b/gi, '')
    .trim();

  const normalizedStorage = normalizeStorage(product.storage)
    .replace(/\s*\/\s*/g, '-')
    .trim();

  const slug = slugify([brand, normalizedModel, normalizedStorage || product.condition].filter(Boolean).join(' '));
  return slug || undefined;
}

function buildDescription(product, derived) {
  const existingDescription = normalizeText(product.description);
  const isLegacyDescription = /legacy/i.test(existingDescription);
  const isBatteryOnlyDescription = /^battery\s*\d{2,3}%([\s\u00b7.-]+never fixed)?$/i.test(existingDescription);

  if (existingDescription && !isLegacyDescription && !isBatteryOnlyDescription) {
    return existingDescription;
  }

  const label = product.condition === 'used' ? 'Pre-owned' : 'Brand new';
  const leadSegments = [label, normalizeText(product.model)];
  if (derived.storage) {
    leadSegments.push(`with ${derived.storage}`);
  }
  if (derived.color) {
    leadSegments.push(`in ${derived.color}`);
  }

  const sentences = [`${leadSegments.join(' ')}.`];

  if (derived.connectivity) {
    sentences.push(`${derived.connectivity} model.`);
  }
  if (derived.accessoriesIncluded) {
    sentences.push(`Includes ${derived.accessoriesIncluded.toLowerCase()}.`);
  }
  if (derived.warranty) {
    sentences.push(`${derived.warranty}.`);
  }
  if (derived.batteryHealth != null) {
    sentences.push(`Battery health ${derived.batteryHealth}%.`);
  }
  if (derived.repairHistory) {
    sentences.push(`${derived.repairHistory}.`);
  }

  return normalizeText(sentences.join(' '));
}

function setIfChanged(patch, key, nextValue, currentValue) {
  if (nextValue === undefined) {
    return;
  }

  if (typeof nextValue === 'number') {
    if (nextValue !== Number(currentValue)) {
      patch[key] = nextValue;
    }
    return;
  }

  const nextNormalized = normalizeText(nextValue);
  const currentNormalized = normalizeText(currentValue);
  if (nextNormalized !== currentNormalized) {
    patch[key] = nextValue;
  }
}

function buildPatch(product) {
  const brand = deriveBrand(product.model);
  const classification = classifyProduct(product);
  const storage = normalizeStorage(product.storage);
  const colorDetails = extractColorDetails(product.color);
  const accessoriesIncluded = extractAccessories(product.model, product.description, product.color, product.accessories_included);
  const batteryHealth = extractBatteryHealth(product.description, product.color, product.battery_health);
  const repairHistory = extractRepairHistory(product.description, product.color, product.repair_history) || colorDetails.repairHistory;
  const warranty = extractWarranty(product, product.description, product.color);
  const releaseYear = extractReleaseYear(product.model, product.description, product.release_year);
  const itemGroupId = buildItemGroupId(product, brand);

  const derived = {
    storage,
    color: colorDetails.color ?? normalizeText(product.color),
    connectivity: colorDetails.connectivity,
    accessoriesIncluded: accessoriesIncluded || colorDetails.accessoriesIncluded,
    batteryHealth,
    repairHistory,
    warranty,
    releaseYear,
  };

  const description = buildDescription(product, derived);
  const patch = { id: product.id };

  setIfChanged(patch, 'brand', brand, product.brand);
  setIfChanged(patch, 'product_type', classification.productType, product.product_type);
  setIfChanged(patch, 'google_product_category', classification.googleProductCategory, product.google_product_category);
  setIfChanged(patch, 'item_group_id', itemGroupId, product.item_group_id);
  setIfChanged(patch, 'storage', storage, product.storage);
  setIfChanged(patch, 'color', colorDetails.color ?? normalizeText(product.color), product.color);
  setIfChanged(patch, 'warranty', warranty, product.warranty);
  setIfChanged(patch, 'accessories_included', derived.accessoriesIncluded, product.accessories_included);
  setIfChanged(patch, 'repair_history', repairHistory, product.repair_history);
  setIfChanged(patch, 'battery_health', batteryHealth, product.battery_health);
  setIfChanged(patch, 'release_year', releaseYear, product.release_year);
  setIfChanged(patch, 'description', description, product.description);

  return Object.keys(patch).length > 1 ? patch : null;
}

async function fetchProducts(siteUrl, condition) {
  const response = await fetch(`${siteUrl}/api/products?condition=${condition}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${condition} products (${response.status})`);
  }

  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}

async function main() {
  const siteUrl = normalizeSiteUrl(process.env.PZM_SITE_URL);
  const outputPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.resolve('scripts/product-metadata-backfill-2026-04-10.json');

  const [newProducts, usedProducts] = await Promise.all([
    fetchProducts(siteUrl, 'new'),
    fetchProducts(siteUrl, 'used'),
  ]);

  const seen = new Set();
  const allProducts = [...newProducts, ...usedProducts].filter((product) => {
    if (!product?.id || seen.has(product.id)) {
      return false;
    }
    seen.add(product.id);
    return true;
  });

  const patches = allProducts
    .map(buildPatch)
    .filter(Boolean)
    .sort((left, right) => String(left.id).localeCompare(String(right.id)));

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceSite: siteUrl,
    productCount: patches.length,
    products: patches,
  };

  await fs.writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${patches.length} product updates to ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});