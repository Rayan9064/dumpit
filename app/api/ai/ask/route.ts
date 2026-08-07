import { NextRequest, NextResponse } from 'next/server';
import { buildAnswerContext, normalizeSearchMode, searchResourceChunks } from '../../_utils/aiSearch';
import { isAuthError, requireAuthOrApiKey, unauthorizedResponse } from '../../_utils/auth';
import { generateAnswer } from '../../_utils/gemini';
import { checkAiRateLimit } from '../../_utils/rateLimit';
import { checkAiQueryLimit, incrementAiQueryCount } from '../../_utils/subscription';

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuthOrApiKey(request);

    // Rate limit: 10 AI queries per minute per authenticated user
    const rateLimitResponse = await checkAiRateLimit(request, authUser.uid);
    if (rateLimitResponse) return rateLimitResponse;

    // Check monthly AI query tier limit
    const aiQueryLimitCheck = await checkAiQueryLimit(authUser.uid);
    if (aiQueryLimitCheck.isLimited) {
      return NextResponse.json(
        {
          error: `Monthly AI query limit (${aiQueryLimitCheck.max}) reached. Upgrade to Pro for 300 queries/month.`,
          code: 'UPGRADE_REQUIRED',
        },
        { status: 403 }
      );
    }

    const { question, mode, limit } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    const results = await searchResourceChunks(
      authUser.uid,
      question,
      normalizeSearchMode(mode),
      typeof limit === 'number' ? limit : 8
    );

    if (results.length === 0) {
      return NextResponse.json({
        success: true,
        answer: 'I could not find indexed resources for that question yet. Try reindexing relevant links or asking a narrower question.',
        sources: [],
      });
    }

    const answer = await generateAnswer(question, buildAnswerContext(results));

    // Increment AI query usage count
    await incrementAiQueryCount(authUser.uid);

    return NextResponse.json({
      success: true,
      answer,
      sources: results,
    });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error answering AI question:', error);
    return NextResponse.json({ error: 'AI answer failed' }, { status: 500 });
  }
}
