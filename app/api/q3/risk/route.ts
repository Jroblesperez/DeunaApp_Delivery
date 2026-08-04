import { NextResponse } from 'next/server';
import { jiraEnvelope } from '@/lib/jira/api';
import { loadQ3Overview } from '@/lib/q3/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const data = await loadQ3Overview();
  return NextResponse.json(
    jiraEnvelope(
      data?.risks ?? null,
      data ? 'SUCCESS' : 'UNAVAILABLE',
      data ? [] : ['Requiere nuevo snapshot semántico Q3.'],
      data ? 100 : 0,
    ),
  );
}
