import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_SITE_URL = 'https://pzm.ae';
const PLACEHOLDER_COLORS = new Set(['contact us', 'color options', 'various options']);
const DESCRIPTION_REPLACEMENTS = [
  [/contact us for the exact edition in stock\.?/gi, 'Contact us for the exact edition.'],
  [/contact us for the latest stock details\.?/gi, 'Contact us for the latest details.'],
  [/contact us for the latest color availability\.?/gi, 'Contact us for color options.'],
  [/\s+and multiple units available\.?/gi, '.'],
  [/\s+with multiple units available\.?/gi, '.'],
];
const CONDITION_COLOR_PATTERNS = [
  /condition/i,
  /^open box$/i,
  /^used laptop$/i,
  /^official warranty$/i,
  /^retail stock$/i,
  /^latest stock$/i,
  /^contact for color$/i,
  /^with keyboard$/i,
  /^\d+\+?\s*pcs available$/i,
];

function normalizeSiteUrl(value) {
  return (value || DEFAULT_SITE_URL).replace(/\/+$/, '');
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanText(value) {
  return normalizeText(value)
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/\.\s*\./g, '.')
    .trim();
}

function sanitizeDescription(value) {
  let nextValue = normalizeText(value);

  for (const [pattern, replacement] of DESCRIPTION_REPLACEMENTS) {
    nextValue = nextValue.replace(pattern, replacement);
  }

  return cleanText(nextValue);
}

function normalizeForComparison(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function containsFact(haystack, needle) {
  if (!needle) {
    return false;
  }

  return normalizeForComparison(haystack).includes(normalizeForComparison(needle));
}

function toSentence(value) {
  const normalized = cleanText(value);
  if (!normalized) {
    return '';
  }

  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function titleCase(value) {
  return normalizeText(value)
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

function sentenceCase(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) {
    return '';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function looksLikeConditionColor(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return false;
  }

  return CONDITION_COLOR_PATTERNS.some((pattern) => pattern.test(normalized));
}

function getDisplayColor(product) {
  const color = normalizeText(product.color);
  if (!color || PLACEHOLDER_COLORS.has(color.toLowerCase()) || looksLikeConditionColor(color)) {
    return '';
  }

  return color;
}

function getConditionDescriptor(product) {
  const color = normalizeText(product.color);
  if (!looksLikeConditionColor(color)) {
    return '';
  }

  return sentenceCase(color);
}

function getStorageDescriptor(product) {
  const storage = normalizeText(product.storage);
  if (!storage) {
    return '';
  }

  if (/^(official warranty|retail stock|latest stock|contact for color|used laptop)$/i.test(storage)) {
    return '';
  }

  return storage;
}

function getStorageMagnitude(value) {
  const match = normalizeText(value).match(/(\d+)(?:\+\d+)?\s*(gb|tb)/i);
  if (!match) {
    return 0;
  }

  const numericValue = Number(match[1]);
  return match[2].toLowerCase() === 'tb' ? numericValue * 1024 : numericValue;
}

function parseStorageConfiguration(storage) {
  const parts = normalizeText(storage)
    .split('/')
    .map((part) => normalizeText(part))
    .filter(Boolean);

  if (parts.length !== 2) {
    return null;
  }

  const [leftPart, rightPart] = parts;
  let memoryPart = '';
  let storagePart = '';

  if (/ram/i.test(leftPart)) {
    memoryPart = leftPart;
    storagePart = rightPart;
  } else if (/ram/i.test(rightPart)) {
    memoryPart = rightPart;
    storagePart = leftPart;
  } else if (leftPart.includes('+') && /\b\d+\s*(gb|tb)\b/i.test(rightPart)) {
    memoryPart = leftPart;
    storagePart = rightPart;
  } else if (rightPart.includes('+') && /\b\d+\s*(gb|tb)\b/i.test(leftPart)) {
    memoryPart = rightPart;
    storagePart = leftPart;
  } else {
    const leftMagnitude = getStorageMagnitude(leftPart);
    const rightMagnitude = getStorageMagnitude(rightPart);

    if (leftMagnitude > 0 && rightMagnitude > 0 && leftMagnitude !== rightMagnitude) {
      memoryPart = leftMagnitude < rightMagnitude ? leftPart : rightPart;
      storagePart = leftMagnitude < rightMagnitude ? rightPart : leftPart;
    }
  }

  if (!memoryPart || !storagePart) {
    return null;
  }

  return {
    memoryPart,
    storagePart,
  };
}

function formatMemoryPart(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return '';
  }

  if (/ram/i.test(normalized)) {
    return normalized.replace(/ram/gi, 'RAM');
  }

  if (normalized.includes('+')) {
    return `${normalized} memory`;
  }

  return `${normalized} RAM`;
}

function formatStoragePart(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return '';
  }

  return /storage/i.test(normalized) ? normalized : `${normalized} storage`;
}

function buildStorageSentence(storage, baseDescription) {
  if (!storage) {
    return '';
  }

  const parsedConfiguration = parseStorageConfiguration(storage);
  if (parsedConfiguration) {
    const segments = [];
    const memoryPart = formatMemoryPart(parsedConfiguration.memoryPart);
    const storagePart = formatStoragePart(parsedConfiguration.storagePart);

    if (memoryPart && !containsFact(baseDescription, parsedConfiguration.memoryPart) && !containsFact(baseDescription, memoryPart)) {
      segments.push(memoryPart);
    }

    if (storagePart && !containsFact(baseDescription, parsedConfiguration.storagePart) && !containsFact(baseDescription, storagePart)) {
      segments.push(storagePart);
    }

    if (segments.length === 0) {
      return '';
    }

    return `Configured with ${segments.join(' and ')}`;
  }

  if (/ram/i.test(storage) || storage.includes('/')) {
    return `Configured with ${storage}`;
  }

  if (/\b\d+\s*(gb|tb)\b/i.test(storage)) {
    return `Configured with ${storage} storage`;
  }

  return `Configured with ${storage}`;
}

function buildConnectivitySentence(product) {
  const model = normalizeText(product.model);

  if (/\(eSIM\s*\+\s*Physical SIM\)/i.test(model)) {
    return 'eSIM plus physical SIM support';
  }

  if (/\(Middle East eSIM\)/i.test(model)) {
    return 'Middle East eSIM edition';
  }

  return '';
}

function buildBaseDescription(product) {
  const prefix = product.condition === 'used' ? 'Pre-owned' : 'Brand new';
  const storage = getStorageDescriptor(product);
  const color = getDisplayColor(product);
  const parts = [`${prefix} ${normalizeText(product.model)}`];

  if (storage) {
    if (/ram/i.test(storage) || storage.includes('/')) {
      parts.push(`with ${storage} configuration`);
    } else {
      parts.push(`with ${storage} storage`);
    }
  }

  if (color) {
    parts.push(`in ${color}`);
  }

  return toSentence(parts.join(' '));
}

function buildDescription(product) {
  const baseDescription = sanitizeDescription(product.description) || buildBaseDescription(product);
  const additions = [];
  const storage = getStorageDescriptor(product);
  const color = getDisplayColor(product);
  const connectivity = buildConnectivitySentence(product);
  const conditionDescriptor = getConditionDescriptor(product);

  if (storage && !containsFact(baseDescription, storage)) {
    additions.push(buildStorageSentence(storage, baseDescription));
  }

  if (color && !containsFact(baseDescription, color)) {
    additions.push(`Finished in ${color}`);
  }

  if (connectivity && !containsFact(baseDescription, connectivity)) {
    additions.push(connectivity);
  }

  if (conditionDescriptor && !containsFact(baseDescription, conditionDescriptor)) {
    additions.push(conditionDescriptor);
  }

  if (product.battery_health != null && !containsFact(baseDescription, `battery health ${product.battery_health}`)) {
    additions.push(`Battery health ${product.battery_health}%`);
  }

  if (normalizeText(product.cosmetic_grade) && !containsFact(baseDescription, product.cosmetic_grade)) {
    additions.push(`Cosmetic grade ${normalizeText(product.cosmetic_grade)}`);
  }

  if (normalizeText(product.repair_history) && !containsFact(baseDescription, product.repair_history)) {
    additions.push(`Repair history: ${normalizeText(product.repair_history)}`);
  }

  if (normalizeText(product.accessories_included) && !containsFact(baseDescription, product.accessories_included)) {
    additions.push(`Includes ${normalizeText(product.accessories_included)}`);
  }

  if (normalizeText(product.warranty) && !containsFact(baseDescription, 'warranty') && !containsFact(baseDescription, product.warranty)) {
    additions.push(normalizeText(product.warranty));
  }

  if (product.release_year && !containsFact(baseDescription, String(product.release_year))) {
    additions.push(`Released ${product.release_year}`);
  }

  return cleanText([baseDescription, ...additions.map((value) => toSentence(value))].filter(Boolean).join(' '));
}

function parseCsv(content) {
  const rows = [];
  let field = '';
  let row = [];
  let index = 0;
  let inQuotes = false;

  while (index < content.length) {
    const character = content[index];

    if (character === '"') {
      const nextCharacter = content[index + 1];

      if (inQuotes && nextCharacter === '"') {
        field += '"';
        index += 2;
        continue;
      }

      inQuotes = !inQuotes;
      index += 1;
      continue;
    }

    if (!inQuotes && character === ',') {
      row.push(field);
      field = '';
      index += 1;
      continue;
    }

    if (!inQuotes && (character === '\n' || character === '\r')) {
      if (character === '\r' && content[index + 1] === '\n') {
        index += 1;
      }

      row.push(field);
      field = '';
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      index += 1;
      continue;
    }

    field += character;
    index += 1;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

function rowsToRecords(rows) {
  const headerIndex = rows.findIndex((row) => row[0] === 'Product' && row[1] === 'Product ID');
  if (headerIndex === -1) {
    throw new Error('CSV header row was not found.');
  }

  const headers = rows[headerIndex];
  const dataRows = rows.slice(headerIndex + 1).filter((row) => row.some((value) => normalizeText(value)));

  return dataRows.map((row) => {
    const record = {};

    headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });

    return record;
  });
}

async function fetchLiveProducts(siteUrl) {
  const response = await fetch(`${siteUrl}/api/products`);
  if (!response.ok) {
    throw new Error(`Failed to fetch live products (${response.status})`);
  }

  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}

function formatDateStamp(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseArgs(argv) {
  const options = {
    siteUrl: normalizeSiteUrl(process.env.PZM_SITE_URL || DEFAULT_SITE_URL),
  };

  for (let index = 2; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--site-url') {
      options.siteUrl = normalizeSiteUrl(argv[index + 1]);
      index += 1;
      continue;
    }

    if (argument === '--output') {
      options.outputPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (argument === '--report') {
      options.reportPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (!options.csvPath) {
      options.csvPath = path.resolve(argument);
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!options.csvPath) {
    throw new Error('Usage: node scripts/generate-merchant-description-manifest.mjs <merchant-issues.csv> [--output path] [--report path] [--site-url https://pzm.ae]');
  }

  const dateStamp = formatDateStamp();
  const scriptsDir = path.resolve('scripts');
  options.outputPath ||= path.join(scriptsDir, `product-sync.merchant-description-remediation-${dateStamp}.json`);
  options.reportPath ||= path.join(scriptsDir, `merchant-description-remediation-report-${dateStamp}.md`);

  return options;
}

async function main() {
  const { csvPath, outputPath, reportPath, siteUrl } = parseArgs(process.argv);
  const csvContent = await fs.readFile(csvPath, 'utf8');
  const csvRows = rowsToRecords(parseCsv(csvContent));
  const liveProducts = await fetchLiveProducts(siteUrl);
  const liveProductsById = new Map(liveProducts.map((product) => [String(product.id || '').trim(), product]));
  const manifest = { products: [] };
  const skipped = {
    nonCatalogIds: [],
    missingLiveProducts: [],
    unchangedDescriptions: [],
  };

  for (const row of csvRows) {
    const productId = normalizeText(row['Product ID']);
    if (!productId) {
      continue;
    }

    if (!productId.startsWith('prod-')) {
      skipped.nonCatalogIds.push({ productId, product: normalizeText(row.Product) });
      continue;
    }

    const liveProduct = liveProductsById.get(productId);
    if (!liveProduct) {
      skipped.missingLiveProducts.push({ productId, product: normalizeText(row.Product) });
      continue;
    }

    const currentDescription = sanitizeDescription(liveProduct.description);
    const nextDescription = buildDescription(liveProduct);

    if (!nextDescription || nextDescription === currentDescription) {
      skipped.unchangedDescriptions.push({ productId, product: normalizeText(row.Product) });
      continue;
    }

    manifest.products.push({
      id: productId,
      description: nextDescription,
    });
  }

  await fs.writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const reportLines = [
    '# Merchant Description Remediation Report',
    '',
    `- Source CSV: ${csvPath}`,
    `- Site URL: ${siteUrl}`,
    `- Total CSV rows: ${csvRows.length}`,
    `- Description updates generated: ${manifest.products.length}`,
    `- Non-catalog IDs skipped: ${skipped.nonCatalogIds.length}`,
    `- Missing live products skipped: ${skipped.missingLiveProducts.length}`,
    `- Rows unchanged after verified-data enrichment: ${skipped.unchangedDescriptions.length}`,
    '',
    '## Non-catalog IDs',
    '',
    ...(skipped.nonCatalogIds.length > 0
      ? skipped.nonCatalogIds.map((item) => `- ${item.productId} — ${item.product}`)
      : ['- None.']),
    '',
    '## Missing Live Products',
    '',
    ...(skipped.missingLiveProducts.length > 0
      ? skipped.missingLiveProducts.map((item) => `- ${item.productId} — ${item.product}`)
      : ['- None.']),
    '',
    '## Unchanged Rows',
    '',
    ...(skipped.unchangedDescriptions.length > 0
      ? skipped.unchangedDescriptions.map((item) => `- ${item.productId} — ${item.product}`)
      : ['- None.']),
  ];

  await fs.writeFile(reportPath, `${reportLines.join('\n')}\n`, 'utf8');

  console.log(`Wrote ${manifest.products.length} description updates to ${outputPath}`);
  console.log(`Wrote remediation report to ${reportPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});