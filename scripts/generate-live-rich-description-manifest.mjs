import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SITE_URL = 'https://pzm.ae';
const DEFAULT_MIN_DESCRIPTION_LENGTH = 90;
const PLACEHOLDER_COLORS = new Set(['contact us', 'color options', 'various options']);
const DESCRIPTION_REPLACEMENTS = [
  [/contact us for the exact edition in stock\.?/gi, 'Contact us for the exact edition.'],
  [/contact us for the latest stock details\.?/gi, 'Contact us for the latest details.'],
  [/contact us for the latest color availability\.?/gi, 'Contact us for color options.'],
  [/\s+and multiple units available\.?/gi, '.'],
  [/\s+with multiple units available\.?/gi, '.'],
];
const BRAND_PATTERNS = [
  [/^iphone|^ipad/i, 'Apple'],
  [/^macbook/i, 'Apple'],
  [/^samsung|^galaxy/i, 'Samsung'],
  [/^honor/i, 'Honor'],
  [/^nokia/i, 'Nokia'],
  [/^tecno/i, 'Tecno'],
  [/^playstation|^ps[45]/i, 'PlayStation'],
  [/^xbox/i, 'Xbox'],
  [/^nintendo/i, 'Nintendo'],
  [/^hp\b/i, 'HP'],
  [/^lenovo/i, 'Lenovo'],
  [/^dell/i, 'Dell'],
  [/^alienware/i, 'Alienware'],
  [/^asus|^rog\b/i, 'ASUS'],
  [/^aorus/i, 'AORUS'],
  [/^microsoft|^surface/i, 'Microsoft'],
  [/^huawei|^matepad/i, 'Huawei'],
  [/^redmi|^xiaomi/i, 'Xiaomi'],
  [/^lg\b/i, 'LG'],
  [/^gaming pc/i, 'Gaming PC'],
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function printUsage() {
  console.log(`Usage: node scripts/generate-live-rich-description-manifest.mjs [options]

Options:
  --site-url <url>           Optional. Defaults to https://pzm.ae or PZM_SITE_URL.
  --output <path>            Optional. Defaults to scripts/product-sync.rich-description-backfill[-label]-YYYY-MM-DD.json
  --report <path>            Optional. Defaults to scripts/rich-description-backfill-report[-label]-YYYY-MM-DD.md
  --label <slug>             Optional. Adds a stable label to the default output/report names.
  --condition <new|used>     Optional. Filters emitted rows by live condition.
  --brand <name>             Optional. Case-insensitive brand filter.
  --model-query <text>       Optional. Case-insensitive model substring filter.
  --ids <id1,id2,...>        Optional. Comma-separated product IDs to include.
  --offset <number>          Optional. Candidate window offset. Defaults to 0.
  --limit <number>           Optional. Candidate window size for small batches.
  --min-length <number>      Optional. Minimum target description length. Defaults to 90.
  --force                    Optional. Bypass quality guards and apply whenever generated text differs from stored.
`);
}

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
  if (!value) {
    return '';
  }

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

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseInteger(value, flagName) {
  const parsed = Number.parseInt(String(value || '').trim(), 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${flagName} must be a non-negative integer.`);
  }

  return parsed;
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
    minDescriptionLength: DEFAULT_MIN_DESCRIPTION_LENGTH,
    offset: 0,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help' || argument === '-h') {
      printUsage();
      process.exit(0);
    }

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

    if (argument === '--label') {
      options.label = slugify(argv[index + 1]);
      index += 1;
      continue;
    }

    if (argument === '--condition') {
      options.condition = normalizeText(argv[index + 1]).toLowerCase();
      index += 1;
      continue;
    }

    if (argument === '--brand') {
      options.brand = normalizeText(argv[index + 1]);
      index += 1;
      continue;
    }

    if (argument === '--model-query') {
      options.modelQuery = normalizeText(argv[index + 1]);
      index += 1;
      continue;
    }

    if (argument === '--ids') {
      options.ids = new Set(
        String(argv[index + 1] || '')
          .split(',')
          .map((value) => normalizeText(value))
          .filter(Boolean)
      );
      index += 1;
      continue;
    }

    if (argument === '--offset') {
      options.offset = parseInteger(argv[index + 1], '--offset');
      index += 1;
      continue;
    }

    if (argument === '--limit') {
      options.limit = parseInteger(argv[index + 1], '--limit');
      index += 1;
      continue;
    }

    if (argument === '--min-length') {
      options.minDescriptionLength = parseInteger(argv[index + 1], '--min-length');
      index += 1;
      continue;
    }

    if (argument === '--force') {
      options.force = true;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (options.condition && !['new', 'used'].includes(options.condition)) {
    throw new Error('--condition must be either new or used.');
  }

  const dateStamp = formatDateStamp();
  const labelSuffix = options.label ? `.${options.label}` : '';
  options.outputPath ||= path.join(__dirname, `product-sync.rich-description-backfill${labelSuffix}-${dateStamp}.json`);
  options.reportPath ||= path.join(__dirname, `rich-description-backfill-report${labelSuffix}-${dateStamp}.md`);

  return options;
}

function sanitizeProductColor(color) {
  const trimmedColor = normalizeText(color);
  if (!trimmedColor) {
    return '';
  }

  return trimmedColor;
}

function isPlaceholderColor(color) {
  return PLACEHOLDER_COLORS.has(normalizeText(color).toLowerCase());
}

function buildProductDisplayLabel(product) {
  const color = sanitizeProductColor(product.color);
  const segments = [normalizeText(product.model), normalizeText(product.storage)];

  if (color && !isPlaceholderColor(color)) {
    segments.push(color);
  }

  return cleanText(segments.filter(Boolean).join(' ')) || normalizeText(product.model) || normalizeText(product.id);
}

function buildProductFallbackHighlights(product) {
  const highlights = [];

  if (product.release_year) highlights.push(`Released ${product.release_year}.`);
  if (product.battery_health != null) highlights.push(`Battery health ${product.battery_health}%.`);
  if (normalizeText(product.cosmetic_grade)) highlights.push(`Cosmetic grade ${normalizeText(product.cosmetic_grade)}.`);
  if (normalizeText(product.repair_history)) highlights.push(normalizeText(product.repair_history));
  if (normalizeText(product.accessories_included)) highlights.push(`Includes ${normalizeText(product.accessories_included)}.`);
  if (normalizeText(product.warranty)) highlights.push(normalizeText(product.warranty));

  return highlights;
}

function buildProductRichDescription(product) {
  const description = sanitizeDescription(product.description);
  const label = buildProductDisplayLabel(product);
  const modelToken = normalizeText(product.model || '').toLowerCase();
  const descLower = normalizeText(description || '').toLowerCase();

  // Detect model-name duplication: if model appears ≥ 2 times in the stored description,
  // regenerate from scratch using structured fields regardless of description length.
  const modelOccurrences = modelToken
    ? (descLower.match(new RegExp(modelToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
    : 0;
  const hasDuplication = modelOccurrences >= 2;

  if (!hasDuplication && description && description.length >= DEFAULT_MIN_DESCRIPTION_LENGTH) {
    return description;
  }

  // For short descriptions (< threshold) or duplicative ones, build from structured fields.
  // Don't prepend the short stored description when it already names the model — that would
  // duplicate the model token again after the label is appended as fallback.
  const shortDescContainsModel = modelToken && descLower.includes(modelToken);
  const prefix = (description && !shortDescContainsModel) ? description : null;

  const fallbackDescription = [
    `${label} from PZM Computers & Phones in Dubai with direct WhatsApp ordering, Cash on Delivery, and UAE delivery support.`,
    product.condition === 'used'
      ? 'Certified pre-owned and checked by the store team.'
      : 'Brand-new stock with local retail support.',
  ].join(' ');

  return cleanText([prefix, fallbackDescription, ...buildProductFallbackHighlights(product)].filter(Boolean).join(' ')) || label;
}

function inferBrand(model) {
  const normalizedModel = normalizeText(model);

  for (const [pattern, brand] of BRAND_PATTERNS) {
    if (pattern.test(normalizedModel)) {
      return brand;
    }
  }

  return 'Unknown';
}

function resolveBrand(product) {
  return normalizeText(product.brand) || inferBrand(product.model);
}

async function fetchLiveProducts(siteUrl) {
  const response = await fetch(`${siteUrl}/api/products`);
  if (!response.ok) {
    throw new Error(`Failed to fetch live products (${response.status})`);
  }

  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}

function matchesFilters(product, options) {
  const productId = normalizeText(product.id);
  const brand = resolveBrand(product);
  const model = normalizeText(product.model);

  if (!productId.startsWith('prod-')) {
    return false;
  }

  if (options.ids && !options.ids.has(productId)) {
    return false;
  }

  if (options.condition && normalizeText(product.condition).toLowerCase() !== options.condition) {
    return false;
  }

  if (options.brand && normalizeForComparison(brand) !== normalizeForComparison(options.brand)) {
    return false;
  }

  if (options.modelQuery && !normalizeForComparison(model).includes(normalizeForComparison(options.modelQuery))) {
    return false;
  }

  return true;
}

function buildCandidateGroup(candidate) {
  return `${candidate.condition || 'unknown'} / ${candidate.brand || 'Unknown'}`;
}

function compareCandidates(left, right) {
  const conditionOrder = { new: 0, used: 1 };
  const leftCondition = conditionOrder[left.condition] ?? 99;
  const rightCondition = conditionOrder[right.condition] ?? 99;

  return leftCondition - rightCondition
    || left.brand.localeCompare(right.brand)
    || left.model.localeCompare(right.model)
    || left.id.localeCompare(right.id);
}

function buildGroupCounts(candidates) {
  const counts = new Map();

  for (const candidate of candidates) {
    const group = buildCandidateGroup(candidate);
    counts.set(group, (counts.get(group) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

function renderRowLine(row) {
  return `- ${row.id} — ${row.model} [${row.condition}] ${row.currentLength ?? 0} -> ${row.nextLength ?? 0} chars`;
}

function renderSkippedLine(row, reason) {
  return `- ${row.id} — ${row.model} [${row.condition}]${reason ? ` (${reason})` : ''}`;
}

function summarizeRow(product, extra = {}) {
  return {
    id: product.id,
    model: product.model,
    brand: product.brand,
    condition: product.condition,
    ...extra,
  };
}

async function main() {
  const options = parseArgs(process.argv);
  const liveProducts = await fetchLiveProducts(options.siteUrl);
  const candidates = [];
  const skipped = {
    liveAlreadyQualified: [],
    generatedBelowThreshold: [],
    unchangedOrNotImproved: [],
  };

  for (const liveProduct of liveProducts) {
    if (!matchesFilters(liveProduct, options)) {
      continue;
    }

    const normalizedProduct = {
      id: normalizeText(liveProduct.id),
      model: normalizeText(liveProduct.model),
      brand: resolveBrand(liveProduct),
      condition: normalizeText(liveProduct.condition).toLowerCase(),
    };
    const currentDescription = sanitizeDescription(liveProduct.description);
    const nextDescription = buildProductRichDescription(liveProduct);
    const currentLength = currentDescription.length;
    const nextLength = nextDescription.length;

    if (!options.force && currentLength >= options.minDescriptionLength) {
      skipped.liveAlreadyQualified.push(summarizeRow(normalizedProduct, { currentLength }));
      continue;
    }

    if (!options.force && nextLength < options.minDescriptionLength) {
      skipped.generatedBelowThreshold.push(summarizeRow(normalizedProduct, { currentLength, nextLength }));
      continue;
    }

    if (!nextDescription || nextDescription === currentDescription) {
      skipped.unchangedOrNotImproved.push(summarizeRow(normalizedProduct, { currentLength, nextLength }));
      continue;
    }

    candidates.push({
      ...normalizedProduct,
      currentDescription,
      nextDescription,
      currentLength,
      nextLength,
    });
  }

  candidates.sort(compareCandidates);

  const offset = Math.min(options.offset, candidates.length);
  const emittedCandidates = options.limit != null
    ? candidates.slice(offset, offset + options.limit)
    : candidates.slice(offset);
  const remainingCandidates = options.limit != null
    ? candidates.slice(offset + options.limit)
    : [];

  const manifest = {
    products: emittedCandidates.map((candidate) => ({
      id: candidate.id,
      description: candidate.nextDescription,
    })),
  };

  await fs.writeFile(options.outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const groupCounts = buildGroupCounts(candidates);
  const filterSummary = [
    options.condition ? `condition=${options.condition}` : null,
    options.brand ? `brand=${options.brand}` : null,
    options.modelQuery ? `model-query=${options.modelQuery}` : null,
    options.ids ? `ids=${Array.from(options.ids).join(',')}` : null,
    options.limit != null ? `limit=${options.limit}` : null,
    options.offset ? `offset=${options.offset}` : null,
  ].filter(Boolean).join(', ') || 'none';

  const reportSections = [
    '# Live Rich Description Backfill Report',
    '',
    `- Site URL: ${options.siteUrl}`,
    `- Minimum target description length: ${options.minDescriptionLength}`,
    `- Filters: ${filterSummary}`,
    `- Live products fetched: ${liveProducts.length}`,
    `- Eligible candidate updates: ${candidates.length}`,
    `- Updates emitted in this manifest: ${emittedCandidates.length}`,
    `- Remaining eligible rows after this batch window: ${remainingCandidates.length}`,
    `- Live rows already qualified skipped: ${skipped.liveAlreadyQualified.length}`,
    `- Generated rows below threshold skipped: ${skipped.generatedBelowThreshold.length}`,
    `- Rows unchanged or not improved skipped: ${skipped.unchangedOrNotImproved.length}`,
    '',
    '## Candidate Groups',
    '',
    ...(groupCounts.length > 0 ? groupCounts.map(([group, count]) => `- ${group}: ${count}`) : ['- None.']),
    '',
    '## Emitted Updates',
    '',
    ...(emittedCandidates.length > 0 ? emittedCandidates.map(renderRowLine) : ['- None.']),
    '',
    '## Remaining Eligible Rows',
    '',
    ...(remainingCandidates.length > 0 ? remainingCandidates.map(renderRowLine) : ['- None.']),
    '',
    '## Generated Rows Below Threshold',
    '',
    ...(skipped.generatedBelowThreshold.length > 0
      ? skipped.generatedBelowThreshold.map((row) => renderSkippedLine(row, `${row.currentLength ?? 0} -> ${row.nextLength ?? 0} chars`))
      : ['- None.']),
    '',
    '## Live Rows Already Qualified',
    '',
    ...(skipped.liveAlreadyQualified.length > 0
      ? skipped.liveAlreadyQualified.slice(0, 25).map((row) => renderSkippedLine(row, `${row.currentLength ?? 0} chars`))
      : ['- None.']),
  ];

  if (skipped.liveAlreadyQualified.length > 25) {
    reportSections.push('', `- ${skipped.liveAlreadyQualified.length - 25} more already-qualified rows omitted from this section.`);
  }

  reportSections.push(
    '',
    '## Rows Unchanged Or Not Improved',
    '',
    ...(skipped.unchangedOrNotImproved.length > 0
      ? skipped.unchangedOrNotImproved.map((row) => renderSkippedLine(row, `${row.currentLength ?? 0} -> ${row.nextLength ?? 0} chars`))
      : ['- None.']),
    ''
  );

  await fs.writeFile(options.reportPath, reportSections.join('\n'), 'utf8');

  console.log(`Wrote ${manifest.products.length} description updates to ${options.outputPath}`);
  console.log(`Wrote backfill report to ${options.reportPath}`);
  console.log(`Eligible candidates available: ${candidates.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});