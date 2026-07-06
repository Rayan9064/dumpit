const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768;

interface GeminiEmbeddingResponse {
  embedding?: {
    values?: number[];
  };
}

export const getGeminiEmbeddingModel = () => (
  process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL
);

export const hasGeminiApiKey = () => Boolean(process.env.GEMINI_API_KEY);

export const embedText = async (text: string): Promise<number[]> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const model = getGeminiEmbeddingModel();
  const response = await fetch(`${GEMINI_API_BASE}/models/${model}:embedContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: `models/${model}`,
      content: {
        parts: [{ text }],
      },
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Gemini embedding failed: ${response.status} ${errorText}`);
  }

  const data = await response.json() as GeminiEmbeddingResponse;
  const values = data.embedding?.values;

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Gemini embedding response did not include values');
  }

  return values;
};

export const summarizeChunk = (text: string) => (
  text.length > 360 ? `${text.slice(0, 357).trim()}...` : text
);
