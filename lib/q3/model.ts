import type { Confidence, SemanticWorkItemV2 } from '@/lib/jira/live';
import type { SemanticJiraSnapshotRecord } from '@/lib/jira/store';
import { Q3_CONFIG } from './config';

export type MetricStatus = 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
export type CommitmentStage =
  | 'NOT_STARTED'
  | 'DISCOVERY'
  | 'IN_EXECUTION'
  | 'IN_REVIEW'
  | 'IN_RISK_GATE'
  | 'BLOCKED'
  | 'ADMINISTRATIVELY_COMPLETED'
  | 'UNKNOWN_STAGE';
export type DeliveryApplicability =
  'REQUIRED' | 'OPTIONAL' | 'NOT_YET_REQUIRED' | 'NOT_APPLICABLE' | 'UNKNOWN';
export type ProgressApplicability =
  | 'FEATURE_BASED'
  | 'NON_FEATURE_DELIVERY'
  | 'NOT_YET_APPLICABLE'
  | 'NOT_APPLICABLE'
  | 'UNKNOWN';
export type RiskApplicability =
  | 'REQUIRED_NOW'
  | 'REQUIRED_LATER'
  | 'NOT_REQUIRED'
  | 'NOT_APPLICABLE'
  | 'UNKNOWN';
export type ReleaseApplicability =
  'REQUIRED' | 'NOT_YET_REQUIRED' | 'NOT_APPLICABLE' | 'UNKNOWN';
export type RiskGateStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'WAITING_OFFICIAL_APPROVAL'
  | 'APPROVED'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'UNKNOWN';
export type PipelineStage =
  | 'NOT_STARTED'
  | 'FEATURE_EXECUTION'
  | 'RISK_GATE'
  | 'WAITING_OFFICIAL_APPROVAL'
  | 'RELEASE_READINESS'
  | 'PRODUCTION'
  | 'UNKNOWN';
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
  summary: string;
  targetDate: string | null;
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
  commitmentStage: CommitmentStage | null;
  quarterConsistency: 'CONSISTENT' | 'DATE_OUTSIDE_QUARTER' | 'DATE_MISSING';
  commitmentConfidence: Confidence;
  riskSignal: 'DATA_CONFLICT' | null;
  quarterDateConfirmed: boolean;
  dateWithoutQuarter: boolean;
  quarterWithoutDate: boolean;
  quarterDateConflict: boolean;
  activeNotCommitted: boolean;
  deliveryRepresentations: DeliveryRepresentation[];
  deliveryApplicability: DeliveryApplicability;
  deliveryApplicabilityEvidence: string[];
  deliveryApplicabilityConfidence: Confidence;
  progressApplicability: ProgressApplicability;
  riskApplicability: RiskApplicability;
  releaseApplicability: ReleaseApplicability;
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
  reasonForDelay: string | null;
  replanningDeclared: boolean | null;
  previousTargetDate: string | null;
  targetDateChangeCount: number;
  lastTargetDateChangedAt: string | null;
  quarterChangeCount: number;
  lastQuarterChangedAt: string | null;
  hasReplanningEvidence: boolean;
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
  riskGateStatus: RiskGateStatus;
  riskDomains: { total: number; approved: number; applicable: number };
  pipelineStage: PipelineStage;
  blocked: boolean;
  release:
    | 'NO_RELEASE_EVIDENCE'
    | 'RELEASE_PLANNED'
    | 'RELEASE_APPROVED'
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
  commitment: Record<string, Q3Metric<number>>;
  delivery: Record<string, Q3Metric<number>>;
  progress: Record<string, Q3Metric<number>>;
  risk: Record<string, Q3Metric<number>>;
  release: Record<string, Q3Metric<number>>;
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
const PASS_RISK_STATUS = new Set(['finalizado', 'finalizada', 'aprobado']);
const RISK_DOMAIN_NAMES = [
  ['procesos'],
  ['continuidad del negocio', 'continuidad'],
  ['datos personales'],
  ['tecnologia'],
  ['ciberseguridad y seguridad de la informacion', 'ciberseguridad'],
] as const;
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
const commitmentStageOf = (value: ExecutiveStage): CommitmentStage =>
  (
    ({
      PLANNING: 'NOT_STARTED',
      DISCOVERY: 'DISCOVERY',
      BUILDING: 'IN_EXECUTION',
      PREPARING: 'IN_EXECUTION',
      REVIEW: 'IN_REVIEW',
      RISK_GATE: 'IN_RISK_GATE',
      BLOCKED: 'BLOCKED',
      COMPLETED_ADMINISTRATIVE: 'ADMINISTRATIVELY_COMPLETED',
    }) as Partial<Record<ExecutiveStage, CommitmentStage>>
  )[value] ?? 'UNKNOWN_STAGE';
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
  const releaseItems = items.filter(
    (x) =>
      norm(x.issueTypeName) === 'plan release' ||
      (norm(x.issueTypeName) !== 'feature' &&
        !['CONTROL_ITEM', 'SUBTASK'].includes(x.hierarchyLevel)),
  );
  const statuses = releaseItems.map((x) => norm(x.sourceStatus));
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
  const plans = releaseItems.filter(
    (x) => norm(x.issueTypeName) === 'plan release',
  );
  if (plans.some((x) => PASS_RISK_STATUS.has(norm(x.sourceStatus))))
    return 'RELEASE_APPROVED';
  if (plans.length || releaseItems.some((x) => x.fixVersionIds.length))
    return 'RELEASE_PLANNED';
  return 'NO_RELEASE_EVIDENCE';
};
const isRiskMatrix = (item: SemanticWorkItemV2) =>
  item.issueTypeId.value === '10210' ||
  ['matriz de riesgos', 'matriz riesgos'].includes(norm(item.issueTypeName));
const riskDomainIndex = (item: SemanticWorkItemV2) => {
  const value = norm(item.summary);
  return RISK_DOMAIN_NAMES.findIndex((aliases) =>
    aliases.some((alias) => value === alias || value.includes(alias)),
  );
};
const riskGateOf = (items: SemanticWorkItemV2[]) => {
  const structuralKeys = new Set(
    items
      .filter(
        (candidate) =>
          items.filter(
            (child) =>
              child.parentKey.value === candidate.sourceKey &&
              riskDomainIndex(child) >= 0,
          ).length >= 3,
      )
      .map((x) => x.sourceKey),
  );
  const matrices = items.filter(
    (x) => isRiskMatrix(x) || structuralKeys.has(x.sourceKey),
  );
  if (!matrices.length)
    return {
      legacy: 'UNKNOWN' as const,
      status: 'UNKNOWN' as RiskGateStatus,
      domains: { total: 0, approved: 0, applicable: 0 },
    };
  const matrixKeys = new Set(matrices.map((x) => x.sourceKey));
  const domains = items.filter(
    (x) =>
      riskDomainIndex(x) >= 0 &&
      (matrixKeys.has(x.parentKey.value ?? '') ||
        x.ancestorKeys.some((key) => matrixKeys.has(key))),
  );
  const uniqueDomains = [
    ...new Map(domains.map((x) => [riskDomainIndex(x), x])).values(),
  ];
  const approved = uniqueDomains.filter(
    (x) =>
      PASS_RISK_STATUS.has(norm(x.sourceStatus)) ||
      norm(x.sourceStatus) === 'no aplica',
  );
  const detail = {
    total: uniqueDomains.length,
    approved: approved.length,
    applicable: uniqueDomains.filter(
      (x) => norm(x.sourceStatus) !== 'no aplica',
    ).length,
  };
  const states = matrices.map((x) => norm(x.sourceStatus));
  const allStates = [
    ...states,
    ...uniqueDomains.map((x) => norm(x.sourceStatus)),
  ];
  if (allStates.some((x) => ['bloqueado', 'blocked'].includes(x)))
    return {
      legacy: 'IN_MANAGEMENT' as const,
      status: 'BLOCKED' as RiskGateStatus,
      domains: detail,
    };
  if (states.includes('aprobacion por oficial'))
    return {
      legacy: 'WAITING_APPROVAL' as const,
      status: 'WAITING_OFFICIAL_APPROVAL' as RiskGateStatus,
      domains: detail,
    };
  if (
    states.some((x) =>
      [
        'gestion',
        'gestion controles',
        'definicion controles',
        'kickoff',
      ].includes(x),
    )
  )
    return {
      legacy: 'IN_MANAGEMENT' as const,
      status: 'IN_PROGRESS' as RiskGateStatus,
      domains: detail,
    };
  if (states.includes('tareas por hacer'))
    return {
      legacy: 'NOT_STARTED' as const,
      status: 'NOT_STARTED' as RiskGateStatus,
      domains: detail,
    };
  if (states.includes('despriorizado'))
    return {
      legacy: 'CANCELLED' as const,
      status: 'CANCELLED' as RiskGateStatus,
      domains: detail,
    };
  if (
    states.every((x) => PASS_RISK_STATUS.has(x)) &&
    uniqueDomains.length === 5 &&
    approved.length === 5
  )
    return {
      legacy: 'COMPLETED' as const,
      status: 'APPROVED' as RiskGateStatus,
      domains: detail,
    };
  return {
    legacy: 'UNKNOWN' as const,
    status: 'UNKNOWN' as RiskGateStatus,
    domains: detail,
  };
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
function pipelineStageOf(
  featureRatio: number | null,
  riskGate: RiskGateStatus,
  release: Q3Initiative['release'],
): PipelineStage {
  if (release === 'PRODUCTION') return 'PRODUCTION';
  if (featureRatio !== null && featureRatio < 100)
    return featureRatio === 0 ? 'NOT_STARTED' : 'FEATURE_EXECUTION';
  if (riskGate === 'WAITING_OFFICIAL_APPROVAL')
    return 'WAITING_OFFICIAL_APPROVAL';
  if (['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED'].includes(riskGate))
    return 'RISK_GATE';
  if (riskGate === 'APPROVED') return 'RELEASE_READINESS';
  return featureRatio === 100 ? 'UNKNOWN' : 'NOT_STARTED';
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
  const relatedKeys = new Set(parentKeys);
  let changed = true;
  while (changed) {
    changed = false;
    for (const candidate of items) {
      if (relatedKeys.has(candidate.sourceKey)) continue;
      if (
        relatedKeys.has(candidate.parentKey.value ?? '') ||
        candidate.ancestorKeys.some((key) => relatedKeys.has(key)) ||
        candidate.issueLinks.some((link) => relatedKeys.has(link.key))
      ) {
        relatedKeys.add(candidate.sourceKey);
        changed = true;
      }
    }
  }
  const related = items.filter(
    (x) => relatedKeys.has(x.sourceKey) && !parentKeys.has(x.sourceKey),
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
  const committed = quarter && !candidate && !noGo && !cancelled;
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
  const riskGateEvidence = riskGateOf(related);
  const riskGate = riskGateEvidence.legacy;
  const consolidatedStage = consolidated(
    executiveStage,
    release,
    riskGate,
    features,
  );
  const production = release === 'PRODUCTION';
  const blockedEvidence =
    executiveStage === 'BLOCKED' ||
    related.some(
      (x) =>
        x.flagged.value === true ||
        FEATURE_BLOCKED.has(norm(x.sourceStatus)) ||
        Boolean(x.blockedReason.value),
    );
  const committedStage = committed ? commitmentStageOf(executiveStage) : null;
  const early = executiveStage === 'PLANNING' || executiveStage === 'DISCOVERY';
  const hasDelivery = links.length > 0;
  const technologyEvidence =
    hasDelivery || features.length > 0 || kind === 'TECH_DEBT';
  const advanced = [
    'BUILDING',
    'PREPARING',
    'REVIEW',
    'RISK_GATE',
    'BLOCKED',
    'COMPLETED_ADMINISTRATIVE',
  ].includes(executiveStage);
  const deliveryApplicability: DeliveryApplicability = hasDelivery
    ? 'REQUIRED'
    : early && !technologyEvidence
      ? 'NOT_YET_REQUIRED'
      : advanced && technologyEvidence
        ? 'REQUIRED'
        : 'UNKNOWN';
  const progressApplicability: ProgressApplicability = features.length
    ? 'FEATURE_BASED'
    : early
      ? 'NOT_YET_APPLICABLE'
      : hasDelivery
        ? 'NON_FEATURE_DELIVERY'
        : 'UNKNOWN';
  const riskApplicability: RiskApplicability =
    riskGate !== 'UNKNOWN'
      ? riskGate === 'CANCELLED'
        ? 'NOT_REQUIRED'
        : 'REQUIRED_NOW'
      : early
        ? 'REQUIRED_LATER'
        : ['RISK_GATE', 'REVIEW', 'COMPLETED_ADMINISTRATIVE'].includes(
              executiveStage,
            ) && technologyEvidence
          ? 'REQUIRED_NOW'
          : 'UNKNOWN';
  const releaseApplicability: ReleaseApplicability =
    production ||
    (['REVIEW', 'RISK_GATE', 'COMPLETED_ADMINISTRATIVE'].includes(
      executiveStage,
    ) &&
      technologyEvidence)
      ? 'REQUIRED'
      : early || executiveStage === 'BUILDING'
        ? 'NOT_YET_REQUIRED'
        : 'UNKNOWN';
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
    summary: item.summary,
    targetDate: date,
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
    commitmentStage: committedStage,
    quarterConsistency: !date
      ? 'DATE_MISSING'
      : dateQ3
        ? 'CONSISTENT'
        : 'DATE_OUTSIDE_QUARTER',
    commitmentConfidence: date && !dateQ3 ? 'MEDIUM' : 'HIGH',
    riskSignal: date && !dateQ3 ? 'DATA_CONFLICT' : null,
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
    deliveryApplicability,
    deliveryApplicabilityEvidence: hasDelivery
      ? ['Polaris delivery parent presente.']
      : early
        ? [
            'Estado DSP previo al inicio de ejecución; sin evidencia tecnológica iniciada.',
          ]
        : technologyEvidence
          ? ['Estado DSP de ejecución y evidencia tecnológica explícita.']
          : ['Evidencia insuficiente; no se infiere por ECO ni por nombre.'],
    deliveryApplicabilityConfidence:
      deliveryApplicability === 'UNKNOWN' ? 'LOW' : 'HIGH',
    progressApplicability,
    riskApplicability,
    releaseApplicability,
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
    reasonForDelay: item.reasonForDelay?.value ?? null,
    replanningDeclared: item.replanningDeclared?.value ?? null,
    previousTargetDate: item.previousTargetDate?.value ?? null,
    targetDateChangeCount: item.targetDateChangeCount ?? 0,
    lastTargetDateChangedAt: item.lastTargetDateChangedAt?.value ?? null,
    quarterChangeCount: item.quarterChangeCount ?? 0,
    lastQuarterChangedAt: item.lastQuarterChangedAt?.value ?? null,
    hasReplanningEvidence: item.hasReplanningEvidence ?? false,
    eco: item.resolvedEco.value,
    team: item.resolvedTeam.value,
    okrClassification:
      okrs.length > 1
        ? 'MULTIPLE_REFERENCES'
        : okrs.length === 1
          ? 'ALIGNED_REFERENCE'
          : 'NO_REFERENCE',
    riskGate,
    riskGateStatus: riskGateEvidence.status,
    riskDomains: riskGateEvidence.domains,
    pipelineStage: pipelineStageOf(ratio, riskGateEvidence.status, release),
    blocked: blockedEvidence,
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
  const noDelivery = committed.filter(
    (x) =>
      x.deliveryApplicability === 'REQUIRED' &&
      x.linkage === 'NO_DELIVERY_LINK',
  );
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
    (x) => x.progressApplicability === 'FEATURE_BASED',
  );
  const progressResolved = progressEligible.filter(
    (x) => x.progressStatus === 'AVAILABLE',
  );
  const progressCoverage = progressEligible.length
    ? progressResolved.length / progressEligible.length
    : 0;
  const delivered = committed.filter((x) => x.productionConfirmed);
  const administrative = committed.filter(
    (x) => x.administrativelyCompleted && !x.productionConfirmed,
  );
  const executing = committed.filter(
    (x) => x.commitmentStage === 'IN_EXECUTION',
  );
  const notStarted = committed.filter(
    (x) => x.commitmentStage === 'NOT_STARTED',
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
  const commitmentCoverage = q3QuarterCoverage;
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
      [
        'DSP canónico + Quarter Q3 + exclusiones explícitas; fecha valida consistencia.',
      ],
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
      ['Estados DSP En desarrollo y Avanzada.'],
    ),
    notStarted: metric(
      snapshot,
      commitmentValue(notStarted.length),
      commitmentStatus,
      committed.length,
      committed.length,
      commitmentCoverage,
      ['Estado DSP INN PLANNING.'],
    ),
    blocked: metric(
      snapshot,
      commitmentValue(blocked.length),
      commitmentStatus,
      progressEligible.length,
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
  const flowNames: Record<PipelineStage, string> = {
    NOT_STARTED: 'Sin iniciar',
    FEATURE_EXECUTION: 'Ejecución',
    RISK_GATE: 'Risk Gate',
    WAITING_OFFICIAL_APPROVAL: 'Aprobación',
    RELEASE_READINESS: 'Release',
    PRODUCTION: 'Producción',
    UNKNOWN: 'Sin evidencia',
  };
  const flowStage = (item: Q3Initiative) => flowNames[item.pipelineStage];
  const flow = (
    commitmentStatus === 'UNAVAILABLE'
      ? []
      : [...new Set(Object.values(flowNames))]
  ).map((name) => {
    const count = committed.filter((x) => flowStage(x) === name).length;
    return {
      stage: name,
      initiatives: count,
      percentage: committed.length
        ? Math.round((count / committed.length) * 10000) / 100
        : 0,
      coverage: 100,
      attention:
        ['Risk Gate', 'Aprobación', 'Sin evidencia'].includes(name) &&
        count > 0,
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
  const countMetric = (
    value: number,
    applicablePopulation: number,
    evidence: string[],
    coverage = applicablePopulation
      ? Math.round((value / applicablePopulation) * 10000) / 100
      : 0,
    warnings: string[] = [],
  ) =>
    metric(
      snapshot,
      value,
      commitmentStatus,
      declared.length,
      applicablePopulation,
      coverage,
      evidence,
      warnings,
    );
  const unknownMetric = (value: number, evidence: string[]) =>
    metric(
      snapshot,
      value,
      value ? 'PARTIAL' : commitmentStatus,
      declared.length,
      committed.length,
      committed.length
        ? Math.round((value / committed.length) * 10000) / 100
        : 0,
      evidence,
      value ? ['UNKNOWN reduce la confianza hasta resolver evidencia.'] : [],
    );
  const candidates = declared.filter((x) => x.candidateQ3);
  const noGo = declared.filter((x) => x.noGoQ3);
  const cancelled = declared.filter((x) => x.cancelledQ3);
  const stageCount = (stage: CommitmentStage) =>
    committed.filter((x) => x.commitmentStage === stage).length;
  const deliveryRequired = committed.filter(
    (x) => x.deliveryApplicability === 'REQUIRED',
  );
  const deliveryLinked = deliveryRequired.filter(
    (x) => x.deliveryRepresentations.length > 0,
  );
  const deliveryMissing = deliveryRequired.filter(
    (x) => x.deliveryRepresentations.length === 0,
  );
  const deliveryCoverageValue = deliveryRequired.length
    ? Math.round((deliveryLinked.length / deliveryRequired.length) * 10000) /
      100
    : 0;
  const riskRequiredNow = committed.filter(
    (x) => x.riskApplicability === 'REQUIRED_NOW',
  );
  const riskWithMatrix = riskRequiredNow.filter(
    (x) => x.riskGate !== 'UNKNOWN',
  );
  const riskCoverageValue = riskRequiredNow.length
    ? Math.round((riskWithMatrix.length / riskRequiredNow.length) * 10000) / 100
    : 0;
  const releaseRequired = committed.filter(
    (x) => x.releaseApplicability === 'REQUIRED',
  );
  const releaseEvidenced = releaseRequired.filter(
    (x) => x.release !== 'NO_RELEASE_EVIDENCE',
  );
  const releaseCoverageValue = releaseRequired.length
    ? Math.round((releaseEvidenced.length / releaseRequired.length) * 10000) /
      100
    : 0;
  const commitmentMetrics: Record<string, Q3Metric<number>> = {
    declared: countMetric(declared.length, declared.length, [
      'DSP canónico con Quarters Q3.',
    ]),
    candidates: countMetric(candidates.length, declared.length, [
      'Parking lot.',
    ]),
    committed: countMetric(committed.length, declared.length, [
      'Quarter Q3 menos exclusiones explícitas.',
    ]),
    noGo: countMetric(noGo.length, declared.length, ['No-Go explícito.']),
    cancelled: countMetric(cancelled.length, declared.length, [
      'Cancelación explícita.',
    ]),
    dateConflicts: countMetric(
      committed.filter((x) => x.quarterDateConflict).length,
      committed.length,
      ['Fecha fuera de Q3 no elimina compromiso.'],
    ),
    notStarted: countMetric(stageCount('NOT_STARTED'), committed.length, [
      'Estado DSP INN PLANNING.',
    ]),
    discovery: countMetric(stageCount('DISCOVERY'), committed.length, [
      'Estado DSP Discovery.',
    ]),
    inExecution: countMetric(stageCount('IN_EXECUTION'), committed.length, [
      'Estados DSP En desarrollo y Avanzada.',
    ]),
    inReview: countMetric(stageCount('IN_REVIEW'), committed.length, [
      'Estado DSP Revisión.',
    ]),
    inRiskGate: countMetric(stageCount('IN_RISK_GATE'), committed.length, [
      'Estado DSP Matriz de riesgo.',
    ]),
    blocked: countMetric(stageCount('BLOCKED'), committed.length, [
      'Estado DSP Bloqueado.',
    ]),
    administrativelyCompleted: countMetric(
      stageCount('ADMINISTRATIVELY_COMPLETED'),
      committed.length,
      ['Estado DSP Finalizada.'],
    ),
    productionConfirmed: countMetric(delivered.length, committed.length, [
      'Evidencia real de producción.',
    ]),
  };
  const deliveryMetrics: Record<string, Q3Metric<number>> = {
    required: countMetric(deliveryRequired.length, committed.length, [
      'Aplicabilidad REQUIRED.',
    ]),
    linked: countMetric(
      deliveryLinked.length,
      deliveryRequired.length,
      ['REQUIRED con Polaris.'],
      deliveryCoverageValue,
    ),
    missingReal: countMetric(deliveryMissing.length, deliveryRequired.length, [
      'REQUIRED sin Polaris.',
    ]),
    optional: countMetric(
      committed.filter((x) => x.deliveryApplicability === 'OPTIONAL').length,
      committed.length,
      ['Modelo alternativo explícito.'],
    ),
    notYetRequired: countMetric(
      committed.filter((x) => x.deliveryApplicability === 'NOT_YET_REQUIRED')
        .length,
      committed.length,
      ['Planning/Discovery sin ejecución iniciada.'],
    ),
    notApplicable: countMetric(
      committed.filter((x) => x.deliveryApplicability === 'NOT_APPLICABLE')
        .length,
      committed.length,
      ['No aplica explícito.'],
    ),
    unknown: unknownMetric(
      committed.filter((x) => x.deliveryApplicability === 'UNKNOWN').length,
      ['Evidencia insuficiente.'],
    ),
    coverage: countMetric(
      deliveryCoverageValue,
      deliveryRequired.length,
      ['REQUIRED con link / REQUIRED.'],
      deliveryCoverageValue,
    ),
  };
  const progressMetrics: Record<string, Q3Metric<number>> = {
    featureApplicable: countMetric(progressEligible.length, committed.length, [
      'FEATURE_BASED.',
    ]),
    featureResolved: countMetric(
      progressResolved.length,
      progressEligible.length,
      ['Features con estados mapeados.'],
      Math.round(progressCoverage * 10000) / 100,
    ),
    featurePartial: countMetric(
      progressEligible.filter((x) => x.progressStatus === 'PARTIAL').length,
      progressEligible.length,
      ['Alguna Feature no mapeada.'],
    ),
    featureUnavailable: countMetric(
      progressEligible.filter((x) => x.progressStatus === 'UNAVAILABLE').length,
      progressEligible.length,
      ['Población Feature sin FCR resoluble.'],
    ),
    nonFeatureDelivery: countMetric(
      committed.filter(
        (x) => x.progressApplicability === 'NON_FEATURE_DELIVERY',
      ).length,
      committed.length,
      ['Delivery no basado en Features.'],
    ),
    coverage: countMetric(
      Math.round(progressCoverage * 10000) / 100,
      progressEligible.length,
      ['FEATURE_RESOLVED / FEATURE_BASED.'],
      Math.round(progressCoverage * 10000) / 100,
    ),
  };
  const riskMetrics: Record<string, Q3Metric<number>> = {
    requiredNow: countMetric(riskRequiredNow.length, committed.length, [
      'Aplicabilidad REQUIRED_NOW.',
    ]),
    requiredLater: countMetric(
      committed.filter((x) => x.riskApplicability === 'REQUIRED_LATER').length,
      committed.length,
      ['Planning/Discovery.'],
    ),
    withMatrix: countMetric(
      riskWithMatrix.length,
      riskRequiredNow.length,
      ['REQUIRED_NOW con matriz.'],
      riskCoverageValue,
    ),
    missingMatrix: countMetric(
      riskRequiredNow.length - riskWithMatrix.length,
      riskRequiredNow.length,
      ['REQUIRED_NOW sin matriz.'],
    ),
    waitingApproval: countMetric(
      committed.filter((x) => x.riskGate === 'WAITING_APPROVAL').length,
      riskRequiredNow.length,
      ['Matriz esperando aprobación.'],
    ),
    unknown: unknownMetric(
      committed.filter((x) => x.riskApplicability === 'UNKNOWN').length,
      ['Evidencia insuficiente.'],
    ),
    coverage: countMetric(
      riskCoverageValue,
      riskRequiredNow.length,
      ['Con matriz / REQUIRED_NOW.'],
      riskCoverageValue,
    ),
  };
  const releaseMetrics: Record<string, Q3Metric<number>> = {
    required: countMetric(releaseRequired.length, committed.length, [
      'Aplicabilidad REQUIRED.',
    ]),
    evidenced: countMetric(
      releaseEvidenced.length,
      releaseRequired.length,
      ['REQUIRED con evidencia release.'],
      releaseCoverageValue,
    ),
    missingReal: countMetric(
      releaseRequired.length - releaseEvidenced.length,
      releaseRequired.length,
      ['REQUIRED sin evidencia.'],
    ),
    notYetRequired: countMetric(
      committed.filter((x) => x.releaseApplicability === 'NOT_YET_REQUIRED')
        .length,
      committed.length,
      ['Etapa temprana.'],
    ),
    notApplicable: countMetric(
      committed.filter((x) => x.releaseApplicability === 'NOT_APPLICABLE')
        .length,
      committed.length,
      ['No aplica explícito.'],
    ),
    unknown: unknownMetric(
      committed.filter((x) => x.releaseApplicability === 'UNKNOWN').length,
      ['Evidencia insuficiente.'],
    ),
    productionConfirmed: countMetric(delivered.length, releaseRequired.length, [
      'Producción real confirmada.',
    ]),
    coverage: countMetric(
      releaseCoverageValue,
      releaseRequired.length,
      ['Evidenciada / REQUIRED.'],
      releaseCoverageValue,
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
    commitment: commitmentMetrics,
    delivery: deliveryMetrics,
    progress: progressMetrics,
    risk: riskMetrics,
    release: releaseMetrics,
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
      notStartedStage: stageCount('NOT_STARTED'),
      discoveryStage: stageCount('DISCOVERY'),
      inExecutionStage: stageCount('IN_EXECUTION'),
      inReviewStage: stageCount('IN_REVIEW'),
      inRiskGateStage: stageCount('IN_RISK_GATE'),
      blockedStage: stageCount('BLOCKED'),
      administrativelyCompletedStage: stageCount('ADMINISTRATIVELY_COMPLETED'),
      unknownStage: stageCount('UNKNOWN_STAGE'),
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
          'RELEASE_APPROVED',
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
export function sanitizeInitiatives(
  overview: Q3Overview,
  scope: string,
  canViewSummary = false,
) {
  const allowed =
    scope === 'Organización'
      ? overview.initiatives
      : overview.initiatives.filter(
          (x) => scope === 'Delivery' || x.eco === scope,
        );
  return allowed.map((x, index) => {
    const safeReference = `DSP-${String(index + 1).padStart(3, '0')}`;
    return {
      displayName: canViewSummary ? x.summary : safeReference,
      reference: canViewSummary ? x.canonicalKey : safeReference,
      targetDate: x.targetDate,
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
      riskGateStatus: x.riskGateStatus,
      riskDomains: x.riskDomains,
      pipelineStage: x.pipelineStage,
      blocked: x.blocked,
      release: x.release,
      releaseApplicability: x.releaseApplicability,
      featuresTotal: x.featuresTotal,
      featuresCompleted: x.featuresCompleted,
      featuresBlocked: x.featuresBlocked,
    };
  });
}

export type ForecastExecutionStatus =
  'SIN_INICIAR' | 'EN_CURSO' | 'COMPLETADO' | 'SIN_EVIDENCIA';
export type ProductionReadinessStatus =
  'READY' | 'PARTIAL' | 'NOT_READY' | 'NO_EVIDENCE';
export type ForecastStatus = 'ON_TRACK' | 'WATCH' | 'AT_RISK' | 'NO_EVIDENCE';
export interface Q3ForecastDto {
  displayName: string;
  reference: string;
  eco: string | null;
  initiativeType: InitiativeKind;
  currentStage: string;
  stage: PipelineStage;
  featureProgress: {
    completed: number | null;
    applicable: number | null;
    percentage: number | null;
    status: ForecastExecutionStatus;
  };
  productionReadiness: {
    status: ProductionReadinessStatus;
    reason: string;
  };
  gateReadiness: { label: string; detail: string };
  targetDate: string | null;
  forecastStatus: ForecastStatus;
  forecastReason: string;
  nextGate: string;
  recommendedAction: string;
  confidence: Confidence;
  blocked: boolean;
}
const currentGateLabel = (stage: PipelineStage, risk: RiskGateStatus) => {
  if (stage === 'FEATURE_EXECUTION') {
    if (risk === 'IN_PROGRESS') return 'Risk Gate en paralelo';
    if (risk === 'WAITING_OFFICIAL_APPROVAL')
      return 'Aprobación oficial pendiente';
    if (risk === 'APPROVED') return 'Risk Gate aprobado';
    if (risk === 'BLOCKED') return 'Risk Gate bloqueado';
    return 'Sin evidencia de Risk Gate';
  }
  if (stage === 'RISK_GATE')
    return risk === 'NOT_STARTED'
      ? 'Risk Gate sin iniciar'
      : risk === 'BLOCKED'
        ? 'Risk Gate bloqueado'
        : 'Risk Gate en curso';
  if (stage === 'WAITING_OFFICIAL_APPROVAL')
    return 'Aprobación oficial pendiente';
  if (stage === 'RELEASE_READINESS') return 'Readiness de Release';
  if (stage === 'PRODUCTION') return 'En producción';
  return stage === 'NOT_STARTED' ? 'Sin iniciar' : 'Sin evidencia';
};
export function buildForecastDtos(
  overview: Q3Overview,
  scope: string,
  canViewSummary: boolean,
): Q3ForecastDto[] {
  const allowed =
    scope === 'Organización'
      ? overview.initiatives
      : overview.initiatives.filter(
          (x) => scope === 'Delivery' || x.eco === scope,
        );
  return allowed
    .filter((x) => x.committedQ3)
    .map((x, index) => {
      const safeReference = `DSP-${String(index + 1).padStart(3, '0')}`;
      const blocked = x.blocked;
      const featureStatus: ForecastExecutionStatus =
        x.progressStatus === 'UNAVAILABLE' || x.featureCompletionRatio === null
          ? 'SIN_EVIDENCIA'
          : x.featureCompletionRatio === 100
            ? 'COMPLETADO'
            : x.featureCompletionRatio === 0
              ? 'SIN_INICIAR'
              : 'EN_CURSO';
      const stage = pipelineStageOf(
        x.featureCompletionRatio,
        x.riskGateStatus,
        x.release,
      );
      const releaseApproved = x.release === 'RELEASE_APPROVED';
      const readiness: ProductionReadinessStatus =
        stage === 'PRODUCTION'
          ? 'READY'
          : ['RISK_GATE', 'WAITING_OFFICIAL_APPROVAL'].includes(stage) ||
              blocked
            ? 'NOT_READY'
            : stage === 'UNKNOWN'
              ? 'NO_EVIDENCE'
              : 'PARTIAL';
      const domainDetail = x.riskDomains.total
        ? `${x.riskDomains.approved}/${x.riskDomains.total} dominios aprobados`
        : 'Sin evidencia suficiente de dominios';
      const readinessReason =
        stage === 'FEATURE_EXECUTION'
          ? x.riskGateStatus === 'IN_PROGRESS'
            ? 'Desarrollo en curso · Risk Gate en paralelo.'
            : x.riskGateStatus === 'WAITING_OFFICIAL_APPROVAL'
              ? 'Desarrollo en curso · Aprobación oficial pendiente.'
              : x.riskGateStatus === 'APPROVED'
                ? 'Desarrollo en curso · Risk Gate aprobado.'
                : x.riskGateStatus === 'BLOCKED'
                  ? 'Desarrollo en curso · Risk Gate bloqueado.'
                  : 'Desarrollo en curso · Sin evidencia de Risk Gate.'
          : stage === 'RISK_GATE'
            ? `Risk Gate en curso · ${domainDetail}.`
            : stage === 'WAITING_OFFICIAL_APPROVAL'
              ? `Pendiente aprobación oficial · ${domainDetail}.`
              : stage === 'RELEASE_READINESS'
                ? releaseApproved
                  ? 'Release aprobado · pendiente evidencia de producción.'
                  : 'Risk Gate aprobado; Release aún no aprobado.'
                : stage === 'PRODUCTION'
                  ? 'Producción confirmada con evidencia positiva.'
                  : 'No existe evidencia suficiente para ubicar el siguiente gate.';
      const forecastStatus: ForecastStatus =
        blocked || ['RISK_GATE', 'WAITING_OFFICIAL_APPROVAL'].includes(stage)
          ? 'AT_RISK'
          : featureStatus === 'SIN_EVIDENCIA' ||
              !x.targetDate ||
              stage === 'UNKNOWN'
            ? 'NO_EVIDENCE'
            : stage === 'PRODUCTION'
              ? 'ON_TRACK'
              : 'WATCH';
      const nextGate =
        stage === 'FEATURE_EXECUTION'
          ? 'Completar desarrollo'
          : stage === 'RISK_GATE'
            ? 'Completar Risk Gate'
            : stage === 'WAITING_OFFICIAL_APPROVAL'
              ? 'Aprobación oficial'
              : stage === 'RELEASE_READINESS'
                ? releaseApproved
                  ? 'Evidencia de producción'
                  : 'Release'
                : stage === 'PRODUCTION'
                  ? 'Producción confirmada'
                  : 'Completar trazabilidad';
      const recommendedAction = blocked
        ? stage === 'RISK_GATE'
          ? 'Resolver bloqueo y completar Risk Gate'
          : 'Resolver bloqueo'
        : stage === 'FEATURE_EXECUTION'
          ? x.riskGateStatus === 'WAITING_OFFICIAL_APPROVAL'
            ? 'Completar Features · monitorear aprobación oficial'
            : 'Completar Features'
          : stage === 'RISK_GATE'
            ? 'Completar Risk Gate'
            : stage === 'WAITING_OFFICIAL_APPROVAL'
              ? 'Esperar aprobación oficial'
              : stage === 'RELEASE_READINESS'
                ? releaseApproved
                  ? 'Pendiente evidencia de producción'
                  : 'Preparar Release'
                : stage === 'PRODUCTION'
                  ? 'Monitorear producción'
                  : 'Completar trazabilidad';
      return {
        displayName: canViewSummary ? x.summary : safeReference,
        reference: canViewSummary ? x.canonicalKey : safeReference,
        eco: x.eco,
        initiativeType: x.initiativeType,
        currentStage: (
          {
            NOT_STARTED: 'Sin iniciar',
            FEATURE_EXECUTION: 'Ejecución',
            RISK_GATE: 'Risk Gate',
            WAITING_OFFICIAL_APPROVAL: 'Aprobación oficial',
            RELEASE_READINESS: 'Release',
            PRODUCTION: 'Producción',
            UNKNOWN: 'Sin evidencia',
          } as Record<PipelineStage, string>
        )[stage],
        stage,
        featureProgress: {
          completed:
            featureStatus === 'SIN_EVIDENCIA' ? null : x.featuresCompleted,
          applicable:
            featureStatus === 'SIN_EVIDENCIA' ? null : x.featuresTotal,
          percentage: x.featureCompletionRatio,
          status: featureStatus,
        },
        productionReadiness: { status: readiness, reason: readinessReason },
        gateReadiness: {
          label: currentGateLabel(stage, x.riskGateStatus),
          detail: readinessReason,
        },
        targetDate: x.targetDate,
        forecastStatus,
        forecastReason: readinessReason,
        nextGate,
        recommendedAction,
        confidence:
          forecastStatus === 'NO_EVIDENCE'
            ? 'LOW'
            : readiness === 'READY'
              ? 'HIGH'
              : 'MEDIUM',
        blocked,
      };
    });
}
