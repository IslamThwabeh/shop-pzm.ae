import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SITE_URL = 'https://pzm.ae';
const DEFAULT_MIN_DESCRIPTION_LENGTH = 90;
const DESCRIPTION_REPLACEMENTS = [
  [/contact us for the exact edition in stock\.?/gi, 'Contact us for the exact edition.'],
  [/contact us for the latest stock details\.?/gi, 'Contact us for the latest details.'],
  [/contact us for the latest color availability\.?/gi, 'Contact us for color options.'],
  [/\s+and multiple units available\.?/gi, '.'],
  [/\s+with multiple units available\.?/gi, '.'],
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const scriptsDir = path.resolve(__dirname);

function printUsage() {
  console.log(`Usage: node scripts/generate-live-description-backfill-manifest.mjs [options]

Options:
  --site-url <url>           Optional. Defaults to https://pzm.ae or PZM_SITE_URL.
  --snapshot <path>          Optional. Defaults to the latest repo-root products_*.tsv snapshot.
  --output <path>            Optional. Defaults to scripts/product-sync.description-backfill[-label]-YYYY-MM-DD.json
  --report <path>            Optional. Defaults to scripts/description-backfill-report[-label]-YYYY-MM-DD.md
  --label <slug>             Optional. Adds a stable label to the default output/report names.
  --condition <new|used>     Optional. Filters emitted rows by live condition.
  --brand <name>             Optional. Case-insensitive brand filter.
  --model-query <text>       Optional. Case-insensitive model substring filter.
  --ids <id1,id2,...>        Optional. Comma-separated product IDs to include.
  --offset <number>          Optional. Candidate window offset. Defaults to 0.
  --limit <number>           Optional. Candidate window size for 10-20 item batches.
  --min-length <number>      Optional. Minimum target description length. Defaults to 90.
  --include-below-threshold  Optional. Allows snapshot descriptions shorter than the minimum length.
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

function getDescriptionLength(value) {
  return sanitizeDescription(value).length;
}

function formatDateStamp(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

async function findLatestSnapshotPath(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const snapshotEntry = entries
    .filter((entry) => entry.isFile() && /^products_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.tsv$/i.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name))
    .at(-1);

  if (!snapshotEntry) {
    throw new Error('No repo-root products_*.tsv snapshot was found.');
  }

  return path.join(rootDir, snapshotEntry.name);
}

function parseArgs(argv) {
  const options = {
    siteUrl: normalizeSiteUrl(process.env.PZM_SITE_URL || DEFAULT_SITE_URL),
    minDescriptionLength: DEFAULT_MIN_DESCRIPTION_LENGTH,
    offset: 0,
    includeBelowThreshold: false,
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

    if (argument === '--snapshot') {
      options.snapshotPath = path.resolve(argv[index + 1]);
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

    if (argument === '--include-below-threshold') {
      options.includeBelowThreshold = true;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (options.condition && !['new', 'used'].includes(options.condition)) {
    throw new Error('--condition must be either new or used.');
  }

  const dateStamp = formatDateStamp();
  const labelSuffix = options.label ? `.${options.label}` : '';
  options.outputPath ||= path.join(scriptsDir, `product-sync.description-backfill${labelSuffix}-${dateStamp}.json`);
  options.reportPath ||= path.join(scriptsDir, `description-backfill-report${labelSuffix}-${dateStamp}.md`);

  return options;
}

function parseDelimitedLine(line, delimiter) {
  const values = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        field += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && character === delimiter) {
      values.push(field);
      field = '';
      continue;
    }

    field += character;
  }

  values.push(field);
  return values;
}

function parseSnapshotRows(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .map((line) => parseDelimitedLine(line, '\t'));
}

function rowsToRecords(rows) {
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => normalizeText(header));

  return rows.slice(1).map((row) => {
    const record = {};

    headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });

    return record;
  });
}

async function loadSnapshotProducts(snapshotPath) {
  const source = await fs.readFile(snapshotPath, 'utf8');
  const rows = rowsToRecords(parseSnapshotRows(source));
  const products = rows
    .map((record) => ({
      id: normalizeText(record.id),
      model: normalizeText(record.title),
      condition: normalizeText(record.condition).toLowerCase(),
      brand: normalizeText(record.brand),
      description: sanitizeDescription(record.description),
    }))
    .filter((product) => product.id.startsWith('prod-'));

  return new Map(products.map((product) => [product.id, product]));
}

async function fetchLiveProducts(siteUrl) {
  const response = await fetch(`${siteUrl}/api/products`);
  if (!response.ok) {
    throw new Error(`Failed to fetch live products (${response.status})`);
  }

  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}

function resolveBrand(liveProduct, snapshotProduct) {
  return normalizeText(liveProduct.brand || snapshotProduct?.brand || 'Unknown');
}

function resolveModel(liveProduct, snapshotProduct) {
  return normalizeText(liveProduct.model || snapshotProduct?.model || liveProduct.id);
}

function buildCandidateGroup(product) {
  return `${product.condition || 'unknown'} / ${product.brand || 'Unknown'}`;
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

function matchesFilters(liveProduct, snapshotProduct, options) {
  const productId = normalizeText(liveProduct.id);
  const brand = resolveBrand(liveProduct, snapshotProduct);
  const model = resolveModel(liveProduct, snapshotProduct);

  if (!productId.startsWith('prod-')) {
    return false;
  }

  if (options.ids && !options.ids.has(productId)) {
    return false;
  }

  if (options.condition && normalizeText(liveProduct.condition).toLowerCase() !== options.condition) {
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

function createSkippedBuckets() {
  return {
    missingSnapshot: [],
    ambiguousRows: [],
    missingSnapshotDescription: [],
    snapshotDescriptionTooShort: [],
    liveAlreadyQualified: [],
    unchangedOrNotImproved: [],
  };
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

function pushSkipped(bucket, product, extra) {
  bucket.push(summarizeRow(product, extra));
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

async function main() {
  const options = parseArgs(process.argv);
  const snapshotPath = options.snapshotPath || await findLatestSnapshotPath(repoRoot);
  const snapshotProductsById = await loadSnapshotProducts(snapshotPath);
  const liveProducts = await fetchLiveProducts(options.siteUrl);
  const skipped = createSkippedBuckets();
  const candidates = [];

  for (const liveProduct of liveProducts) {
    const liveId = normalizeText(liveProduct.id);
    const snapshotProduct = snapshotProductsById.get(liveId);

    if (!matchesFilters(liveProduct, snapshotProduct, options)) {
      continue;
    }

    const normalizedProduct = {
      id: liveId,
      model: resolveModel(liveProduct, snapshotProduct),
      brand: resolveBrand(liveProduct, snapshotProduct),
      condition: normalizeText(liveProduct.condition).toLowerCase(),
    };

    if (!snapshotProduct) {
      pushSkipped(skipped.missingSnapshot, normalizedProduct);
      continue;
    }

    if (snapshotProduct.condition && normalizedProduct.condition && snapshotProduct.condition !== normalizedProduct.condition) {
      pushSkipped(skipped.ambiguousRows, normalizedProduct, {
        reason: `snapshot condition ${snapshotProduct.condition}`,
      });
      continue;
    }

    if (
      snapshotProduct.brand
      && normalizedProduct.brand
      && normalizedProduct.brand !== 'Unknown'
      && normalizeForComparison(snapshotProduct.brand) !== normalizeForComparison(normalizedProduct.brand)
    ) {
      pushSkipped(skipped.ambiguousRows, normalizedProduct, {
        reason: `snapshot brand ${snapshotProduct.brand}`,
      });
      continue;
    }

    const currentDescription = sanitizeDescription(liveProduct.description);
    const nextDescription = sanitizeDescription(snapshotProduct.description);
    const currentLength = currentDescription.length;
    const nextLength = nextDescription.length;

    if (!nextDescription) {
      pushSkipped(skipped.missingSnapshotDescription, normalizedProduct);
      continue;
    }

    if (!options.includeBelowThreshold && nextLength < options.minDescriptionLength) {
      pushSkipped(skipped.snapshotDescriptionTooShort, normalizedProduct, {
        nextLength,
      });
      continue;
    }

    if (currentLength >= options.minDescriptionLength) {
      pushSkipped(skipped.liveAlreadyQualified, normalizedProduct, {
        currentLength,
      });
      continue;
    }

    if (!nextDescription || nextDescription === currentDescription || nextLength <= currentLength) {
      pushSkipped(skipped.unchangedOrNotImproved, normalizedProduct, {
        currentLength,
        nextLength,
      });
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
    options.ids ? `ids=${options.ids.size}` : null,
    options.offset ? `offset=${options.offset}` : null,
    options.limit != null ? `limit=${options.limit}` : null,
    options.includeBelowThreshold ? 'include-below-threshold=true' : null,
  ].filter(Boolean);

  const reportLines = [
    '# Live Description Backfill Report',
    '',
    `- Site URL: ${options.siteUrl}`,
    `- Snapshot: ${snapshotPath}`,
    `- Live products fetched: ${liveProducts.length}`,
    `- Snapshot products loaded: ${snapshotProductsById.size}`,
    `- Minimum target description length: ${options.minDescriptionLength}`,
    `- Filters: ${filterSummary.length > 0 ? filterSummary.join(', ') : 'none'}`,
    `- Eligible candidate updates: ${candidates.length}`,
    `- Updates emitted in this manifest: ${emittedCandidates.length}`,
    `- Remaining eligible rows after this batch window: ${remainingCandidates.length}`,
    `- Missing snapshot rows skipped: ${skipped.missingSnapshot.length}`,
    `- Ambiguous rows skipped: ${skipped.ambiguousRows.length}`,
    `- Snapshot rows with no description skipped: ${skipped.missingSnapshotDescription.length}`,
    `- Snapshot rows below threshold skipped: ${skipped.snapshotDescriptionTooShort.length}`,
    `- Live rows already qualified skipped: ${skipped.liveAlreadyQualified.length}`,
    `- Rows unchanged or not improved skipped: ${skipped.unchangedOrNotImproved.length}`,
    '',
    '## Candidate Groups',
    '',
    ...(groupCounts.length > 0
      ? groupCounts.map(([group, count]) => `- ${group}: ${count}`)
      : ['- None.']),
    '',
    '## Emitted Updates',
    '',
    ...(emittedCandidates.length > 0
      ? emittedCandidates.flatMap((candidate) => [
        renderRowLine(candidate),
        `  Current: ${candidate.currentDescription || '(empty)'}`,
        `  Next: ${candidate.nextDescription}`,
      ])
      : ['- None.']),
    '',
    '## Remaining Eligible Rows',
    '',
    ...(remainingCandidates.length > 0
      ? remainingCandidates.slice(0, 25).map((candidate) => renderRowLine(candidate))
      : ['- None.']),
    ...(remainingCandidates.length > 25
      ? ['', `- ${remainingCandidates.length - 25} more rows remain after the preview above.`]
      : []),
    '',
    '## Ambiguous Rows',
    '',
    ...(skipped.ambiguousRows.length > 0
      ? skipped.ambiguousRows.map((row) => renderSkippedLine(row, row.reason))
      : ['- None.']),
    '',
    '## Missing Snapshot Rows',
    '',
    ...(skipped.missingSnapshot.length > 0
      ? skipped.missingSnapshot.map((row) => renderSkippedLine(row))
      : ['- None.']),
    '',
    '## Snapshot Rows Below Threshold',
    '',
    ...(skipped.snapshotDescriptionTooShort.length > 0
      ? skipped.snapshotDescriptionTooShort.map((row) => renderSkippedLine(row, `${row.nextLength} chars`))
      : ['- None.']),
    '',
    '## Live Rows Already Qualified',
    '',
    ...(skipped.liveAlreadyQualified.length > 0
      ? skipped.liveAlreadyQualified.slice(0, 25).map((row) => renderSkippedLine(row, `${row.currentLength} chars`))
      : ['- None.']),
    ...(skipped.liveAlreadyQualified.length > 25
      ? ['', `- ${skipped.liveAlreadyQualified.length - 25} more already-qualified rows omitted from this section.`]
      : []),
  ];

  await fs.writeFile(options.reportPath, `${reportLines.join('\n')}\n`, 'utf8');

  console.log(`Wrote ${emittedCandidates.length} description updates to ${options.outputPath}`);
  console.log(`Wrote backfill report to ${options.reportPath}`);
  console.log(`Eligible candidates available: ${candidates.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});