import { describe, expect, it } from 'vitest';
import { normalizeIssue, type SemanticWorkItemV2 } from '@/lib/jira/live';
import type { SemanticJiraSnapshotRecord } from '@/lib/jira/store';
import { buildQ3Overview, sanitizeInitiatives } from '@/lib/q3/model';
import { Q3_CONFIG, Q3_PROFILE_VERSION } from '@/lib/q3/config';

const raw = (
  key: string,
  project: string,
  type: string,
  status: string,
  extra: Record<string, unknown> = {},
) => ({
  key,
  fields: {
    summary: `Sensitive ${key}`,
    project: { key: project },
    issuetype: { id: type, name: type },
    status: { name: status, statusCategory: { name: 'Done' } },
    created: '2026-01-01T00:00:00Z',
    updated: '2026-08-01T00:00:00Z',
    labels: [],
    ...extra,
  },
});
const initiative = (
  status = 'En desarrollo',
  quarters = ['Q3'],
  date: string | null = '2026-09-15',
  extra: Record<string, unknown> = {},
) =>
  normalizeIssue(
    raw('DSP-1', 'DSP', 'Iniciativa estratégica', status, {
      customfield_12634: quarters.map((name) => ({ name })),
      customfield_11944: date,
      ...extra,
    }),
    'https://site',
  );
const delivery = (key = 'CPD-1') =>
  normalizeIssue(raw(key, 'CPD', 'Epic', 'En desarrollo'), 'https://site');
const feature = (
  key: string,
  status: string,
  parent = 'CPD-1',
  extra: Record<string, unknown> = {},
) =>
  normalizeIssue(
    raw(key, 'CPD', 'Feature', status, {
      parent: { key: parent, fields: { issuetype: { name: 'Epic' } } },
      ...extra,
    }),
    'https://site',
  );
const polaris = (item: SemanticWorkItemV2, ...keys: string[]) => ({
  ...item,
  issueLinks: keys.map((key) => ({
    linkTypeId: '10006',
    relation: 'is implemented by',
    direction: 'OUTWARD' as const,
    key,
    issueTypeName: 'Epic',
  })),
});
const snapshot = (items: SemanticWorkItemV2[]): SemanticJiraSnapshotRecord => ({
  schemaVersion: 2,
  semanticProfileVersion: Q3_PROFILE_VERSION,
  organizationId: 'org',
  snapshotId: 'safe',
  version: 9,
  previousSnapshotId: null,
  syncMode: 'FULL',
  source: 'Jira Cloud',
  dataMode: 'LIVE',
  startedAt: '2026-08-03T00:00:00Z',
  completedAt: '2026-08-03T00:00:00Z',
  status: 'COMPLETED',
  projectsRequested: ['DSP', 'CPD'],
  projectsAccessible: ['DSP', 'CPD'],
  issuesProcessed: items.length,
  issuesChanged: items.length,
  pagesProcessed: 1,
  truncated: false,
  coverage: 100,
  warnings: [],
  checkpoint: '2026-08-03T00:00:00Z',
  correlationId: 'safe',
  durationMs: 1,
  items,
  metrics: {} as SemanticJiraSnapshotRecord['metrics'],
  metadataVersion: 'm',
  deltas: [],
  dataQuality: [],
});
const overview = (items: SemanticWorkItemV2[]) =>
  buildQ3Overview(snapshot(items));

describe('Deuna canonical Q3 model', () => {
  it('parses Jira option values and Polaris interval end', () => {
    const item = normalizeIssue(
      raw('DSP-9', 'DSP', 'Iniciativa estratégica', 'En desarrollo', {
        customfield_12634: [{ value: 'Q3' }],
        customfield_11372: { value: 'ECO Merchants' },
        customfield_11944: '{"start":"2026-07-01","end":"2026-09-15"}',
      }),
      'https://site',
    );
    expect(item.quarters).toEqual(['Q3']);
    expect(item.resolvedEco.value).toBe('ECO Merchants');
    expect(item.completionDate.value).toBe('2026-09-15');
  });
  it('commits Q3 initiative from Quarter and active status', () =>
    expect(overview([initiative()]).reconciliation.committedQ3).toBe(1));
  it('classifies Q3 Parking lot as candidate', () =>
    expect(
      overview([initiative('Parking lot')]).reconciliation.candidateQ3,
    ).toBe(1));
  it('excludes Q3 No-Go from deliverable commitment', () => {
    const x = overview([initiative('No-Go')]);
    expect(x.reconciliation.noGoQ3).toBe(1);
    expect(x.reconciliation.committedQ3).toBe(0);
  });
  it('detects Q3 Quarter with Q4 date conflict', () =>
    expect(
      overview([initiative('En desarrollo', ['Q3'], '2026-10-15')])
        .reconciliation.quarterDateConflict,
    ).toBe(1));
  it('keeps a Quarter/date conflict committed with partial confidence', () => {
    const x = overview([initiative('En desarrollo', ['Q3'], '2026-10-15')]);
    expect(x.reconciliation.committedQ3).toBe(1);
    expect(x.initiatives[0]).toMatchObject({
      quarterConsistency: 'DATE_OUTSIDE_QUARTER',
      commitmentConfidence: 'MEDIUM',
      riskSignal: 'DATA_CONFLICT',
    });
  });
  it('detects Q3 date without Quarter', () =>
    expect(
      overview([initiative('En desarrollo', [], '2026-09-15')]).reconciliation
        .dateWithoutQuarter,
    ).toBe(1));
  it('never uses created or updated Q3 as commitment', () => {
    const x = overview([initiative('En desarrollo', [], null)]);
    expect(x.reconciliation.committedQ3).toBe(0);
    expect(x.reconciliation.activeNotCommitted).toBe(1);
  });
  it('overrides DSP Matriz de riesgo despite statusCategory Done', () => {
    const x = overview([initiative('Matriz de riesgo')]).initiatives[0];
    expect(x.executiveStage).toBe('RISK_GATE');
    expect(x.administrativelyCompleted).toBe(false);
  });
  it('treats Finalizada as administrative completion', () =>
    expect(
      overview([initiative('Finalizada')]).initiatives[0].completionOutcome,
    ).toBe('ADMINISTRATIVELY_COMPLETED'));
  it('does not infer production from Finalizada', () =>
    expect(
      overview([initiative('Finalizada')]).initiatives[0].productionConfirmed,
    ).toBe(false));
  it('resolves all Polaris delivery parents', () => {
    const x = overview([
      polaris(initiative(), 'CPD-1', 'EMD-1'),
      delivery(),
      delivery('EMD-1'),
    ]);
    expect(x.initiatives[0].deliveryRepresentations).toHaveLength(2);
    expect(x.linkage.multipleDeliveryParents).toBe(1);
  });
  it('never increases initiative count for delivery representations', () =>
    expect(
      overview([polaris(initiative(), 'CPD-1'), delivery()]).initiatives,
    ).toHaveLength(1));
  it('calculates FCR exclusively from Features', () => {
    const x = overview([
      polaris(initiative(), 'CPD-1'),
      delivery(),
      feature('F-1', 'Completado'),
      feature('F-2', 'En desarrollo'),
      normalizeIssue(
        raw('T-1', 'CPD', 'Tarea', 'Completado', { parent: { key: 'CPD-1' } }),
        'x',
      ),
    ]).initiatives[0];
    expect(x.featuresTotal).toBe(2);
    expect(x.featureCompletionRatio).toBe(50);
  });
  it('separates cancelled Features from denominator', () => {
    const x = overview([
      polaris(initiative(), 'CPD-1'),
      delivery(),
      feature('F-1', 'Completado'),
      feature('F-2', 'Cancelado'),
    ]).initiatives[0];
    expect(x.featuresCancelled).toBe(1);
    expect(x.featuresTotal).toBe(1);
    expect(x.featureCompletionRatio).toBe(100);
  });
  it('marks progress unavailable without Features', () =>
    expect(overview([initiative()]).initiatives[0].progressStatus).toBe(
      'UNAVAILABLE',
    ));
  it('marks progress partial with unmapped Feature status', () =>
    expect(
      overview([
        polaris(initiative(), 'CPD-1'),
        delivery(),
        feature('F-1', 'Estado extraño'),
      ]).initiatives[0].progressStatus,
    ).toBe('PARTIAL'));
  it('does not replace FCR with Story Points', () => {
    const x = overview([
      { ...initiative(), storyPoints: { state: 'PRESENT', value: 99 } },
    ]).initiatives[0];
    expect(x.featureCompletionRatio).toBeNull();
    expect(x.progressStatus).toBe('UNAVAILABLE');
  });
  it('classifies Q2 plus Q3 as carry-over', () =>
    expect(
      overview([initiative('En desarrollo', ['Q2', 'Q3'])]).initiatives[0]
        .carryOver,
    ).toBe('CARRY_OVER'));
  it('classifies Q1 Q2 Q3 as chronic carry-over', () =>
    expect(
      overview([initiative('En desarrollo', ['Q1', 'Q2', 'Q3'])]).initiatives[0]
        .carryOver,
    ).toBe('CHRONIC_CARRY_OVER'));
  it('classifies Q3 Q4 as planned cross-quarter, not carry-over', () =>
    expect(
      overview([initiative('En desarrollo', ['Q3', 'Q4'])]).initiatives[0]
        .carryOver,
    ).toBe('CROSS_QUARTER_PLANNED'));
  it('reports empty Jira OKR as unavailable rather than zero alignment', () => {
    const x = overview([initiative()]);
    expect(x.okr.metricStatus).toBe('UNAVAILABLE');
    expect(x.okr.message).toBe('Alineación con Boja no medible desde Jira.');
  });
  it('does not equate a NOT_STARTED matrix with blocked', () => {
    const matrix = normalizeIssue(
      raw('R-1', 'CPD', 'Matriz de Riesgos', 'TAREAS POR HACER', {
        parent: { key: 'CPD-1' },
      }),
      'x',
    );
    const x = overview([polaris(initiative(), 'CPD-1'), delivery(), matrix]);
    expect(x.initiatives[0].riskGate).toBe('NOT_STARTED');
    expect(x.reconciliation).not.toHaveProperty('blocked', 1);
  });
  it('creates attention when a matrix waits for approval', () => {
    const matrix = normalizeIssue(
      raw('R-1', 'CPD', 'Matriz de Riesgos', 'Aprobación por Oficial', {
        parent: { key: 'CPD-1' },
      }),
      'x',
    );
    const x = overview([polaris(initiative(), 'CPD-1'), delivery(), matrix]);
    expect(x.risks.some((r) => r.type === 'APPROVAL_AGING')).toBe(true);
  });
  it('uses centralized configurable risk thresholds', () => {
    const old = {
      ...initiative(),
      updatedAt: { state: 'PRESENT' as const, value: '2026-07-01T00:00:00Z' },
    };
    const x = overview([old]);
    expect(Q3_CONFIG.thresholds.stalledDays).toBe(14);
    expect(x.risks.some((r) => r.type === 'STALLED')).toBe(true);
  });
  it('marks missing release evidence unavailable', () =>
    expect(overview([initiative()]).initiatives[0].release).toBe(
      'NO_RELEASE_EVIDENCE',
    ));
  it('marks metrics without evidence unavailable', () =>
    expect(overview([initiative()]).businessImpact.status).toBe('UNAVAILABLE'));
  it('keeps summaries out of aggregated overview payload', () => {
    const x = overview([initiative()]);
    const safe = {
      pulse: x.pulse,
      flow: x.flow,
      attention: x.attention,
      ecoHealth: x.ecoHealth,
      portfolioMix: x.portfolioMix,
      dataConfidence: x.dataConfidence,
      reconciliation: x.reconciliation,
    };
    expect(JSON.stringify(safe)).not.toContain('Sensitive');
  });
  it('limits initiative list according to current scope', () => {
    const x = overview([initiative()]);
    expect(sanitizeInitiatives(x, 'Personas')).toHaveLength(0);
    expect(sanitizeInitiatives(x, 'Organización')).toHaveLength(1);
  });
  it('derives values from snapshot items rather than external fixtures', () => {
    expect(
      overview([initiative(), { ...initiative(), sourceKey: 'DSP-2' }])
        .reconciliation.declaredQ3,
    ).toBe(2);
  });
  it('reconciles declared population into mutually exclusive commitment classes', () => {
    const items = [
      initiative('Parking lot'),
      { ...initiative('No-Go'), sourceKey: 'DSP-2' },
      { ...initiative('Cancelado'), sourceKey: 'DSP-3' },
      { ...initiative('En desarrollo'), sourceKey: 'DSP-4' },
    ];
    const x = overview(items);
    expect(x.reconciliation.declaredQ3).toBe(
      x.reconciliation.candidateQ3 + x.reconciliation.noGoQ3 +
      x.reconciliation.cancelledQ3 + x.reconciliation.committedQ3,
    );
    expect(new Set(x.initiatives.map((item) => item.canonicalKey)).size).toBe(4);
  });
  it('reconciles committed population into exactly one DSP stage', () => {
    const statuses = ['INN PLANNING', 'Discovery', 'En desarrollo', 'Avanzada', 'Revisión', 'Matriz de riesgo', 'Bloqueado', 'Finalizada', 'Extraño'];
    const x = overview(statuses.map((status, index) => ({ ...initiative(status), sourceKey: `DSP-${index + 1}` })));
    const stageTotal = ['notStartedStage','discoveryStage','inExecutionStage','inReviewStage','inRiskGateStage','blockedStage','administrativelyCompletedStage','unknownStage']
      .reduce((sum, key) => sum + x.reconciliation[key], 0);
    expect(stageTotal).toBe(x.reconciliation.committedQ3);
    expect(x.commitment.inExecution.value).toBe(2);
    expect(x.commitment.notStarted.value).toBe(1);
  });
  it('does not classify a candidate as committed', () => {
    const x = overview([initiative('Parking lot')]);
    expect(x.initiatives[0]).toMatchObject({ candidateQ3: true, committedQ3: false, commitmentStage: null });
  });
  it('derives execution from DSP status rather than delivery evidence', () => {
    const x = overview([polaris(initiative('INN PLANNING'), 'CPD-1'), delivery()]);
    expect(x.commitment.inExecution.value).toBe(0);
    expect(x.commitment.notStarted.value).toBe(1);
  });
  it('counts delivery missing only inside REQUIRED', () => {
    const required = { ...initiative('En desarrollo'), initiativeType: undefined };
    const x = overview([
      { ...required, sourceKey: 'DSP-1', issueTypeName: 'Deuda Tecnica' },
      { ...initiative('INN PLANNING'), sourceKey: 'DSP-2' },
    ]);
    expect(x.delivery.required.value).toBe(1);
    expect(x.delivery.missingReal.value).toBe(1);
    expect(x.delivery.notYetRequired.value).toBe(1);
  });
  it('uses FEATURE_BASED as FCR denominator and excludes non-feature delivery', () => {
    const x = overview([
      polaris(initiative(), 'CPD-1'), delivery(), feature('F-1', 'Completado'),
      polaris({ ...initiative(), sourceKey: 'DSP-2' }, 'CPD-2'), delivery('CPD-2'),
    ]);
    expect(x.progress.featureApplicable.value).toBe(1);
    expect(x.progress.featureResolved.value).toBe(1);
    expect(x.progress.nonFeatureDelivery.value).toBe(1);
    expect(x.progress.coverage.value).toBe(100);
  });
  it('uses REQUIRED_NOW and REQUIRED as risk/release denominators', () => {
    const matrix = normalizeIssue(raw('R-1', 'CPD', 'Matriz de Riesgos', 'TAREAS POR HACER', { parent: { key: 'CPD-1' } }), 'x');
    const x = overview([polaris(initiative('Revisión'), 'CPD-1'), delivery(), matrix]);
    expect(x.risk.requiredNow.value).toBe(1);
    expect(x.risk.withMatrix.value).toBe(1);
    expect(x.risk.coverage.value).toBe(100);
    expect(x.release.required.value).toBe(1);
    expect(x.release.missingReal.value).toBe(1);
  });
  it('keeps unavailable FCR null and administrative completion separate from production', () => {
    const x = overview([initiative('Finalizada')]);
    expect(x.pulse.progress.value).toBeNull();
    expect(x.commitment.administrativelyCompleted.value).toBe(1);
    expect(x.commitment.productionConfirmed.value).toBe(0);
  });
  it('reduces confidence for UNKNOWN applicability', () => {
    const x = overview([initiative('Revisión')]);
    expect(x.delivery.unknown.confidence).toBe('MEDIUM');
    expect(x.delivery.unknown.warnings).not.toHaveLength(0);
  });
});
