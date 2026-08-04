import type { Confidence, SemanticWorkItemV2 } from '@/lib/jira/live';
import type { SemanticJiraSnapshotRecord } from '@/lib/jira/store';
import { Q3_CONFIG } from './config';

export type MetricStatus = 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
export interface Q3Metric<T = unknown> {
  value: T | null;
  status: MetricStatus;
  population: number;
  applicablePopulation: number;
  coverage: number;
  confidence: Confidence;
  evidence: string[];
  warnings: string[];
  source: 'FlowOS · Jira Cloud Semantic Snapshot v2';
  lastUpdated: string;
}
export type InitiativeKind =
  'STRATEGIC' | 'OPERATIONAL' | 'IMPROVEMENT' | 'TECH_DEBT';
export type ExecutiveStage =
  | 'CANDIDATE'
  | 'PLANNING'
  | 'DISCOVERY'
  | 'PREPARING'
  | 'READY'
  | 'BUILDING'
  | 'REVIEW'
  | 'RISK_GATE'
  | 'BLOCKED'
  | 'COMPLETED_ADMINISTRATIVE'
  | 'CANCELLED_NO_GO'
  | 'PRODUCTION'
  | 'MASSIFICATION'
  | 'INTERNAL_TESTING'
  | 'DEPLOYMENT'
  | 'READY_FOR_RELEASE'
  | 'WAITING_RISK_APPROVAL'
  | 'RISK_IN_PROGRESS'
  | 'QA'
  | 'READY_FOR_QA'
  | 'UNKNOWN';
export type ConsolidatedStage =
  | 'NO_GO'
  | 'CANCELLED'
  | 'PRODUCTION_CONFIRMED'
  | 'MASSIFICATION'
  | 'INTERNAL_TESTING'
  | 'DEPLOYMENT'
  | 'READY_FOR_RELEASE'
  | 'WAITING_RISK_APPROVAL'
  | 'RISK_IN_PROGRESS'
  | 'QA'
  | 'READY_FOR_QA'
  | 'BUILDING'
  | 'DISCOVERY'
  | 'PLANNING'
  | 'CANDIDATE'
  | 'UNKNOWN';
export type RiskType =
  | 'EXPLICITLY_BLOCKED'
  | 'STALLED'
  | 'CAPACITY_OVERFLOW'
  | 'RISK_GATE_NOT_STARTED'
  | 'CARRY_OVER_CHRONIC'
  | 'NO_DELIVERY'
  | 'DEPENDENCY_BLOCKING'
  | 'APPROVAL_AGING'
  | 'ORPHAN_INITIATIVE'
  | 'SCOPE_CREEP_SIGNAL'
  | 'TARGET_DATE_AT_RISK'
  | 'RELEASE_NOT_READY'
  | 'DATA_CONFLICT';
export interface DeliveryRepresentation {
  key: string;
  project: string;
  issueType: string;
  status: string;
  linkType: string;
  direction: string;
  confidence: Confidence;
}
export interface Q3Initiative {
  canonicalKey: string;
  initiativeType: InitiativeKind;
  quarters: string[];
  sourceStatus: string;
  executiveStage: ExecutiveStage;
  administrativelyCompleted: boolean;
  productionConfirmed: boolean;
  completionOutcome:
    | 'DELIVERED'
    | 'ADMINISTRATIVELY_COMPLETED'
    | 'NO_GO'
    | 'CANCELLED'
    | 'NOT_COMPLETED'
    | 'UNKNOWN';
  declaredQ3: boolean;
  candidateQ3: boolean;
  noGoQ3: boolean;
  cancelledQ3: boolean;
  committedQ3: boolean;
  quarterDateConfirmed: boolean;
  dateWithoutQuarter: boolean;
  quarterWithoutDate: boolean;
  quarterDateConflict: boolean;
  activeNotCommitted: boolean;
  deliveryRepresentations: DeliveryRepresentation[];
  linkage:
    'LINKED' | 'PARTIALLY_LINKED' | 'NO_DELIVERY_LINK' | 'CONFLICTED_LINKAGE';
  featuresTotal: number;
  featuresCompleted: number;
  featuresActive: number;
  featuresBlocked: number;
  featuresCancelled: number;
  featuresUnmapped: number;
  featureCompletionRatio: number | null;
  featureCoverage: number;
  progressStatus: MetricStatus;
  consolidatedStage: ConsolidatedStage;
  stageSource: string;
  stageConfidence: Confidence;
  stageEvidence: string[];
  stageConflicts: string[];
  carryOver:
    'CARRY_OVER' | 'CHRONIC_CARRY_OVER' | 'CROSS_QUARTER_PLANNED' | 'NONE';
  eco: string | null;
  team: string | null;
  okrClassification:
    | 'ALIGNED_REFERENCE'
    | 'MULTIPLE_REFERENCES'
    | 'REFERENCE_UNRESOLVED'
    | 'NO_REFERENCE'
    | 'NOT_APPLICABLE';
  riskGate:
    | 'NOT_REQUIRED'
    | 'NOT_STARTED'
    | 'IN_KICKOFF'
    | 'IN_DEFINITION'
    | 'IN_MANAGEMENT'
    | 'WAITING_APPROVAL'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'UNKNOWN';
  release:
    | 'NO_RELEASE_EVIDENCE'
    | 'RELEASE_PLANNED'
    | 'READY_FOR_RELEASE'
    | 'DEPLOYMENT'
    | 'INTERNAL_TESTING'
    | 'MASSIFICATION'
    | 'PRODUCTION'
    | 'RELEASE_BLOCKED';
}
export interface ExecutiveRisk {
  type: RiskType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedInitiativeCount: number;
  affectedEco: string[];
  affectedTeam: string[];
  evidence: string[];
  confidence: Confidence;
  businessImpact: string;
  suggestedAction: string;
  requiresExecutiveDecision:
    'CEO' | 'CPO' | 'COO' | 'Líder ECO' | 'Riesgos' | 'Banco' | 'Otro';
}
export interface Q3Overview {
  snapshot: {
    schemaVersion: 2;
    version: number;
    syncMode: string;
    lastUpdated: string;
    truncated: boolean;
    portfolioStatus?: 'COMPLETED' | 'PARTIAL' | 'UNAVAILABLE';
  };
  pulse: Record<string, Q3Metric>;
  flow: Array<{
    stage: string;
    initiatives: number;
    percentage: number;
    coverage: number;
    attention: boolean;
  }>;
  attention: ExecutiveRisk[];
  ecoHealth: Array<{
    eco: string;
    committed: number;
    executing: number;
    notStarted: number;
    delivered: number;
    blocked: number;
    carryOver: number;
    progress: number | null;
    risks: number;
    confidence: Confidence;
  }>;
  portfolioMix: Array<{
    type: InitiativeKind;
    count: number;
    percentage: number;
  }>;
  businessImpact: { status: 'UNAVAILABLE'; message: string };
  dataConfidence: Record<string, Q3Metric>;
  reconciliation: Record<string, number>;
  linkage: {
    withDelivery: number;
    withoutDelivery: number;
    multipleDeliveryParents: number;
    orphanRepresentations: number;
    coverage: number;
  };
  riskMatrix: Record<string, number>;
  controls: {
    actionPlans: {
      total: number;
      linked: number;
      overdue: number;
      status: MetricStatus;
    };
    dependencies: {
      total: number;
      linked: number;
      open: number;
      status: MetricStatus;
    };
    releases: Record<Q3Initiative['release'], number>;
  };
  okr: {
    classification: Record<string, number>;
    coverage: number;
    metricStatus: MetricStatus;
    message: string;
  };
  risks: ExecutiveRisk[];
  initiatives: Q3Initiative[];
}

const norm = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
const inQ3 = (value: string | null) => {
  if (!value) return false;
  const time = new Date(value).getTime();
  return (
    time >= new Date(Q3_CONFIG.start).getTime() &&
    time <= new Date(Q3_CONFIG.end).getTime()
  );
};
const metric = <T>(
  snapshot: SemanticJiraSnapshotRecord,
  value: T | null,
  status: MetricStatus,
  population: number,
  applicablePopulation: number,
  coverage: number,
  evidence: string[],
  warnings: string[] = [],
): Q3Metric<T> => ({
  value,
  status,
  population,
  applicablePopulation,
  coverage,
  confidence:
    status === 'AVAILABLE' ? 'HIGH' : status === 'PARTIAL' ? 'MEDIUM' : 'NONE',
  evidence,
  warnings,
  source: 'FlowOS · Jira Cloud Semantic Snapshot v2',
  lastUpdated: snapshot.completedAt,
});
const INITIATIVE_TYPES: Record<string, InitiativeKind> = {
  'iniciativa estrategica': 'STRATEGIC',
  'iniciativa operativa': 'OPERATIONAL',
  'mejora evolutiva': 'IMPROVEMENT',
  'deuda tecnica': 'TECH_DEBT',
};
const DSP_STAGES: Record<string, ExecutiveStage> = {
  'parking lot': 'CANDIDATE',
  'inn planning': 'PLANNING',
  discovery: 'DISCOVERY',
  avanzada: 'PREPARING',
  'ready for delivery': 'READY',
  'en desarrollo': 'BUILDING',
  revision: 'REVIEW',
  'matriz de riesgo': 'RISK_GATE',
  bloqueado: 'BLOCKED',
  finalizada: 'COMPLETED_ADMINISTRATIVE',
  'no-go': 'CANCELLED_NO_GO',
};
const CANCELLED = new Set([
  'cancelado',
  'canceled',
  'cancelada',
  'descartada',
  'declined',
  'rechazada',
  'despriorizado',
]);
const FEATURE_DONE = new Set([
  'completado',
  'finalizado',
  'finalizada',
  'done',
  'completed',
  'closed',
  'resolved',
  'produccion',
  'published',
]);
const FEATURE_CANCELLED = new Set([
  'cancelado',
  'canceled',
  'cancelada',
  'descartada',
  'no-go',
  'declined',
  'rechazada',
  'despriorizado',
]);
const FEATURE_BLOCKED = new Set(['bloqueado', 'blocked']);
const FEATURE_KNOWN = new Set([
  'tareas por hacer',
  'to do',
  'backlog',
  'selected for development',
  'kickoff',
  'planificacion',
  'desarrollo',
  'en desarrollo',
  'in progress',
  'en progreso',
  'listo para qa',
  'pruebas',
  'validacion',
  'matriz de riesgo',
  'definicion controles',
  'gestion controles',
  'aprobacion por oficial',
  'despliegue',
  'internal testing',
  'smoke test',
  'aprobacion smoke test',
  'masificacion',
  'masificacion 50%',
  'masificacion 99%',
  'masificacion 100%',
  ...FEATURE_DONE,
  ...FEATURE_CANCELLED,
  ...FEATURE_BLOCKED,
]);
const initiativeType = (item: SemanticWorkItemV2) =>
  item.sourceProject === 'DSP'
    ? (INITIATIVE_TYPES[norm(item.issueTypeName)] ?? null)
    : null;
const q3Quarter = (quarters: string[]) => quarters.some((q) => /q3/i.test(q));
const stage = (status: string) => DSP_STAGES[norm(status)] ?? 'UNKNOWN';
const closeDate = (item: SemanticWorkItemV2) =>
  item.completionDate.value ?? item.dueDate.value ?? null;
const daysSince = (value: string | null, lastUpdated: string) =>
  value
    ? Math.max(
        0,
        Math.floor(
          (new Date(lastUpdated).getTime() - new Date(value).getTime()) /
            86400000,
        ),
      )
    : null;
const releaseOf = (items: SemanticWorkItemV2[]): Q3Initiative['release'] => {
  const statuses = items.map((x) => norm(x.sourceStatus));
  if (statuses.some((x) => ['produccion', 'published'].includes(x)))
    return 'PRODUCTION';
  if (statuses.some((x) => x.startsWith('masificacion')))
    return 'MASSIFICATION';
  if (
    statuses.some((x) =>
      ['internal testing', 'smoke test', 'aprobacion smoke test'].includes(x),
    )
  )
    return 'INTERNAL_TESTING';
  if (statuses.includes('despliegue')) return 'DEPLOYMENT';
  if (statuses.some((x) => ['bloqueado', 'blocked'].includes(x)))
    return 'RELEASE_BLOCKED';
  if (
    items.some(
      (x) => norm(x.issueTypeName) === 'plan release' || x.fixVersionIds.length,
    )
  )
    return 'RELEASE_PLANNED';
  return 'NO_RELEASE_EVIDENCE';
};
const riskGateOf = (items: SemanticWorkItemV2[]): Q3Initiative['riskGate'] => {
  const matrices = items.filter((x) =>
    ['matriz de riesgos', 'matriz riesgos'].includes(norm(x.issueTypeName)),
  );
  if (!matrices.length) return 'UNKNOWN';
  const states = matrices.map((x) => norm(x.sourceStatus));
  if (states.some((x) => x === 'aprobacion por oficial'))
    return 'WAITING_APPROVAL';
  if (states.some((x) => x === 'gestion')) return 'IN_MANAGEMENT';
  if (states.some((x) => x === 'definicion controles')) return 'IN_DEFINITION';
  if (states.some((x) => x === 'kickoff')) return 'IN_KICKOFF';
  if (states.some((x) => x === 'tareas por hacer')) return 'NOT_STARTED';
  if (states.some((x) => x === 'finalizado')) return 'COMPLETED';
  if (states.some((x) => ['despriorizado', 'no aplica'].includes(x)))
    return 'CANCELLED';
  return 'UNKNOWN';
};
function consolidated(
  dsp: ExecutiveStage,
  release: Q3Initiative['release'],
  riskGate: Q3Initiative['riskGate'],
  features: SemanticWorkItemV2[],
) {
  if (dsp === 'CANCELLED_NO_GO') return 'NO_GO';
  if (release === 'PRODUCTION') return 'PRODUCTION_CONFIRMED';
  if (release === 'MASSIFICATION') return 'MASSIFICATION';
  if (release === 'INTERNAL_TESTING') return 'INTERNAL_TESTING';
  if (release === 'DEPLOYMENT') return 'DEPLOYMENT';
  if (riskGate === 'WAITING_APPROVAL') return 'WAITING_RISK_APPROVAL';
  if (['IN_KICKOFF', 'IN_DEFINITION', 'IN_MANAGEMENT'].includes(riskGate))
    return 'RISK_IN_PROGRESS';
  if (features.some((x) => x.normalizedStage === 'QA')) return 'QA';
  if (features.some((x) => x.normalizedStage === 'READY_FOR_QA'))
    return 'READY_FOR_QA';
  if (features.some((x) => x.normalizedStage === 'DEVELOPMENT'))
    return 'BUILDING';
  if (dsp === 'DISCOVERY') return 'DISCOVERY';
  if (['PLANNING', 'PREPARING', 'READY'].includes(dsp)) return 'PLANNING';
  if (dsp === 'CANDIDATE') return 'CANDIDATE';
  if (dsp === 'BLOCKED') return 'BUILDING';
  return 'UNKNOWN';
}
function linkedItems(
  initiative: SemanticWorkItemV2,
  items: SemanticWorkItemV2[],
  byKey: Map<string, SemanticWorkItemV2>,
) {
  const links = initiative.issueLinks.filter(
    (x) =>
      x.linkTypeId === Q3_CONFIG.polarisLinkTypeId &&
      norm(x.relation) === Q3_CONFIG.polarisDirection,
  );
  const parents = links
    .map((link) => byKey.get(link.key))
    .filter((x): x is SemanticWorkItemV2 => Boolean(x));
  const parentKeys = new Set(parents.map((x) => x.sourceKey));
  const related = items.filter(
    (x) =>
      parentKeys.has(x.parentKey.value ?? '') ||
      x.ancestorKeys.some((k) => parentKeys.has(k)) ||
      parents.some((p) => x.issueLinks.some((l) => l.key === p.sourceKey)),
  );
  return { links, parents, related };
}
function buildInitiative(
  item: SemanticWorkItemV2,
  all: SemanticWorkItemV2[],
  byKey: Map<string, SemanticWorkItemV2>,
): Q3Initiative {
  const kind = initiativeType(item)!;
  const executiveStage = stage(item.sourceStatus);
  const quarter = q3Quarter(item.quarters);
  const date = closeDate(item);
  const dateQ3 = inQ3(date);
  const candidate = quarter && executiveStage === 'CANDIDATE';
  const noGo = quarter && executiveStage === 'CANCELLED_NO_GO';
  const cancelled = quarter && CANCELLED.has(norm(item.sourceStatus));
  const committed = quarter && dateQ3 && !candidate && !noGo && !cancelled;
  const { links, parents, related } = linkedItems(item, all, byKey);
  const representations = links.map((link) => {
    const target = byKey.get(link.key);
    return {
      key: link.key,
      project: target?.sourceProject ?? 'INACCESSIBLE',
      issueType: target?.issueTypeName ?? 'INACCESSIBLE',
      status: target?.sourceStatus ?? 'INACCESSIBLE',
      linkType: link.linkTypeId ?? link.relation,
      direction: link.direction,
      confidence: target ? 'HIGH' : 'MEDIUM',
    } as DeliveryRepresentation;
  });
  const features = related.filter((x) => norm(x.issueTypeName) === 'feature');
  const completed = features.filter((x) =>
    FEATURE_DONE.has(norm(x.sourceStatus)),
  ).length;
  const featureCancelled = features.filter((x) =>
    FEATURE_CANCELLED.has(norm(x.sourceStatus)),
  ).length;
  const featureUnmapped = features.filter(
    (x) => !FEATURE_KNOWN.has(norm(x.sourceStatus)),
  ).length;
  const denominator = features.length - featureCancelled;
  const progressStatus: MetricStatus =
    denominator === 0
      ? 'UNAVAILABLE'
      : featureUnmapped
        ? 'PARTIAL'
        : 'AVAILABLE';
  const ratio = denominator
    ? Math.round((completed / denominator) * 10000) / 100
    : null;
  const release = releaseOf([...parents, ...related]);
  const riskGate = riskGateOf(related);
  const consolidatedStage = consolidated(
    executiveStage,
    release,
    riskGate,
    features,
  );
  const production = release === 'PRODUCTION';
  const stageConflicts: string[] = [];
  if (executiveStage === 'COMPLETED_ADMINISTRATIVE' && !production)
    stageConflicts.push('Cierre administrativo sin evidencia de producción.');
  if (quarter && date && !dateQ3)
    stageConflicts.push('Quarter Q3 con fecha objetivo fuera de Q3.');
  const qs = item.quarters.map(norm);
  const carryOver =
    qs.some((q) => q.includes('q1')) &&
    qs.some((q) => q.includes('q2')) &&
    qs.some((q) => q.includes('q3'))
      ? 'CHRONIC_CARRY_OVER'
      : qs.some((q) => q.includes('q2')) && qs.some((q) => q.includes('q3'))
        ? 'CARRY_OVER'
        : qs.some((q) => q.includes('q3')) && qs.some((q) => q.includes('q4'))
          ? 'CROSS_QUARTER_PLANNED'
          : 'NONE';
  const okrs = item.okrReferences;
  return {
    canonicalKey: item.sourceKey,
    initiativeType: kind,
    quarters: item.quarters,
    sourceStatus: item.sourceStatus,
    executiveStage,
    administrativelyCompleted: executiveStage === 'COMPLETED_ADMINISTRATIVE',
    productionConfirmed: production,
    completionOutcome: noGo
      ? 'NO_GO'
      : cancelled
        ? 'CANCELLED'
        : production
          ? 'DELIVERED'
          : executiveStage === 'COMPLETED_ADMINISTRATIVE'
            ? 'ADMINISTRATIVELY_COMPLETED'
            : [
                  'CANDIDATE',
                  'PLANNING',
                  'DISCOVERY',
                  'PREPARING',
                  'READY',
                  'BUILDING',
                  'REVIEW',
                  'RISK_GATE',
                  'BLOCKED',
                ].includes(executiveStage)
              ? 'NOT_COMPLETED'
              : 'UNKNOWN',
    declaredQ3: quarter,
    candidateQ3: candidate,
    noGoQ3: noGo,
    cancelledQ3: cancelled,
    committedQ3: committed,
    quarterDateConfirmed: dateQ3,
    dateWithoutQuarter: dateQ3 && !quarter,
    quarterWithoutDate: quarter && !date,
    quarterDateConflict: quarter && Boolean(date) && !dateQ3,
    activeNotCommitted:
      !quarter &&
      item.updatedAt.value !== null &&
      inQ3(item.updatedAt.value) &&
      !['COMPLETED_ADMINISTRATIVE', 'CANDIDATE', 'CANCELLED_NO_GO'].includes(
        executiveStage,
      ),
    deliveryRepresentations: representations,
    linkage:
      links.length === 0
        ? 'NO_DELIVERY_LINK'
        : links.length !== parents.length
          ? 'PARTIALLY_LINKED'
          : links.some((x) => x.direction !== 'OUTWARD')
            ? 'CONFLICTED_LINKAGE'
            : 'LINKED',
    featuresTotal: denominator,
    featuresCompleted: completed,
    featuresActive: features.filter(
      (x) =>
        !FEATURE_DONE.has(norm(x.sourceStatus)) &&
        !FEATURE_CANCELLED.has(norm(x.sourceStatus)),
    ).length,
    featuresBlocked: features.filter((x) =>
      FEATURE_BLOCKED.has(norm(x.sourceStatus)),
    ).length,
    featuresCancelled: featureCancelled,
    featuresUnmapped: featureUnmapped,
    featureCompletionRatio: ratio,
    featureCoverage: features.length
      ? Math.round(
          ((features.length - featureUnmapped) / features.length) * 10000,
        ) / 100
      : 0,
    progressStatus,
    consolidatedStage,
    stageSource:
      release !== 'NO_RELEASE_EVIDENCE'
        ? 'DELIVERY_RELEASE'
        : riskGate !== 'UNKNOWN'
          ? 'RISK_MATRIX'
          : features.length
            ? 'FEATURES'
            : 'DSP_STATUS',
    stageConfidence:
      release !== 'NO_RELEASE_EVIDENCE' || features.length
        ? 'HIGH'
        : executiveStage !== 'UNKNOWN'
          ? 'MEDIUM'
          : 'NONE',
    stageEvidence: [
      `DSP:${executiveStage}`,
      `Features:${features.length}`,
      `Risk:${riskGate}`,
      `Release:${release}`,
    ],
    stageConflicts,
    carryOver,
    eco: item.resolvedEco.value,
    team: item.resolvedTeam.value,
    okrClassification:
      okrs.length > 1
        ? 'MULTIPLE_REFERENCES'
        : okrs.length === 1
          ? 'ALIGNED_REFERENCE'
          : 'NO_REFERENCE',
    riskGate,
    release,
  };
}
const risk = (
  type: RiskType,
  severity: ExecutiveRisk['severity'],
  affected: Q3Initiative[],
  evidence: string[],
  businessImpact: string,
  suggestedAction: string,
  decision: ExecutiveRisk['requiresExecutiveDecision'],
): ExecutiveRisk => ({
  type,
  severity,
  affectedInitiativeCount: affected.length,
  affectedEco: [...new Set(affected.flatMap((x) => (x.eco ? [x.eco] : [])))],
  affectedTeam: [...new Set(affected.flatMap((x) => (x.team ? [x.team] : [])))],
  evidence,
  confidence: 'HIGH',
  businessImpact,
  suggestedAction,
  requiresExecutiveDecision: decision,
});
function buildRisks(
  initiatives: Q3Initiative[],
  byKey: Map<string, SemanticWorkItemV2>,
  lastUpdated: string,
) {
  const out: ExecutiveRisk[] = [];
  const committed = initiatives.filter((x) => x.committedQ3);
  const blocked = committed.filter(
    (x) =>
      (x.consolidatedStage === 'BUILDING' && x.executiveStage === 'BLOCKED') ||
      x.featuresBlocked > 0,
  );
  if (blocked.length)
    out.push(
      risk(
        'EXPLICITLY_BLOCKED',
        'CRITICAL',
        blocked,
        ['Estado explícito de bloqueo en DSP o Feature.'],
        'Valor comprometido detenido.',
        'Resolver impedimento y confirmar responsable organizacional.',
        'Líder ECO',
      ),
    );
  const noDelivery = committed.filter((x) => x.linkage === 'NO_DELIVERY_LINK');
  if (noDelivery.length)
    out.push(
      risk(
        'NO_DELIVERY',
        'HIGH',
        noDelivery,
        ['Sin relación Polaris 10006 resoluble.'],
        'El avance no puede verificarse contra delivery.',
        'Completar el vínculo DSP–delivery.',
        'CPO',
      ),
    );
  const chronic = committed.filter((x) => x.carryOver === 'CHRONIC_CARRY_OVER');
  if (chronic.length)
    out.push(
      risk(
        'CARRY_OVER_CHRONIC',
        'HIGH',
        chronic,
        ['Quarters contiene Q1, Q2 y Q3.'],
        'Compromiso arrastrado por tres trimestres.',
        'Reconfirmar alcance, prioridad o cierre.',
        'CPO',
      ),
    );
  const conflict = initiatives.filter(
    (x) => x.quarterDateConflict || x.stageConflicts.length,
  );
  if (conflict.length)
    out.push(
      risk(
        'DATA_CONFLICT',
        'MEDIUM',
        conflict,
        ['Quarter/fecha o cierre/producción presentan conflicto.'],
        'Reduce confianza de decisión.',
        'Corregir evidencia en la fuente canónica.',
        'Otro',
      ),
    );
  const waiting = committed.filter((x) => x.riskGate === 'WAITING_APPROVAL');
  if (waiting.length)
    out.push(
      risk(
        'APPROVAL_AGING',
        'HIGH',
        waiting,
        [
          `Umbral FlowOS configurable: ${Q3_CONFIG.thresholds.approvalAgingDays} días.`,
        ],
        'Aprobación de riesgo pendiente antes de avanzar.',
        'Revisar antigüedad y escalar solo las vencidas.',
        'Riesgos',
      ),
    );
  const stalled = committed.filter((x) => {
    const item = byKey.get(x.canonicalKey);
    const age = daysSince(item?.updatedAt.value ?? null, lastUpdated);
    return (
      age !== null &&
      age > Q3_CONFIG.thresholds.stalledDays &&
      !['PRODUCTION_CONFIRMED', 'NO_GO', 'CANCELLED'].includes(
        x.consolidatedStage,
      )
    );
  });
  if (stalled.length)
    out.push(
      risk(
        'STALLED',
        'MEDIUM',
        stalled,
        [
          `Sin actualización por más de ${Q3_CONFIG.thresholds.stalledDays} días; umbral FlowOS configurable.`,
        ],
        'Posible detención del flujo.',
        'Validar estado real antes de intervenir.',
        'Líder ECO',
      ),
    );
  return out.sort(
    (a, b) =>
      ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(a.severity) -
      ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(b.severity),
  );
}
export function buildQ3Overview(
  snapshot: SemanticJiraSnapshotRecord,
): Q3Overview {
  const hasSeparatedDatasets = Boolean(snapshot.datasets);
  const portfolioItems = hasSeparatedDatasets
    ? snapshot.items.filter((item) =>
        ['PORTFOLIO', 'PORTFOLIO_CONTROL'].includes(item.datasetRole ?? ''),
      )
    : snapshot.items;
  const items = hasSeparatedDatasets
    ? [
        ...portfolioItems,
        ...snapshot.items.filter((item) => item.datasetRole === 'RELATIONSHIP'),
      ]
    : snapshot.items;
  const byKey = new Map(items.map((x) => [x.sourceKey, x]));
  const initiatives = portfolioItems
    .filter((x) => initiativeType(x))
    .map((x) => buildInitiative(x, items, byKey));
  const declared = initiatives.filter((x) => x.declaredQ3);
  const committed = initiatives.filter((x) => x.committedQ3);
  const risks = buildRisks(initiatives, byKey, snapshot.completedAt);
  const progressEligible = committed.filter(
    (x) => x.progressStatus !== 'UNAVAILABLE',
  );
  const progressCoverage = committed.length
    ? progressEligible.length / committed.length
    : 0;
  const delivered = committed.filter((x) => x.productionConfirmed);
  const administrative = committed.filter(
    (x) => x.administrativelyCompleted && !x.productionConfirmed,
  );
  const executing = committed.filter((x) =>
    [
      'BUILDING',
      'QA',
      'READY_FOR_QA',
      'RISK_IN_PROGRESS',
      'WAITING_RISK_APPROVAL',
      'READY_FOR_RELEASE',
      'DEPLOYMENT',
      'INTERNAL_TESTING',
      'MASSIFICATION',
    ].includes(x.consolidatedStage),
  );
  const notStarted = committed.filter((x) =>
    ['PLANNING', 'DISCOVERY', 'CANDIDATE', 'UNKNOWN'].includes(
      x.consolidatedStage,
    ),
  );
  const blocked = committed.filter(
    (x) => x.executiveStage === 'BLOCKED' || x.featuresBlocked > 0,
  );
  const carry = committed.filter((x) =>
    ['CARRY_OVER', 'CHRONIC_CARRY_OVER'].includes(x.carryOver),
  );
  const q3QuarterCoverage = initiatives.length
    ? Math.round(
        (initiatives.filter((x) => x.quarters.length).length /
          initiatives.length) *
          10000,
      ) / 100
    : 0;
  const q3DateCoverage = initiatives.length
    ? Math.round(
        (initiatives.filter((x) => closeDate(byKey.get(x.canonicalKey)!))
          .length /
          initiatives.length) *
          10000,
      ) / 100
    : 0;
  const commitmentCoverage = Math.min(q3QuarterCoverage, q3DateCoverage);
  const portfolioDatasetReady =
    snapshot.datasets?.portfolio.status === 'COMPLETED' || !snapshot.datasets;
  const commitmentStatus: MetricStatus =
    !portfolioDatasetReady || commitmentCoverage === 0
      ? 'UNAVAILABLE'
      : commitmentCoverage === 100
        ? 'AVAILABLE'
        : 'PARTIAL';
  const quarterStatus: MetricStatus =
    q3QuarterCoverage === 0
      ? 'UNAVAILABLE'
      : q3QuarterCoverage === 100
        ? 'AVAILABLE'
        : 'PARTIAL';
  const commitmentValue = (value: number) =>
    commitmentStatus === 'UNAVAILABLE' ? null : value;
  const pulse: Record<string, Q3Metric> = {
    commitment: metric(
      snapshot,
      commitmentValue(committed.length),
      commitmentStatus,
      initiatives.length,
      declared.length,
      commitmentCoverage,
      ['DSP canónico + Quarter Q3 + fecha Q3 + exclusiones explícitas.'],
    ),
    candidates: metric(
      snapshot,
      quarterStatus === 'UNAVAILABLE'
        ? null
        : declared.filter((x) => x.candidateQ3).length,
      quarterStatus,
      initiatives.length,
      declared.length,
      q3QuarterCoverage,
      ['Parking lot declarado Q3.'],
    ),
    delivered: metric(
      snapshot,
      commitmentValue(delivered.length),
      commitmentStatus,
      committed.length,
      committed.length,
      commitmentCoverage,
      ['Producción confirmada por delivery/release; Finalizada no basta.'],
    ),
    administrativeClosures: metric(
      snapshot,
      commitmentValue(administrative.length),
      commitmentStatus,
      committed.length,
      committed.length,
      commitmentCoverage,
      ['Finalizada DSP sin evidencia de producción.'],
    ),
    noGoCancelled: metric(
      snapshot,
      quarterStatus === 'UNAVAILABLE'
        ? null
        : declared.filter((x) => x.noGoQ3 || x.cancelledQ3).length,
      quarterStatus,
      declared.length,
      declared.length,
      q3QuarterCoverage,
      ['No-Go y estados explícitos de cancelación.'],
    ),
    executing: metric(
      snapshot,
      commitmentValue(executing.length),
      commitmentStatus,
      committed.length,
      committed.length,
      commitmentCoverage,
      ['Estado consolidado de delivery.'],
    ),
    notStarted: metric(
      snapshot,
      commitmentValue(notStarted.length),
      commitmentStatus,
      committed.length,
      committed.length,
      commitmentCoverage,
      ['Sin evidencia de ejecución en el estado consolidado.'],
    ),
    blocked: metric(
      snapshot,
      commitmentValue(blocked.length),
      commitmentStatus,
      committed.length,
      committed.length,
      commitmentCoverage,
      [
        'Bloqueo explícito; matrices abiertas no se consideran automáticamente bloqueo.',
      ],
    ),
    carryOver: metric(
      snapshot,
      commitmentValue(carry.length),
      commitmentStatus,
      committed.length,
      committed.length,
      commitmentCoverage,
      ['Quarters multivalor Q2+Q3 o Q1+Q2+Q3.'],
    ),
    progress: metric(
      snapshot,
      progressCoverage >= Q3_CONFIG.thresholds.minimumProgressCoverage &&
        progressEligible.length
        ? Math.round(
            (progressEligible.reduce(
              (n, x) => n + (x.featureCompletionRatio ?? 0),
              0,
            ) /
              progressEligible.length) *
              100,
          ) / 100
        : null,
      progressCoverage >= Q3_CONFIG.thresholds.minimumProgressCoverage
        ? 'PARTIAL'
        : 'UNAVAILABLE',
      committed.length,
      committed.length,
      Math.round(progressCoverage * 10000) / 100,
      ['FCR promedio únicamente sobre iniciativas con Features vinculadas.'],
      progressCoverage < Q3_CONFIG.thresholds.minimumProgressCoverage
        ? ['Cobertura inferior al umbral FlowOS configurable.']
        : [],
    ),
  };
  const flowNames: Record<ConsolidatedStage, string> = {
    NO_GO: 'Completed',
    CANCELLED: 'Completed',
    PRODUCTION_CONFIRMED: 'Production',
    MASSIFICATION: 'Massification',
    INTERNAL_TESTING: 'Review',
    DEPLOYMENT: 'Deployment',
    READY_FOR_RELEASE: 'Ready',
    WAITING_RISK_APPROVAL: 'Risk Gate',
    RISK_IN_PROGRESS: 'Risk Gate',
    QA: 'Review',
    READY_FOR_QA: 'Review',
    BUILDING: 'Building',
    DISCOVERY: 'Exploring',
    PLANNING: 'Planning',
    CANDIDATE: 'Planning',
    UNKNOWN: 'Preparing',
  };
  const flowStage = (item: Q3Initiative) =>
    item.executiveStage === 'BLOCKED' || item.featuresBlocked > 0
      ? 'Blocked'
      : flowNames[item.consolidatedStage];
  const flow = (
    commitmentStatus === 'UNAVAILABLE'
      ? []
      : [...new Set([...Object.values(flowNames), 'Blocked'])]
  ).map((name) => {
    const count = committed.filter((x) => flowStage(x) === name).length;
    return {
      stage: name,
      initiatives: count,
      percentage: committed.length
        ? Math.round((count / committed.length) * 10000) / 100
        : 0,
      coverage: 100,
      attention: ['Blocked', 'Risk Gate'].includes(name) && count > 0,
    };
  });
  const ecoNames =
    commitmentStatus === 'UNAVAILABLE'
      ? []
      : [...new Set(committed.map((x) => x.eco ?? 'UNKNOWN'))];
  const ecoHealth = ecoNames.map((eco) => {
    const set = committed.filter((x) => (x.eco ?? 'UNKNOWN') === eco);
    const eligible = set.filter((x) => x.featureCompletionRatio !== null);
    return {
      eco,
      committed: set.length,
      executing: set.filter((x) => executing.includes(x)).length,
      notStarted: set.filter((x) => notStarted.includes(x)).length,
      delivered: set.filter((x) => x.productionConfirmed).length,
      blocked: set.filter((x) => blocked.includes(x)).length,
      carryOver: set.filter((x) => carry.includes(x)).length,
      progress: eligible.length
        ? Math.round(
            (eligible.reduce((n, x) => n + (x.featureCompletionRatio ?? 0), 0) /
              eligible.length) *
              100,
          ) / 100
        : null,
      risks: risks.filter((r) => r.affectedEco.includes(eco)).length,
      confidence: eligible.length ? 'MEDIUM' : ('LOW' as Confidence),
    };
  });
  const mix = (
    commitmentStatus === 'UNAVAILABLE' ? [] : Object.values(INITIATIVE_TYPES)
  ).map((type) => ({
    type,
    count: committed.filter((x) => x.initiativeType === type).length,
    percentage: committed.length
      ? Math.round(
          (committed.filter((x) => x.initiativeType === type).length /
            committed.length) *
            10000,
        ) / 100
      : 0,
  }));
  const okrCoverage = initiatives.length
    ? Math.round(
        (initiatives.filter((x) => x.okrClassification !== 'NO_REFERENCE')
          .length /
          initiatives.length) *
          10000,
      ) / 100
    : 0;
  const linkageWith = initiatives.filter(
    (x) => x.deliveryRepresentations.length > 0,
  ).length;
  const matrices = items.filter((x) =>
    ['matriz de riesgos', 'matriz riesgos'].includes(norm(x.issueTypeName)),
  );
  const committedRelationKeys = new Set(
    committed.flatMap((x) => [
      x.canonicalKey,
      ...x.deliveryRepresentations.map((representation) => representation.key),
    ]),
  );
  const isLinkedToCommitment = (item: SemanticWorkItemV2) =>
    committedRelationKeys.has(item.parentKey.value ?? '') ||
    item.ancestorKeys.some((key) => committedRelationKeys.has(key)) ||
    item.issueLinks.some((link) => committedRelationKeys.has(link.key));
  const actionPlans = items.filter(
    (x) => norm(x.issueTypeName) === 'plan de accion',
  );
  const dependencies = items.filter(
    (x) => norm(x.issueTypeName) === 'dependencia',
  );
  const isFinalControl = (item: SemanticWorkItemV2) =>
    [
      'finalizado',
      'finalizada',
      'done',
      'completed',
      'closed',
      'cancelado',
      'cancelada',
    ].includes(norm(item.sourceStatus));
  const linkedActionPlans = actionPlans.filter(isLinkedToCommitment);
  const linkedDependencies = dependencies.filter(isLinkedToCommitment);
  const overdueActionPlans = linkedActionPlans.filter(
    (item) =>
      item.dueDate.value &&
      new Date(item.dueDate.value) < new Date(snapshot.completedAt) &&
      !isFinalControl(item),
  );
  const matrixStates = [
    'NOT_STARTED',
    'IN_KICKOFF',
    'IN_DEFINITION',
    'IN_MANAGEMENT',
    'WAITING_APPROVAL',
    'COMPLETED',
    'CANCELLED',
    'UNKNOWN',
  ] as const;
  const dimensionCoverage = (count: number) =>
    initiatives.length
      ? Math.round((count / initiatives.length) * 10000) / 100
      : 0;
  const dimensionStatus = (coverage: number): MetricStatus =>
    coverage === 0 ? 'UNAVAILABLE' : coverage === 100 ? 'AVAILABLE' : 'PARTIAL';
  const quarterCoverage = dimensionCoverage(
    initiatives.filter((x) => x.quarters.length).length,
  );
  const targetCoverage = dimensionCoverage(
    initiatives.filter((x) => closeDate(byKey.get(x.canonicalKey)!) !== null)
      .length,
  );
  const teamCoverage = dimensionCoverage(
    initiatives.filter((x) => x.team).length,
  );
  const ecoCoverage = dimensionCoverage(
    initiatives.filter((x) => x.eco).length,
  );
  const linkageCoverage = dimensionCoverage(linkageWith);
  const releaseCoverage = dimensionCoverage(
    initiatives.filter((x) => x.release !== 'NO_RELEASE_EVIDENCE').length,
  );
  const agingCoverage = dimensionCoverage(
    initiatives.filter((x) => byKey.get(x.canonicalKey)?.updatedAt.value)
      .length,
  );
  const dataConfidence: Record<string, Q3Metric> = {
    quarter: metric(
      snapshot,
      quarterCoverage,
      dimensionStatus(quarterCoverage),
      initiatives.length,
      initiatives.length,
      quarterCoverage,
      ['customfield_12634 Quarters.'],
    ),
    targetDate: metric(
      snapshot,
      targetCoverage,
      dimensionStatus(targetCoverage),
      initiatives.length,
      initiatives.length,
      targetCoverage,
      ['Fecha de cierre/objetivo.'],
    ),
    team: metric(
      snapshot,
      teamCoverage,
      dimensionStatus(teamCoverage),
      initiatives.length,
      initiatives.length,
      teamCoverage,
      ['Resolución semántica de equipo.'],
    ),
    eco: metric(
      snapshot,
      ecoCoverage,
      dimensionStatus(ecoCoverage),
      initiatives.length,
      initiatives.length,
      ecoCoverage,
      ['Mapa explícito equipo–ECO.'],
    ),
    dspDelivery: metric(
      snapshot,
      linkageCoverage,
      dimensionStatus(linkageCoverage),
      initiatives.length,
      initiatives.length,
      linkageCoverage,
      ['Polaris link type 10006, is implemented by.'],
    ),
    features: metric(
      snapshot,
      Math.round(progressCoverage * 10000) / 100,
      progressCoverage >= Q3_CONFIG.thresholds.minimumProgressCoverage
        ? 'PARTIAL'
        : 'UNAVAILABLE',
      committed.length,
      committed.length,
      Math.round(progressCoverage * 10000) / 100,
      ['Features directas de delivery parents.'],
    ),
    progress: metric(
      snapshot,
      Math.round(progressCoverage * 10000) / 100,
      progressCoverage >= Q3_CONFIG.thresholds.minimumProgressCoverage
        ? 'PARTIAL'
        : 'UNAVAILABLE',
      committed.length,
      committed.length,
      Math.round(progressCoverage * 10000) / 100,
      ['FCR como indicador primario.'],
    ),
    riskLinkage: metric(
      snapshot,
      matrices.length,
      matrices.length ? 'PARTIAL' : 'UNAVAILABLE',
      items.length,
      matrices.length,
      matrices.length ? 100 : 0,
      ['Matrices relacionadas por evidencia disponible.'],
    ),
    release: metric(
      snapshot,
      releaseCoverage,
      dimensionStatus(releaseCoverage),
      initiatives.length,
      initiatives.length,
      releaseCoverage,
      ['Plan Release, fixVersions y estados de release.'],
    ),
    okr: metric(
      snapshot,
      okrCoverage,
      okrCoverage >= 50 ? 'PARTIAL' : 'UNAVAILABLE',
      initiatives.length,
      initiatives.length,
      okrCoverage,
      ['Referencia Jira customfield_12162; Boja es la fuente oficial.'],
    ),
    aging: metric(
      snapshot,
      agingCoverage,
      dimensionStatus(agingCoverage),
      initiatives.length,
      initiatives.length,
      agingCoverage,
      ['updatedAt solo para aging/actividad, nunca compromiso.'],
    ),
  };
  return {
    snapshot: {
      schemaVersion: 2,
      version: snapshot.version,
      syncMode: snapshot.syncMode,
      lastUpdated: snapshot.completedAt,
      truncated: snapshot.truncated,
      portfolioStatus: snapshot.datasets?.portfolio.status,
    },
    pulse,
    flow,
    attention: risks.slice(0, 5),
    ecoHealth,
    portfolioMix: mix,
    businessImpact: {
      status: 'UNAVAILABLE',
      message:
        'Impacto de negocio no medible con la cobertura actual de campos reales.',
    },
    dataConfidence,
    reconciliation: {
      declaredQ3: declared.length,
      candidateQ3: declared.filter((x) => x.candidateQ3).length,
      noGoQ3: declared.filter((x) => x.noGoQ3).length,
      cancelledQ3: declared.filter((x) => x.cancelledQ3).length,
      committedQ3: committed.length,
      activeNotCommitted: initiatives.filter((x) => x.activeNotCommitted)
        .length,
      quarterDateConfirmed: initiatives.filter((x) => x.quarterDateConfirmed)
        .length,
      dateWithoutQuarter: initiatives.filter((x) => x.dateWithoutQuarter)
        .length,
      quarterWithoutDate: initiatives.filter((x) => x.quarterWithoutDate)
        .length,
      quarterDateConflict: initiatives.filter((x) => x.quarterDateConflict)
        .length,
      executing: executing.length,
      notStarted: notStarted.length,
      administrativeClosures: administrative.length,
      productionConfirmed: delivered.length,
      carryOver: carry.length,
      chronicCarryOver: committed.filter(
        (x) => x.carryOver === 'CHRONIC_CARRY_OVER',
      ).length,
      crossQuarterPlanned: committed.filter(
        (x) => x.carryOver === 'CROSS_QUARTER_PLANNED',
      ).length,
    },
    linkage: {
      withDelivery: linkageWith,
      withoutDelivery: initiatives.length - linkageWith,
      multipleDeliveryParents: initiatives.filter(
        (x) => x.deliveryRepresentations.length > 1,
      ).length,
      orphanRepresentations: initiatives.reduce(
        (n, x) =>
          n +
          x.deliveryRepresentations.filter((y) => y.project === 'INACCESSIBLE')
            .length,
        0,
      ),
      coverage: initiatives.length
        ? Math.round((linkageWith / initiatives.length) * 10000) / 100
        : 0,
    },
    riskMatrix: Object.fromEntries(
      matrixStates.map((state) => [
        state,
        initiatives.filter((x) => x.riskGate === state).length,
      ]),
    ),
    controls: {
      actionPlans: {
        total: actionPlans.length,
        linked: linkedActionPlans.length,
        overdue: overdueActionPlans.length,
        status: linkedActionPlans.length ? 'PARTIAL' : 'UNAVAILABLE',
      },
      dependencies: {
        total: dependencies.length,
        linked: linkedDependencies.length,
        open: linkedDependencies.filter((item) => !isFinalControl(item)).length,
        status: linkedDependencies.length ? 'PARTIAL' : 'UNAVAILABLE',
      },
      releases: Object.fromEntries(
        [
          'NO_RELEASE_EVIDENCE',
          'RELEASE_PLANNED',
          'READY_FOR_RELEASE',
          'DEPLOYMENT',
          'INTERNAL_TESTING',
          'MASSIFICATION',
          'PRODUCTION',
          'RELEASE_BLOCKED',
        ].map((state) => [
          state,
          initiatives.filter((item) => item.release === state).length,
        ]),
      ) as Record<Q3Initiative['release'], number>,
    },
    okr: {
      classification: Object.fromEntries(
        [
          'ALIGNED_REFERENCE',
          'MULTIPLE_REFERENCES',
          'REFERENCE_UNRESOLVED',
          'NO_REFERENCE',
          'NOT_APPLICABLE',
        ].map((state) => [
          state,
          initiatives.filter((x) => x.okrClassification === state).length,
        ]),
      ),
      coverage: okrCoverage,
      metricStatus: okrCoverage >= 50 ? 'PARTIAL' : 'UNAVAILABLE',
      message:
        okrCoverage >= 50
          ? 'Referencias Jira disponibles; Boja sigue siendo la fuente oficial.'
          : 'Alineación con Boja no medible desde Jira.',
    },
    risks,
    initiatives,
  };
}
export function sanitizeInitiatives(overview: Q3Overview, scope: string) {
  const allowed =
    scope === 'Organización'
      ? overview.initiatives
      : overview.initiatives.filter(
          (x) => scope === 'Delivery' || x.eco === scope,
        );
  return allowed.map((x, index) => ({
    initiativeRef: `DSP-${String(index + 1).padStart(3, '0')}`,
    initiativeType: x.initiativeType,
    quarters: x.quarters,
    sourceStatus: x.sourceStatus,
    executiveStage: x.executiveStage,
    completionOutcome: x.completionOutcome,
    committedQ3: x.committedQ3,
    featureCompletionRatio: x.featureCompletionRatio,
    progressStatus: x.progressStatus,
    consolidatedStage: x.consolidatedStage,
    carryOver: x.carryOver,
    eco: x.eco,
    linkage: x.linkage,
    riskGate: x.riskGate,
    release: x.release,
  }));
}
