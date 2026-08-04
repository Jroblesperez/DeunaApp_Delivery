import { NextResponse } from 'next/server';
import { jiraEnvelope } from '@/lib/jira/api';
import { jiraSnapshotStore } from '@/lib/jira/store';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const history = await jiraSnapshotStore.history();
  const safe = history.map((snapshot) => ({
    schemaVersion: snapshot.schemaVersion ?? 1,
    semantic: snapshot.schemaVersion === 2,
    organizationId: snapshot.organizationId,
    snapshotId: snapshot.snapshotId,
    version: snapshot.version,
    previousSnapshotId: snapshot.previousSnapshotId,
    syncMode: snapshot.syncMode,
    source: snapshot.source,
    dataMode: snapshot.dataMode,
    startedAt: snapshot.startedAt,
    completedAt: snapshot.completedAt,
    status: snapshot.status,
    projectsRequested: snapshot.projectsRequested,
    projectsAccessible: snapshot.projectsAccessible,
    issuesProcessed: snapshot.issuesProcessed,
    issuesChanged: snapshot.issuesChanged,
    pagesProcessed: snapshot.pagesProcessed,
    truncated: snapshot.truncated,
    coverage: snapshot.coverage,
    warnings: snapshot.warnings,
    checkpoint: snapshot.checkpoint,
    correlationId: snapshot.correlationId,
    durationMs: snapshot.durationMs,
    metrics: snapshot.schemaVersion === 2 ? snapshot.metrics : undefined,
    metadataVersion: snapshot.metadataVersion,
    deltasCount: snapshot.deltas.length,
    dataQuality:
      snapshot.schemaVersion === 2 ? snapshot.dataQuality : undefined,
    datasets: snapshot.schemaVersion === 2 ? snapshot.datasets : undefined,
  }));
  return NextResponse.json(
    jiraEnvelope(
      safe,
      history.length ? 'SUCCESS' : 'UNAVAILABLE',
      history.length ? [] : ['No existe un snapshot LIVE válido.'],
      history[0]?.coverage ?? 0,
    ),
  );
}
