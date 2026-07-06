const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_GENERATION_MODEL = 'gemini-2.5-flash';
const DEFAULT_EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768;

interface GeminiEmbeddingResponse {
  embedding?: {
    values?: number[];
  };
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export const getGeminiEmbeddingModel = () => (
  process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL
);

export const getGeminiGenerationModel = () => (
  process.env.GEMINI_MODEL || DEFAULT_GENERATION_MODEL
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

export const generateAnswer = async (question: string, context: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const model = getGeminiGenerationModel();
  const response = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: [
                'You are DumpIt AI, a concise assistant for a saved-resource knowledge vault.',
                'Answer only from the provided context.',
                'Cite sources inline using [1], [2], etc. when you use them.',
                'If the context is insufficient, say what is missing and suggest a narrower query.',
                '',
                `Question: ${question}`,
                '',
                'Context:',
                context,
              ].join('\n'),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Gemini answer generation failed: ${response.status} ${errorText}`);
  }

  const data = await response.json() as GeminiGenerateResponse;
  const answer = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!answer) {
    throw new Error('Gemini answer response did not include text');
  }

  return answer;
};
