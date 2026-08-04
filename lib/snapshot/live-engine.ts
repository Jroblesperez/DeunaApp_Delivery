import type { JiraCloudClient } from '@/lib/jira/client';
import type {
  EvidenceField,
  NormalizedStage,
  SemanticWorkItemV2,
  TeamResolutionSource,
} from '@/lib/jira/live';
import { CUSTOM_FIELDS } from '@/lib/jira/live';

export type EnterpriseSource =
  | 'JIRA_SOFTWARE'
  | 'JSM'
  | 'JIRA_PRODUCT_DISCOVERY'
  | 'COMPASS'
  | 'ASSETS'
  | 'CONFLUENCE'
  | 'ROVO';
export interface MetadataCache {
  source: EnterpriseSource;
  version: string;
  capturedAt: string;
  projects: Record<string, unknown>[];
  issueTypes: Record<string, unknown>[];
  statuses: Record<string, unknown>[];
  statusCategories: Record<string, unknown>[];
  customFields: Record<string, unknown>[];
  boards: Record<string, unknown>[];
  sprints: Record<string, unknown>[];
  versions: Record<string, unknown>[];
  components: Record<string, unknown>[];
  users: Record<string, unknown>[];
  teams: string[];
  warnings: string[];
}
export type DeltaKind =
  | 'STATUS_CHANGED'
  | 'STORY_POINTS_CHANGED'
  | 'TEAM_CHANGED'
  | 'PERIOD_CHANGED'
  | 'ISSUE_CREATED';
export interface SnapshotDelta {
  issueKey: string;
  kind: DeltaKind;
  before: string | number | null;
  after: string | number | null;
}
export type QualityCode =
  | 'TEAM_DIRECT'
  | 'TEAM_INHERITED'
  | 'TEAM_BOARD_RESOLVED'
  | 'TEAM_PROJECT_RESOLVED'
  | 'TEAM_NOT_APPLICABLE'
  | 'TEAM_MISSING_REAL'
  | 'HIERARCHY_MISSING'
  | 'PERIOD_UNKNOWN'
  | 'STATUS_UNMAPPED'
  | 'DATE_MISSING'
  | 'RISK_DATA_MISSING'
  | 'RELEASE_DATA_MISSING';
export interface QualityFinding {
  code: QualityCode;
  population: number;
  applicablePopulation: number;
  count: number;
  rate: number;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';
  evidence: string;
}
export interface SemanticMetric<T = unknown> {
  value: T | null;
  status: 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
  population: number;
  applicablePopulation: number;
  period: 'Q3-2026' | 'SNAPSHOT';
  evidence: string[];
  coverage: number;
  warnings: string[];
  source: 'Jira Cloud Semantic Snapshot v2';
}
export interface SemanticMetrics {
  snapshotContext: Record<string, SemanticMetric>;
  dataConfidence: Record<string, SemanticMetric>;
  q3Activity: Record<string, SemanticMetric>;
  flowDistribution: Record<string, SemanticMetric>;
  unavailable: Record<string, SemanticMetric>;
}

const present = <T>(value: T): EvidenceField<T> => ({
  state: 'PRESENT',
  value,
});
const missing = <T>(): EvidenceField<T> => ({ state: 'MISSING', value: null });
const normalized = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
const ECO_TEAMS: Record<string, string> = {
  ...Object.fromEntries(
    [
      "Pay's Genius",
      'Cashbusters',
      "The Night's Watch",
      'The White Walkers',
      'VISA Pay',
    ].map((x) => [normalized(x), 'ECO Personas']),
  ),
  ...Object.fromEntries(
    [
      'Merchenarios',
      'Wizard Micro',
      'CNBS',
      'Agregador de Pagos',
      'VISA Agregador',
      'Grandes Superficies',
    ].map((x) => [normalized(x), 'ECO Merchants']),
  ),
  ...Object.fromEntries(
    [
      'Morpheus',
      'Infraestructura',
      'Continuidad-SRE',
      'DevOps',
      'Arquitectura',
      'WaaS',
      'Control de fraude',
    ].map((x) => [normalized(x), 'ECO Habilitadores']),
  ),
};
const directFields: Array<[keyof SemanticWorkItemV2, TeamResolutionSource]> = [
  ['jiraTeam', 'JIRA_TEAM'],
  ['equipoDeuna', 'EQUIPO_DEUNA'],
  ['equipoEjecutor', 'EQUIPO_EJECUTOR'],
  ['equipoHabilitador', 'EQUIPO_HABILITADOR'],
  ['tempoTeam', 'TEMPO_TEAM'],
];
const isEvidence = (value: unknown): value is EvidenceField<string> =>
  !!value && typeof value === 'object' && 'state' in value && 'value' in value;
const quarter = (date: string | null) => {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
};
const inQ3 = (date: string | null) => quarter(date) === '2026-Q3';
const firstDate = (
  item: SemanticWorkItemV2,
  keys: Array<keyof SemanticWorkItemV2>,
) =>
  keys
    .flatMap((k) => {
      const value = item[k];
      return isEvidence(value) && typeof value.value === 'string'
        ? [value.value]
        : [];
    })
    .find(Boolean) ?? null;

function directTeam(item: SemanticWorkItemV2) {
  for (const [key, source] of directFields) {
    const value = item[key];
    if (isEvidence(value) && value.state === 'PRESENT' && value.value)
      return { value: value.value, source };
  }
  return null;
}
function relationParent(item: SemanticWorkItemV2) {
  const relation = item.issueLinks.find(
    (link) =>
      /parent|padre/i.test(link.relation) && link.direction === 'INWARD',
  );
  return relation?.key ?? null;
}
function resolveHierarchy(
  item: SemanticWorkItemV2,
  byKey: Map<string, SemanticWorkItemV2>,
) {
  let parent =
    item.parentKey.value ?? item.epicKey.value ?? relationParent(item);
  if (parent && !item.parentKey.value) item.parentKey = present(parent);
  const ancestors: string[] = [];
  const seen = new Set<string>([item.sourceKey]);
  while (parent && !seen.has(parent)) {
    seen.add(parent);
    ancestors.push(parent);
    const ancestor = byKey.get(parent);
    if (!ancestor) break;
    if (ancestor.hierarchyLevel === 'FEATURE' && !item.epicKey.value)
      item.epicKey = present(ancestor.sourceKey);
    if (ancestor.hierarchyLevel === 'INITIATIVE' && !item.initiativeKey.value)
      item.initiativeKey = present(ancestor.sourceKey);
    parent =
      ancestor.parentKey.value ??
      ancestor.epicKey.value ??
      relationParent(ancestor);
  }
  item.ancestorKeys = ancestors;
  if (item.parentKey.value) {
    item.hierarchyResolutionSource = 'JIRA_PARENT';
    item.hierarchyResolutionConfidence = 'HIGH';
  } else if (item.epicKey.value) {
    item.hierarchyResolutionSource = 'EPIC_LINK';
    item.hierarchyResolutionConfidence = 'HIGH';
  } else if (ancestors.length) {
    item.hierarchyResolutionSource = 'ANCESTOR';
    item.hierarchyResolutionConfidence = 'MEDIUM';
  } else {
    item.hierarchyResolutionSource = 'UNRESOLVED';
    item.hierarchyResolutionConfidence = 'NONE';
  }
}
function resolveTeam(
  item: SemanticWorkItemV2,
  byKey: Map<string, SemanticWorkItemV2>,
) {
  item.teamApplicability =
    item.hierarchyLevel === 'TEST_ITEM'
      ? 'NOT_APPLICABLE'
      : item.hierarchyLevel === 'CONTROL_ITEM'
        ? 'OPTIONAL'
        : 'REQUIRED';
  const direct = directTeam(item);
  if (direct) {
    item.resolvedTeam = present(direct.value);
    item.teamResolutionSource = direct.source;
    item.teamResolutionConfidence = 'HIGH';
    return;
  }
  for (const [index, key] of item.ancestorKeys.entries()) {
    const ancestor = byKey.get(key);
    if (!ancestor) continue;
    const inherited = directTeam(ancestor);
    if (inherited) {
      item.resolvedTeam = present(inherited.value);
      item.teamResolutionSource = index === 0 ? 'PARENT' : 'ANCESTOR';
      item.teamResolutionConfidence = index === 0 ? 'HIGH' : 'MEDIUM';
      return;
    }
  }
  if (item.teamApplicability === 'NOT_APPLICABLE') {
    item.resolvedTeam = { state: 'NOT_APPLICABLE', value: null };
    item.teamResolutionSource = 'NOT_APPLICABLE';
    item.teamResolutionConfidence = 'NONE';
  } else {
    item.resolvedTeam = missing();
    item.teamResolutionSource = 'MISSING';
    item.teamResolutionConfidence = 'NONE';
  }
}
function resolveEco(
  item: SemanticWorkItemV2,
  byKey: Map<string, SemanticWorkItemV2>,
) {
  if (item.resolvedEco.state === 'PRESENT' && item.resolvedEco.value) return;
  const team = item.resolvedTeam.value;
  if (team && ECO_TEAMS[normalized(team)]) {
    item.resolvedEco = present(ECO_TEAMS[normalized(team)]);
    item.ecoResolutionSource = 'TEAM_MAP';
    item.ecoResolutionConfidence = 'HIGH';
    return;
  }
  for (const key of item.ancestorKeys) {
    const eco = byKey.get(key)?.resolvedEco;
    if (eco?.value) {
      item.resolvedEco = present(eco.value);
      item.ecoResolutionSource = 'ANCESTOR';
      item.ecoResolutionConfidence = 'MEDIUM';
      return;
    }
  }
  item.resolvedEco = { state: 'NOT_MAPPED', value: null };
  item.ecoResolutionSource = 'UNKNOWN';
  item.ecoResolutionConfidence = 'NONE';
}
function classifyPeriod(item: SemanticWorkItemV2, metadata: MetadataCache) {
  const completion = firstDate(item, [
    'completionDate',
    'resolutionDate',
    'closeDate',
  ]);
  if (completion) {
    item.periodEvidence.push(`completion:${quarter(completion)}`);
    item.periodClassification = inQ3(completion)
      ? 'COMPLETED_IN_Q3'
      : 'OUTSIDE_Q3';
    item.periodConfidence = 'HIGH';
    return;
  }
  const sprintSet = new Set(item.sprintIds);
  const q3Sprint = metadata.sprints.find(
    (s) =>
      sprintSet.has(String(s.id)) &&
      [s.startDate, s.endDate].some((x) => typeof x === 'string' && inQ3(x)),
  );
  if (q3Sprint) {
    item.periodEvidence.push('sprint:intersects-Q3');
    item.periodClassification = 'IN_Q3_COMMITMENT';
    item.periodConfidence = 'HIGH';
    return;
  }
  const planned = firstDate(item, ['startDate', 'dueDate']);
  if (planned) {
    item.periodEvidence.push(`planned-date:${quarter(planned)}`);
    item.periodClassification = inQ3(planned)
      ? 'IN_Q3_COMMITMENT'
      : 'OUTSIDE_Q3';
    item.periodConfidence = 'MEDIUM';
    return;
  }
  const versionSet = new Set(item.fixVersionIds);
  const q3Version = metadata.versions.find(
    (v) =>
      versionSet.has(String(v.id)) &&
      [v.startDate, v.releaseDate].some(
        (x) => typeof x === 'string' && inQ3(x),
      ),
  );
  if (q3Version) {
    item.periodEvidence.push('release-window:Q3');
    item.periodClassification = 'IN_Q3_COMMITMENT';
    item.periodConfidence = 'MEDIUM';
    return;
  }
  const stage = firstDate(item, [
    'devEntryDate',
    'readyQaEntryDate',
    'qaEntryDate',
    'deploymentEntryDate',
  ]);
  if (stage && inQ3(stage)) {
    item.periodEvidence.push('delivery-stage-date:Q3');
    item.periodClassification = 'ACTIVE_IN_Q3';
    item.periodConfidence = 'HIGH';
    return;
  }
  if (item.updatedAt.value && inQ3(item.updatedAt.value)) {
    item.periodEvidence.push('updatedAt:Q3-activity-only');
    item.periodClassification = 'ACTIVE_IN_Q3';
    item.periodConfidence = 'LOW';
    return;
  }
  item.periodClassification = 'UNKNOWN_PERIOD';
  item.periodConfidence = 'NONE';
}
export function resolveSemanticItems(
  input: SemanticWorkItemV2[],
  metadata: MetadataCache,
) {
  const items = structuredClone(input);
  const byKey = new Map(items.map((x) => [x.sourceKey, x]));
  for (const item of items) resolveHierarchy(item, byKey);
  for (const item of items) resolveTeam(item, byKey);
  for (const item of items) resolveEco(item, byKey);
  for (const item of items) classifyPeriod(item, metadata);
  return items;
}
export function mergeIncremental(
  previous: SemanticWorkItemV2[],
  changed: SemanticWorkItemV2[],
) {
  return [
    ...new Map(
      [...previous, ...changed].map((item) => [item.sourceKey, item]),
    ).values(),
  ];
}
const scalar = (value: unknown) =>
  isEvidence(value)
    ? value.value == null
      ? null
      : String(value.value)
    : value == null
      ? null
      : String(value);
export function calculateDeltas(
  previous: SemanticWorkItemV2[],
  current: SemanticWorkItemV2[],
): SnapshotDelta[] {
  const old = new Map(previous.map((x) => [x.sourceKey, x]));
  const out: SnapshotDelta[] = [];
  for (const item of current) {
    const before = old.get(item.sourceKey);
    if (!before) {
      out.push({
        issueKey: item.sourceKey,
        kind: 'ISSUE_CREATED',
        before: null,
        after: item.sourceStatus,
      });
      continue;
    }
    for (const [key, kind] of [
      ['sourceStatus', 'STATUS_CHANGED'],
      ['storyPoints', 'STORY_POINTS_CHANGED'],
      ['resolvedTeam', 'TEAM_CHANGED'],
      ['periodClassification', 'PERIOD_CHANGED'],
    ] as const)
      if (scalar(before[key]) !== scalar(item[key]))
        out.push({
          issueKey: item.sourceKey,
          kind,
          before: scalar(before[key]),
          after: scalar(item[key]),
        });
  }
  return out;
}
const rate = (count: number, population: number) =>
  population ? Math.round((count / population) * 10000) / 100 : 0;
export function calculateDataQuality(
  items: SemanticWorkItemV2[],
): QualityFinding[] {
  const applicable = items.filter(
    (x) => x.teamApplicability !== 'NOT_APPLICABLE',
  );
  const hierarchyApplicable = items.filter((x) =>
    ['DELIVERY_ITEM', 'SUBTASK'].includes(x.hierarchyLevel),
  );
  const spec: Array<
    [
      QualityCode,
      (x: SemanticWorkItemV2) => boolean,
      number,
      'INFO' | 'LOW' | 'MEDIUM' | 'HIGH',
      string,
    ]
  > = [
    [
      'TEAM_DIRECT',
      (x) =>
        [
          'JIRA_TEAM',
          'EQUIPO_DEUNA',
          'EQUIPO_EJECUTOR',
          'EQUIPO_HABILITADOR',
          'TEMPO_TEAM',
        ].includes(x.teamResolutionSource),
      items.length,
      'INFO',
      'Equipo presente en el issue.',
    ],
    [
      'TEAM_INHERITED',
      (x) => ['PARENT', 'ANCESTOR'].includes(x.teamResolutionSource),
      applicable.length,
      'INFO',
      'Equipo heredado mediante jerarquía.',
    ],
    [
      'TEAM_BOARD_RESOLVED',
      (x) => x.teamResolutionSource === 'BOARD',
      applicable.length,
      'INFO',
      'Equipo resuelto por mapa aprobado de board.',
    ],
    [
      'TEAM_PROJECT_RESOLVED',
      (x) => x.teamResolutionSource === 'PROJECT',
      applicable.length,
      'LOW',
      'Equipo resuelto por mapa aprobado de proyecto.',
    ],
    [
      'TEAM_NOT_APPLICABLE',
      (x) => x.teamResolutionSource === 'NOT_APPLICABLE',
      items.length,
      'INFO',
      'Tipo de issue fuera de la población aplicable.',
    ],
    [
      'TEAM_MISSING_REAL',
      (x) => x.teamResolutionSource === 'MISSING',
      applicable.length,
      'HIGH',
      'Sin evidencia tras precedencia completa.',
    ],
    [
      'HIERARCHY_MISSING',
      (x) =>
        ['DELIVERY_ITEM', 'SUBTASK'].includes(x.hierarchyLevel) &&
        x.hierarchyResolutionSource === 'UNRESOLVED',
      hierarchyApplicable.length,
      'HIGH',
      'Item de delivery sin relación jerárquica detectable.',
    ],
    [
      'PERIOD_UNKNOWN',
      (x) => x.periodClassification === 'UNKNOWN_PERIOD',
      items.length,
      'MEDIUM',
      'Sin evidencia temporal suficiente.',
    ],
    [
      'STATUS_UNMAPPED',
      (x) => x.normalizedStage === 'UNMAPPED',
      items.length,
      'HIGH',
      'Estado fuente no decidido.',
    ],
    [
      'DATE_MISSING',
      (x) => !x.createdAt.value || !x.updatedAt.value,
      items.length,
      'MEDIUM',
      'Fechas base incompletas.',
    ],
    [
      'RISK_DATA_MISSING',
      (x) => x.riskLevel.state !== 'PRESENT',
      items.length,
      'LOW',
      'Sin dato de riesgo explícito.',
    ],
    [
      'RELEASE_DATA_MISSING',
      (x) => !x.fixVersionIds.length,
      items.length,
      'MEDIUM',
      'Sin fix version o release.',
    ],
  ];
  return spec.map(([code, test, population, severity, evidence]) => {
    const count = items.filter(test).length;
    return {
      code,
      population: items.length,
      applicablePopulation: population,
      count,
      rate: rate(count, population),
      severity,
      evidence,
    };
  });
}
const metric = <T>(
  value: T | null,
  status: SemanticMetric['status'],
  population: number,
  applicablePopulation: number,
  period: SemanticMetric['period'],
  evidence: string[],
  coverage: number,
  warnings: string[] = [],
): SemanticMetric<T> => ({
  value,
  status,
  population,
  applicablePopulation,
  period,
  evidence,
  coverage,
  warnings,
  source: 'Jira Cloud Semantic Snapshot v2',
});
export function buildSemanticMetrics(
  items: SemanticWorkItemV2[],
  context: {
    projectsAccessible: number;
    truncated: boolean;
    snapshotVersion: number;
    syncMode: 'FULL' | 'INCREMENTAL';
  },
): SemanticMetrics {
  const total = items.length;
  const teamApplicable = items.filter(
    (x) => x.teamApplicability !== 'NOT_APPLICABLE',
  );
  const hierarchyApplicable = items.filter((x) =>
    ['DELIVERY_ITEM', 'SUBTASK'].includes(x.hierarchyLevel),
  );
  const coverage = (
    population: SemanticWorkItemV2[],
    test: (x: SemanticWorkItemV2) => boolean,
  ) =>
    population.length
      ? Math.round((population.filter(test).length / population.length) * 10000) /
        100
      : 0;
  const delivery = items.filter(
    (x) => !['TEST_ITEM', 'CONTROL_ITEM', 'SUBTASK'].includes(x.hierarchyLevel),
  );
  const knownPeriod = items.filter(
    (x) => x.periodClassification !== 'UNKNOWN_PERIOD',
  ).length;
  const mapped = items.filter((x) => x.normalizedStage !== 'UNMAPPED').length;
  const flow = Object.fromEntries(
    (
      [
        'PORTFOLIO',
        'PLANNING',
        'DEVELOPMENT',
        'READY_FOR_QA',
        'QA',
        'RISK_APPROVAL',
        'DEPLOYMENT',
        'INTERNAL_TESTING',
        'MASSIFICATION',
        'PRODUCTION',
        'BLOCKED',
        'DONE',
        'CANCELLED',
      ] as NormalizedStage[]
    ).map((stage) => [
      stage,
      metric(
        delivery.filter((x) => x.normalizedStage === stage).length,
        mapped === total ? 'AVAILABLE' : 'PARTIAL',
        total,
        delivery.length,
        'SNAPSHOT',
        [
          `Distribución sobre ${delivery.length} unidades clasificables; excluye control, test y subtareas.`,
        ],
        coverage(items, (x) => x.normalizedStage !== 'UNMAPPED'),
      ),
    ]),
  );
  const unavailable = (evidence: string) =>
    metric(null, 'UNAVAILABLE', total, 0, 'Q3-2026', [evidence], 0);
  return {
    snapshotContext: {
      projectsAccessible: metric(
        context.projectsAccessible,
        'AVAILABLE',
        total,
        total,
        'SNAPSHOT',
        ['Proyectos accesibles durante la captura.'],
        100,
      ),
      issuesProcessed: metric(
        total,
        'AVAILABLE',
        total,
        total,
        'SNAPSHOT',
        ['Items v2 persistidos.'],
        100,
      ),
      truncated: metric(
        context.truncated,
        'AVAILABLE',
        total,
        total,
        'SNAPSHOT',
        ['Límite configurado de sincronización.'],
        100,
      ),
      snapshotVersion: metric(
        context.snapshotVersion,
        'AVAILABLE',
        total,
        total,
        'SNAPSHOT',
        ['Versión persistida.'],
        100,
      ),
      syncMode: metric(
        context.syncMode,
        'AVAILABLE',
        total,
        total,
        'SNAPSHOT',
        ['Modo de captura semántica.'],
        100,
      ),
    },
    dataConfidence: {
      hierarchyCoverage: metric(
        coverage(
          hierarchyApplicable,
          (x) => x.hierarchyResolutionSource !== 'UNRESOLVED',
        ),
        'AVAILABLE',
        total,
        hierarchyApplicable.length,
        'SNAPSHOT',
        ['Jerarquía resoluble con campos disponibles.'],
        coverage(
          hierarchyApplicable,
          (x) => x.hierarchyResolutionSource !== 'UNRESOLVED',
        ),
      ),
      teamResolutionCoverage: metric(
        coverage(
          teamApplicable,
          (x) =>
            x.teamResolutionSource !== 'MISSING' &&
            x.teamResolutionSource !== 'NOT_APPLICABLE',
        ),
        'AVAILABLE',
        total,
        teamApplicable.length,
        'SNAPSHOT',
        ['Resolución directa o heredada sobre población aplicable.'],
        coverage(
          teamApplicable,
          (x) =>
            x.teamResolutionSource !== 'MISSING' &&
            x.teamResolutionSource !== 'NOT_APPLICABLE',
        ),
      ),
      periodCoverage: metric(
        rate(knownPeriod, total),
        'PARTIAL',
        total,
        total,
        'Q3-2026',
        [
          'Clasificación basada en evidencia temporal; updatedAt solo indica actividad.',
        ],
        rate(knownPeriod, total),
      ),
      stateMappingCoverage: metric(
        rate(mapped, total),
        mapped === total ? 'AVAILABLE' : 'PARTIAL',
        total,
        total,
        'SNAPSHOT',
        ['Estados observados con mapping explícito.'],
        rate(mapped, total),
      ),
      releaseCoverage: metric(
        coverage(items, (x) => x.fixVersionIds.length > 0),
        'PARTIAL',
        total,
        total,
        'SNAPSHOT',
        ['Items con fix version.'],
        coverage(items, (x) => x.fixVersionIds.length > 0),
      ),
      riskCoverage: metric(
        coverage(items, (x) => x.riskLevel.state === 'PRESENT'),
        'PARTIAL',
        total,
        total,
        'SNAPSHOT',
        ['Items con riesgo explícito.'],
        coverage(items, (x) => x.riskLevel.state === 'PRESENT'),
      ),
    },
    q3Activity: {
      activeInQ3: metric(
        items.filter((x) => x.periodClassification === 'ACTIVE_IN_Q3').length,
        'PARTIAL',
        total,
        total,
        'Q3-2026',
        ['Actividad con evidencia; no equivale a compromiso.'],
        rate(knownPeriod, total),
      ),
      completedInQ3: metric(
        items.filter((x) => x.periodClassification === 'COMPLETED_IN_Q3')
          .length,
        'PARTIAL',
        total,
        total,
        'Q3-2026',
        ['Finalización o resolución en Q3.'],
        rate(knownPeriod, total),
      ),
      committedInQ3: metric(
        items.filter((x) => x.periodClassification === 'IN_Q3_COMMITMENT')
          .length,
        'PARTIAL',
        total,
        total,
        'Q3-2026',
        ['Sprint, fecha planificada o release en Q3.'],
        rate(knownPeriod, total),
      ),
      unknownPeriod: metric(
        total - knownPeriod,
        'AVAILABLE',
        total,
        total,
        'Q3-2026',
        ['Items sin evidencia temporal suficiente.'],
        100,
      ),
    },
    flowDistribution: flow,
    unavailable: {
      committedInitiativesQ3: unavailable(
        'No existe población completa de iniciativas con compromiso verificable.',
      ),
      initiativesAtRisk: unavailable(
        'Riesgo no está cubierto para la población de iniciativas.',
      ),
      cycleTime: unavailable('Requiere changelog completo de transiciones.'),
      deploymentFrequency: unavailable(
        'Requiere eventos históricos de despliegue.',
      ),
      capacityMix: unavailable(
        'No existe clasificación completa de capacidad.',
      ),
      riskApproval: unavailable(
        'No existe evidencia consolidada de workflow y población.',
      ),
      overdueActionPlans: unavailable(
        'No existe población completa con vencimiento verificable.',
      ),
    },
  };
}

async function optional<T>(
  operation: () => Promise<{ data: T }>,
  label: string,
  warnings: string[],
  fallback: T,
) {
  try {
    return (await operation()).data;
  } catch {
    warnings.push(`${label}: INACCESSIBLE`);
    return fallback;
  }
}
export async function buildMetadataCache(
  client: JiraCloudClient,
  projects: string[],
): Promise<MetadataCache> {
  const warnings: string[] = [];
  const [projectPage, issueTypes, statuses, fields, users] = await Promise.all([
    client.getProjects(),
    optional(() => client.getIssueTypes(), 'Issue Types', warnings, []),
    optional(() => client.getStatuses(), 'Statuses', warnings, []),
    optional(() => client.getFields(), 'Custom Fields', warnings, []),
    optional(() => client.getUsers(), 'Users', warnings, []),
  ]);
  const selected = projectPage.items.filter((p) =>
    projects.includes(String(p.key)),
  );
  const boards: Record<string, unknown>[] = [],
    sprints: Record<string, unknown>[] = [],
    versions: Record<string, unknown>[] = [],
    components: Record<string, unknown>[] = [];
  for (const project of selected) {
    const key = String(project.key);
    const projectBoards = await optional(
      () => client.getBoards(key),
      `Boards ${key}`,
      warnings,
      { values: [] },
    );
    boards.push(...projectBoards.values);
    versions.push(
      ...(await optional(
        () => client.getVersions(key),
        `Versions ${key}`,
        warnings,
        [],
      )),
    );
    components.push(
      ...(await optional(
        () => client.getComponents(key),
        `Components ${key}`,
        warnings,
        [],
      )),
    );
  }
  for (const board of boards)
    sprints.push(
      ...(
        await optional(
          () => client.getSprints(String(board.id)),
          `Sprints board ${String(board.id)}`,
          warnings,
          { values: [] },
        )
      ).values,
    );
  const statusCategories = [
    ...new Map(
      statuses.map((status) => {
        const category = (status.statusCategory ?? {}) as Record<
          string,
          unknown
        >;
        return [String(category.id ?? category.key ?? 'unknown'), category];
      }),
    ).values(),
  ];
  const customFields = fields.filter((field) =>
    CUSTOM_FIELDS.includes(String(field.id) as (typeof CUSTOM_FIELDS)[number]),
  );
  const teams = [
    ...new Set(
      customFields
        .filter((field) => /team|equipo/i.test(String(field.name)))
        .map((field) => String(field.name)),
    ),
  ];
  return {
    source: 'JIRA_SOFTWARE',
    version: crypto.randomUUID(),
    capturedAt: new Date().toISOString(),
    projects: selected,
    issueTypes,
    statuses,
    statusCategories,
    customFields,
    boards,
    sprints,
    versions,
    components,
    users,
    teams,
    warnings,
  };
}
