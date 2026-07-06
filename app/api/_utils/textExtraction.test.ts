import { describe, expect, it } from 'vitest';
import { chunkText, extractReadableTextFromHtml } from './textExtraction';

describe('extractReadableTextFromHtml', () => {
  it('extracts readable text and removes scripts/styles', () => {
    const result = extractReadableTextFromHtml(`
      <html>
        <head>
          <title>Example Resource</title>
          <style>.hidden { color: red; }</style>
          <script>window.secret = true;</script>
        </head>
        <body>
          <h1>Learn Firebase Auth</h1>
          <p>Secure API routes with verified ID tokens.</p>
        </body>
      </html>
    `);

    expect(result.title).toBe('Example Resource');
    expect(result.text).toContain('Learn Firebase Auth');
    expect(result.text).toContain('Secure API routes');
    expect(result.text).not.toContain('window.secret');
    expect(result.text).not.toContain('.hidden');
  });
});

describe('chunkText', () => {
  it('chunks long text with overlap', () => {
    const text = Array.from({ length: 120 }, (_, index) => `Sentence ${index}.`).join(' ');
    const chunks = chunkText(text, 120, 20);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].length).toBeLessThanOrEqual(140);
    expect(chunks.join(' ')).toContain('Sentence 119.');
  });

  it('returns no chunks for empty text', () => {
    expect(chunkText('   ')).toEqual([]);
  });
});
