import { NextResponse } from 'next/server';
import { jiraEnvelope } from '@/lib/jira/api';
import { loadQ3Overview } from '@/lib/q3/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
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
  };
  return NextResponse.json(jiraEnvelope(safe, 'SUCCESS', [], 100));
}
