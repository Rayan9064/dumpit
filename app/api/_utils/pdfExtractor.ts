const pdfParse = require('pdf-parse');

export interface ExtractPdfResult {
  text: string;
  numpages: number;
  info?: any;
}

/**
 * Extract clean plain text from a PDF Buffer
 * @param dataBuffer Buffer containing binary PDF contents
 * @param maxChars Maximum characters to return (default 50,000)
 */
export async function extractTextFromPdf(dataBuffer: Buffer, maxChars: number = 50000): Promise<ExtractPdfResult> {
  try {
    const data = await pdfParse(dataBuffer);
    let rawText = data.text || '';
    
    // Clean up excessive whitespace, control characters, and line breaks
    rawText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (rawText.length > maxChars) {
      rawText = rawText.slice(0, maxChars) + '\n\n[Content truncated due to size limits]';
    }

    return {
      text: rawText,
      numpages: data.numpages || 1,
      info: data.info || null,
    };
  } catch (error) {
    console.error('Error parsing PDF buffer:', error);
    throw new Error('Failed to parse PDF document. The file may be password-protected or corrupted.');
  }
}
