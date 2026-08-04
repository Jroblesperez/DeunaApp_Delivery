import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server-session';
import { JiraCredentialsProvider } from '@/lib/jira/credentials';
import { JiraCloudClient } from '@/lib/jira/client';
import {
  discoverJira,
  normalizeIssue,
  type SemanticWorkItemV2,
} from '@/lib/jira/live';
import { jiraEnvelope, jiraErrorResponse } from '@/lib/jira/api';
import { jiraSnapshotStore, type SemanticJiraSnapshotRecord } from '@/lib/jira/store';
import {
  buildMetadataCache,
  buildSemanticMetrics,
  calculateDataQuality,
  calculateDeltas,
  mergeIncremental,
  resolveSemanticItems,
} from '@/lib/snapshot/live-engine';
import { Q3_PROFILE_VERSION } from '@/lib/q3/config';
import { acquireQ3Datasets } from '@/lib/q3/acquisition';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const tag = (
  items: Record<string, unknown>[],
  site: string,
  datasetRole: NonNullable<SemanticWorkItemV2['datasetRole']>,
  portfolioMembership?: SemanticWorkItemV2['portfolioMembership'],
) =>
  items.map((raw) => ({
    ...normalizeIssue(raw, site),
    datasetRole,
    portfolioMembership,
  }));
const dedupe = (items: SemanticWorkItemV2[]) => [
  ...new Map(items.map((item) => [item.sourceKey, item])).values(),
];
export async function POST(request: Request) {
  if (!requireAdmin(request))
    return NextResponse.json(
      jiraEnvelope(null, 'ERROR', ['Se requiere una sesión con rol ADMIN.'], 0),
      { status: 403 },
    );
  try {
    const startedAt = new Date();
    const credentials = new JiraCredentialsProvider().get();
    const client = new JiraCloudClient(credentials);
    const latest = await jiraSnapshotStore.latest();
    const semanticPrevious = await jiraSnapshotStore.latestSemantic();
    const previous =
      semanticPrevious?.semanticProfileVersion === Q3_PROFILE_VERSION &&
      semanticPrevious.datasets
        ? semanticPrevious
        : null;
    const historicalOperational = (await jiraSnapshotStore.history()).filter(
      (record): record is SemanticJiraSnapshotRecord =>
        record.schemaVersion === 2 &&
        record.semanticProfileVersion === Q3_PROFILE_VERSION &&
        Boolean(record.datasets),
    );
    const acquisition = await acquireQ3Datasets(
      client,
      credentials,
      previous?.checkpoint,
    );
    const discovery = await discoverJira(client, credentials.projects);
    const accessible = discovery.projects.map((project) => String(project.key));
    if (!accessible.length)
      return NextResponse.json(
        jiraEnvelope(
          null,
          'UNAVAILABLE',
          ['Ningún proyecto configurado es accesible.'],
          0,
        ),
        { status: 403 },
      );
    const metadata = await buildMetadataCache(client, accessible);
    await jiraSnapshotStore.saveMetadata(metadata);
    const portfolio = tag(
      acquisition.portfolioMain,
      credentials.baseUrl,
      'PORTFOLIO',
      'DECLARED_Q3',
    );
    const portfolioControl = tag(
      acquisition.portfolioControl,
      credentials.baseUrl,
      'PORTFOLIO_CONTROL',
      'CONTROL_ONLY',
    );
    const operationalChanges = tag(
      acquisition.operationalItems,
      credentials.baseUrl,
      'OPERATIONAL',
    );
    const priorOperational =
      previous?.items.filter((item) => item.datasetRole === 'OPERATIONAL') ??
      [];
    const operational = previous
      ? mergeIncremental(priorOperational, operationalChanges)
      : operationalChanges;
    const operationalPopulation = Math.max(
      operational.length,
      acquisition.operational.itemsProcessed,
      ...historicalOperational.map(
        (record) => record.datasets?.operational.itemsProcessed ?? 0,
      ),
    );
    const operationalWasTruncated = historicalOperational.some(
      (record) => record.datasets?.operational.truncated,
    );
    const operationalDataset = {
      ...acquisition.operational,
      status:
        acquisition.operational.status === 'UNAVAILABLE'
          ? 'UNAVAILABLE' as const
          : acquisition.operational.truncated ||
              operationalWasTruncated ||
              operationalPopulation >= credentials.maxIssues
            ? 'PARTIAL' as const
            : acquisition.operational.status,
      itemsProcessed: operationalPopulation,
      truncated: Boolean(
        acquisition.operational.truncated ||
          operationalWasTruncated ||
          operationalPopulation >= credentials.maxIssues,
      ),
    };
    const relationships = tag(
      acquisition.relationshipItems,
      credentials.baseUrl,
      'RELATIONSHIP',
    );
    const combined = dedupe([
      ...operational,
      ...relationships,
      ...portfolioControl,
      ...portfolio,
    ]);
    const items = resolveSemanticItems(combined, metadata);
    const deltas = calculateDeltas(previous?.items ?? [], items);
    const warnings = [
      ...discovery.warnings,
      ...metadata.warnings,
      ...acquisition.portfolio.warnings,
      ...acquisition.operational.warnings,
      ...acquisition.relationships.warnings,
    ];
    const completedAt = new Date();
    const checkpoint = operationalChanges.reduce(
      (value, item) =>
        item.updatedAt.value && item.updatedAt.value > value
          ? item.updatedAt.value
          : value,
      previous?.checkpoint ?? startedAt.toISOString(),
    );
    const version = (latest?.version ?? 0) + 1;
    const syncMode = previous ? 'INCREMENTAL' : 'FULL';
    const generalPartial =
      [
        acquisition.portfolio.status,
        operationalDataset.status,
        acquisition.relationships.status,
      ].some((status) => status !== 'COMPLETED') || warnings.length > 0;
    const snapshot = (await jiraSnapshotStore.save({
      schemaVersion: 2,
      semanticProfileVersion: Q3_PROFILE_VERSION,
      datasets: {
        portfolio: acquisition.portfolio,
        operational: operationalDataset,
        relationships: acquisition.relationships,
        fieldDiscovery: acquisition.fieldDiscovery,
        fieldSample: acquisition.fieldSample,
      },
      organizationId: 'org-deuna-ecuador',
      snapshotId: `jira-${completedAt.toISOString()}-${crypto.randomUUID().slice(0, 8)}`,
      version,
      previousSnapshotId: previous?.snapshotId ?? null,
      syncMode,
      source: 'Jira Cloud',
      dataMode: 'LIVE',
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      status: generalPartial ? 'PARTIAL' : 'COMPLETED',
      projectsRequested: credentials.projects,
      projectsAccessible: accessible,
      issuesProcessed: items.length,
      issuesChanged:
        portfolio.length +
        portfolioControl.length +
        operationalChanges.length +
        relationships.length,
      pagesProcessed:
        acquisition.portfolio.pagesProcessed +
        acquisition.operational.pagesProcessed,
      truncated:
        operationalDataset.truncated ||
        acquisition.relationships.truncated,
      coverage: acquisition.portfolio.fieldsCoverage ?? 0,
      warnings,
      checkpoint,
      correlationId: crypto.randomUUID(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      items,
      metrics: buildSemanticMetrics(items, {
        projectsAccessible: accessible.length,
        truncated: operationalDataset.truncated,
        snapshotVersion: version,
        syncMode,
      }),
      metadataVersion: metadata.version,
      deltas,
      dataQuality: calculateDataQuality(items),
    })) as SemanticJiraSnapshotRecord;
    const safe = {
      schemaVersion: snapshot.schemaVersion,
      semanticProfileVersion: snapshot.semanticProfileVersion,
      version: snapshot.version,
      syncMode: snapshot.syncMode,
      status: snapshot.status,
      projectsAccessible: snapshot.projectsAccessible,
      issuesProcessed: snapshot.issuesProcessed,
      issuesChanged: snapshot.issuesChanged,
      truncated: snapshot.truncated,
      coverage: snapshot.coverage,
      durationMs: snapshot.durationMs,
      datasets: snapshot.datasets,
      deltasCount: snapshot.deltas.length,
    };
    return NextResponse.json(
      jiraEnvelope(
        safe,
        snapshot.status === 'PARTIAL' ? 'PARTIAL' : 'SUCCESS',
        warnings,
        snapshot.coverage,
      ),
    );
  } catch (error) {
    return jiraErrorResponse(error);
  }
}
