import { NextResponse } from 'next/server';
import { jiraEnvelope } from '@/lib/jira/api';
import { sessionFromRequest } from '@/lib/auth/server-session';
import { loadQ3Overview } from '@/lib/q3/server';
import { sanitizeInitiatives } from '@/lib/q3/model';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const session = sessionFromRequest(request);
  if (!session)
    return NextResponse.json(
      jiraEnvelope(null, 'ERROR', ['Sesión o scope no autorizado.'], 0),
      { status: 403 },
    );
  const data = await loadQ3Overview();
  if (!data)
    return NextResponse.json(
      jiraEnvelope(
        null,
        'UNAVAILABLE',
        ['Requiere nuevo snapshot semántico Q3.'],
        0,
      ),
    );
  return NextResponse.json(
    jiraEnvelope(sanitizeInitiatives(data, session.scope), 'SUCCESS', [], 100),
  );
}
