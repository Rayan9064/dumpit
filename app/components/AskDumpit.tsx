'use client'

import { Bot, ExternalLink, Loader2, Search, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { jsonAuthFetch } from '../lib/authFetch';

type SearchMode = 'all' | 'mine' | 'shared';

interface Source {
  chunkId: string;
  resourceId: string;
  title: string;
  url: string;
  snippet: string;
  tag: string;
  isPublic: boolean;
  ownerId: string;
  distance: number | null;
}

const MODES: Array<{ id: SearchMode; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'My Dump' },
  { id: 'shared', label: 'Shared' },
];

export function AskDumpit() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState<SearchMode>('all');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !question.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');
    setSources([]);

    try {
      const response = await jsonAuthFetch(user, '/api/ai/ask', {
        method: 'POST',
        body: JSON.stringify({
          question: question.trim(),
          mode,
          limit: 8,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ask DumpIt failed');
      }

      setAnswer(data.answer || '');
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ask DumpIt failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Bot className="w-8 h-8 text-blue-600" />
          Ask DumpIt
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Search across indexed resources with cited answers.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === item.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about saved links, tutorials, tools, or shared resources..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-slate-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Ask
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {(answer || loading) && (
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Answer</h2>
          {loading ? (
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              Reading indexed resources...
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-200">{answer}</p>
          )}
        </section>
      )}

      {sources.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Sources</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {sources.map((source, index) => (
              <article
                key={source.chunkId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">[{index + 1}]</span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-gray-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {source.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2">
                  {source.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">
                  {source.snippet}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{source.tag}</span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Open
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!answer && !loading && !error && (
        <div className="text-center py-14 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Sparkles className="w-10 h-10 mx-auto text-blue-600 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Ask across your knowledge vault</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Answers appear here with sources after resources are indexed.
          </p>
        </div>
      )}
    </div>
  );
}
