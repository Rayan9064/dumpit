import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const trackedFiles = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean);

const forbiddenPaths = [
  /^\.env$/,
  /^\.env\./,
  /(^|\/)\.env$/,
  /(^|\/)\.env\./,
];

const secretPatterns = [
  /AIza[0-9A-Za-z_-]{30,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/,
  /(?:GEMINI|GOOGLE|FIREBASE|OPENAI|PINECONE)[A-Z0-9_]*_KEY\s*=\s*(?!$|your|YOUR|placeholder|example|xxx|xxxxx)[^\s#]+/i,
];

const allowedPlaceholderFiles = new Set([
  '.env.example',
  'README.md',
  'FIREBASE_SETUP.md',
  'FEATURE_AI_ENRICHMENT.md',
  'docs/deployment.md',
]);

const findings = [];

for (const file of trackedFiles) {
  const normalized = file.replace(/\\/g, '/');

  if (forbiddenPaths.some((pattern) => pattern.test(normalized)) && normalized !== '.env.example') {
    findings.push(`${file}: tracked environment file`);
    continue;
  }

  let text = '';
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  for (const pattern of secretPatterns) {
    if (!pattern.test(text)) continue;

    if (allowedPlaceholderFiles.has(normalized)) {
      continue;
    }

    findings.push(`${file}: possible secret matched ${pattern}`);
  }
}

if (findings.length > 0) {
  console.error('Secret scan failed:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('Secret scan passed.');
