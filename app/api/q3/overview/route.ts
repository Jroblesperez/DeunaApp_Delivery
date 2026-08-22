import { NextResponse } from 'next/server';
import { jiraEnvelope } from '@/lib/jira/api';
import { loadQ3Overview } from '@/lib/q3/server';
import { sessionFromRequest } from '@/lib/auth/server-session';
import { buildForecastDtos } from '@/lib/q3/model';
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
  const canViewForecastNames =
    session.role === 'ADMIN' ||
    ['Executive', 'Leadership', 'Delivery'].includes(session.accessRole);
  const safe = {
    snapshot: data.snapshot,
    pulse: data.pulse,
    commitment: data.commitment,
    delivery: data.delivery,
    progress: data.progress,
    risk: data.risk,
    release: data.release,
    flow: data.flow,
    attention: data.attention,
    ecoHealth: data.ecoHealth,
    portfolioMix: data.portfolioMix,
    businessImpact: data.businessImpact,
    dataConfidence: data.dataConfidence,
    reconciliation: data.reconciliation,
    linkage: data.linkage,
    riskMatrix: data.riskMatrix,
    controls: data.controls,
    okr: data.okr,
    viewer: {
      greeting:
        session.accessRole === 'Executive' && session.name.includes('Joan')
          ? 'Hola, Joan'
          : 'Sesión ejecutiva',
    },
    forecast: buildForecastDtos(
      data,
      session.scope,
      canViewForecastNames,
    ),
  };
  return NextResponse.json(jiraEnvelope(safe, 'SUCCESS', [], 100));
}
