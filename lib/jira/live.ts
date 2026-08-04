import type { JiraCloudClient } from './client';

export const CUSTOM_FIELDS = [
  'customfield_10064',
  'customfield_10020',
  'customfield_10001',
  'customfield_11377',
  'customfield_11845',
  'customfield_11844',
  'customfield_10603',
  'customfield_11126',
  'customfield_10014',
  'customfield_10021',
  'customfield_10015',
  'customfield_11977',
  'customfield_11978',
  'customfield_12011',
  'customfield_12012',
  'customfield_11347',
  'customfield_11944',
  'customfield_11374',
  'customfield_10526',
  'customfield_10159',
  'customfield_10118',
  'customfield_12920',
  'customfield_12859',
  'customfield_12162',
  'customfield_12634',
  'customfield_11372',
  'customfield_13104',
  'customfield_11177',
  'customfield_12981',
  'customfield_10522',
  'customfield_11252',
] as const;
export const ISSUE_FIELDS = [
  'summary',
  'project',
  'issuetype',
  'status',
  'priority',
  'assignee',
  'reporter',
  'created',
  'updated',
  'resolutiondate',
  'duedate',
  'labels',
  'components',
  'parent',
  'issuelinks',
  'fixVersions',
  ...CUSTOM_FIELDS,
];
export type FieldState =
  'PRESENT' | 'MISSING' | 'NOT_APPLICABLE' | 'INACCESSIBLE' | 'NOT_MAPPED';
export interface EvidenceField<T> {
  state: FieldState;
  value: T | null;
}
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type HierarchyLevel =
  | 'IDEA'
  | 'INITIATIVE'
  | 'FEATURE'
  | 'DELIVERY_ITEM'
  | 'SUBTASK'
  | 'CONTROL_ITEM'
  | 'TEST_ITEM'
  | 'UNKNOWN';
export type NormalizedStage =
  | 'PORTFOLIO'
  | 'PLANNING'
  | 'DEVELOPMENT'
  | 'READY_FOR_QA'
  | 'QA'
  | 'RISK_APPROVAL'
  | 'DEPLOYMENT'
  | 'INTERNAL_TESTING'
  | 'MASSIFICATION'
  | 'PRODUCTION'
  | 'BLOCKED'
  | 'DONE'
  | 'CANCELLED'
  | 'NOT_APPLICABLE'
  | 'UNMAPPED';
export type TeamResolutionSource =
  | 'JIRA_TEAM'
  | 'EQUIPO_DEUNA'
  | 'EQUIPO_EJECUTOR'
  | 'EQUIPO_HABILITADOR'
  | 'TEMPO_TEAM'
  | 'PARENT'
  | 'ANCESTOR'
  | 'BOARD'
  | 'PROJECT'
  | 'NOT_APPLICABLE'
  | 'MISSING';
export type PeriodClassification =
  | 'COMPLETED_IN_Q3'
  | 'IN_Q3_COMMITMENT'
  | 'ACTIVE_IN_Q3'
  | 'OUTSIDE_Q3'
  | 'UNKNOWN_PERIOD';
export interface IssueLinkEvidence {
  linkTypeId: string | null;
  relation: string;
  direction: 'INWARD' | 'OUTWARD';
  key: string;
  issueTypeName: string | null;
}
export interface SemanticWorkItemV2 {
  schemaVersion: 2;
  sourceKey: string;
  sourceProject: string;
  issueTypeId: EvidenceField<string>;
  issueTypeName: string;
  hierarchyLevel: HierarchyLevel;
  summary: string;
  sourceStatus: string;
  sourceStatusCategory: EvidenceField<string>;
  normalizedStage: NormalizedStage;
  normalizedStageConfidence: Confidence;
  stageMappingSource: 'OBSERVED_STATUS' | 'ISSUE_TYPE_WORKFLOW' | 'UNMAPPED';
  parentKey: EvidenceField<string>;
  parentIssueTypeId: EvidenceField<string>;
  parentIssueTypeName: EvidenceField<string>;
  epicKey: EvidenceField<string>;
  initiativeKey: EvidenceField<string>;
  ancestorKeys: string[];
  hierarchyResolutionSource:
    | 'JIRA_PARENT'
    | 'EPIC_LINK'
    | 'ISSUE_LINK'
    | 'INITIATIVE_LINK'
    | 'ANCESTOR'
    | 'UNRESOLVED';
  hierarchyResolutionConfidence: Confidence;
  jiraTeam: EvidenceField<string>;
  equipoDeuna: EvidenceField<string>;
  equipoEjecutor: EvidenceField<string>;
  equipoSolicitante: EvidenceField<string>;
  equipoHabilitador: EvidenceField<string>;
  tempoTeam: EvidenceField<string>;
  resolvedTeam: EvidenceField<string>;
  teamResolutionSource: TeamResolutionSource;
  teamResolutionConfidence: Confidence;
  teamApplicability: 'REQUIRED' | 'OPTIONAL' | 'NOT_APPLICABLE';
  resolvedEco: EvidenceField<string>;
  ecoResolutionSource:
    | 'PORTFOLIO_FIELD'
    | 'TEAM_MAP'
    | 'BOARD_MAP'
    | 'PROJECT_MAP'
    | 'ANCESTOR'
    | 'UNKNOWN';
  ecoResolutionConfidence: Confidence;
  sprintIds: string[];
  sprintNames: string[];
  boardIds: string[];
  fixVersionIds: string[];
  fixVersionNames: string[];
  releaseVersion: EvidenceField<string>;
  periodEvidence: string[];
  createdAt: EvidenceField<string>;
  updatedAt: EvidenceField<string>;
  resolutionDate: EvidenceField<string>;
  dueDate: EvidenceField<string>;
  startDate: EvidenceField<string>;
  devEntryDate: EvidenceField<string>;
  readyQaEntryDate: EvidenceField<string>;
  qaEntryDate: EvidenceField<string>;
  deploymentEntryDate: EvidenceField<string>;
  completionDate: EvidenceField<string>;
  closeDate: EvidenceField<string>;
  storyPoints: EvidenceField<number>;
  flagged: EvidenceField<boolean>;
  blockedReason: EvidenceField<string>;
  riskLevel: EvidenceField<string>;
  severity: EvidenceField<string>;
  progress: EvidenceField<number>;
  okr: EvidenceField<string>;
  organizationalOkr: EvidenceField<string>;
  quarters: string[];
  okrReferences: string[];
  issueLinks: IssueLinkEvidence[];
  periodClassification: PeriodClassification;
  periodConfidence: Confidence;
  owner: EvidenceField<string>;
  priority: EvidenceField<string>;
  sourceUrl: string;
  datasetRole?: 'PORTFOLIO' | 'PORTFOLIO_CONTROL' | 'OPERATIONAL' | 'RELATIONSHIP';
  portfolioMembership?: 'DECLARED_Q3' | 'CONTROL_ONLY';
}
export type FlowOsWorkItem = SemanticWorkItemV2;
const missing = <T>(): EvidenceField<T> => ({ state: 'MISSING', value: null });
const field = <T>(value: T | null | undefined): EvidenceField<T> =>
  value === null || value === undefined || value === ''
    ? missing<T>()
    : { state: 'PRESENT', value };
const plain = (value: unknown): string =>
  typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'name' in value
      ? String((value as { name: unknown }).name)
      : value && typeof value === 'object' && 'value' in value
        ? String((value as { value: unknown }).value)
        : '';
const id = (value: unknown): string =>
  value && typeof value === 'object' && 'id' in value
    ? String((value as { id: unknown }).id)
    : '';
const dateField = (value: unknown) =>
  field(
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)
      ? value
      : null,
  );
const intervalEnd = (value: unknown) => {
  if (typeof value === 'string') {
    if (!value.trim().startsWith('{')) return value;
    try {
      return intervalEnd(JSON.parse(value));
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object') return null;
  const interval = value as Record<string, unknown>;
  for (const key of ['endDate', 'end', 'to', 'finishDate'])
    if (typeof interval[key] === 'string') return interval[key] as string;
  return null;
};
const names = (value: unknown) =>
  Array.isArray(value)
    ? value.map(plain).filter(Boolean)
    : plain(value)
      ? [plain(value)]
      : [];
const ids = (value: unknown) =>
  Array.isArray(value)
    ? value.map(id).filter(Boolean)
    : id(value)
      ? [id(value)]
      : [];

export function classifyHierarchyLevel(name: string): HierarchyLevel {
  const value = name.trim().toLocaleLowerCase('es');
  if (['idea', 'solicitud de iniciativa'].includes(value)) return 'IDEA';
  if (
    ['iniciativa', 'iniciativa estratégica', 'iniciativa estrategica'].includes(
      value,
    )
  )
    return 'INITIATIVE';
  if (['feature', 'epic'].includes(value)) return 'FEATURE';
  if (
    [
      'historia',
      'historia habilitadora',
      'mejora',
      'deuda técnica',
      'deuda tecnica',
      'bau',
      'bug',
      'spike',
      'tarea',
      'bug dev',
      'bug de desarrollo',
      'ux/ui',
    ].includes(value)
  )
    return 'DELIVERY_ITEM';
  if (['subtarea', 'subtarea riesgos'].includes(value)) return 'SUBTASK';
  if (
    [
      'matriz de riesgos',
      'matriz riesgos',
      'plan de acción',
      'plan de accion',
      'plan release',
      'dependencia',
    ].includes(value)
  )
    return 'CONTROL_ITEM';
  if (['test', 'test set', 'test plan', 'test execution'].includes(value))
    return 'TEST_ITEM';
  return 'UNKNOWN';
}
const STAGES: Record<
  Exclude<NormalizedStage, 'NOT_APPLICABLE' | 'UNMAPPED'>,
  string[]
> = {
  PORTFOLIO: [
    'priorizado',
    'aprobada para backlog estratégico',
    'nueva iniciativa',
  ],
  PLANNING: [
    'tareas por hacer',
    'to do',
    'backlog',
    'selected for development',
    'kickoff',
    'planificación',
  ],
  DEVELOPMENT: ['desarrollo', 'en desarrollo', 'in progress', 'en progreso'],
  READY_FOR_QA: ['listo para qa'],
  QA: ['pruebas', 'validación'],
  RISK_APPROVAL: [
    'matriz de riesgo',
    'definición controles',
    'gestión controles',
    'aprobación por oficial',
  ],
  DEPLOYMENT: ['despliegue'],
  INTERNAL_TESTING: ['internal testing', 'smoke test', 'aprobación smoke test'],
  MASSIFICATION: [
    'masificacion',
    'masificación 50%',
    'masificación 99%',
    'masificación 100%',
  ],
  PRODUCTION: ['producción', 'published'],
  BLOCKED: ['bloqueado'],
  DONE: ['finalizado', 'finalizada', 'done', 'completed', 'closed', 'resolved'],
  CANCELLED: [
    'cancelado',
    'canceled',
    'descartada',
    'no-go',
    'declined',
    'rechazada',
  ],
};
export function normalizeJiraStatus(status: string): NormalizedStage {
  const value = status.trim().toLocaleLowerCase('es');
  for (const [stage, values] of Object.entries(STAGES))
    if (values.includes(value)) return stage as NormalizedStage;
  return 'UNMAPPED';
}
function links(value: unknown): IssueLinkEvidence[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const link = raw as Record<string, unknown>;
    const type = (link.type ?? {}) as Record<string, unknown>;
    for (const [side, direction] of [
      ['inwardIssue', 'INWARD'],
      ['outwardIssue', 'OUTWARD'],
    ] as const) {
      const target = link[side] as Record<string, unknown> | undefined;
      if (target?.key) {
        const targetFields = (target.fields ?? {}) as Record<string, unknown>;
        return [
          {
            linkTypeId: type.id ? String(type.id) : null,
            relation: String(
              direction === 'INWARD'
                ? (type.inward ?? type.name ?? '')
                : (type.outward ?? type.name ?? ''),
            ),
            direction,
            key: String(target.key),
            issueTypeName: plain(targetFields.issuetype) || null,
          },
        ];
      }
    }
    return [];
  });
}
export function normalizeIssue(
  issue: Record<string, unknown>,
  siteUrl: string,
): SemanticWorkItemV2 {
  const f = (issue.fields ?? {}) as Record<string, unknown>;
  const issueType = f.issuetype as Record<string, unknown> | undefined;
  const status = f.status as Record<string, unknown> | undefined;
  const category = status?.statusCategory as
    Record<string, unknown> | undefined;
  const parent = f.parent as
    | { key?: string; fields?: { issuetype?: { id?: string; name?: string } } }
    | undefined;
  const sprint = f.customfield_10020;
  const versions = f.fixVersions;
  const labels = Array.isArray(f.labels) ? f.labels.map(String) : [];
  const sourceStatus = plain(status);
  const normalizedStage = normalizeJiraStatus(sourceStatus);
  const points = [f.customfield_10064, f.customfield_10021].find(
    (x) => typeof x === 'number',
  ) as number | undefined;
  const issueLinks = links(f.issuelinks);
  const epicLink =
    typeof f.customfield_10014 === 'string' ? f.customfield_10014 : null;
  return {
    schemaVersion: 2,
    sourceKey: String(issue.key ?? ''),
    sourceProject:
      f.project && typeof f.project === 'object' && 'key' in f.project
        ? String((f.project as { key: unknown }).key)
        : plain(f.project),
    issueTypeId: field(issueType?.id ? String(issueType.id) : null),
    issueTypeName: plain(issueType),
    hierarchyLevel: classifyHierarchyLevel(plain(issueType)),
    summary: String(f.summary ?? ''),
    sourceStatus,
    sourceStatusCategory: field(
      category?.name
        ? String(category.name)
        : category?.key
          ? String(category.key)
          : null,
    ),
    normalizedStage,
    normalizedStageConfidence: normalizedStage === 'UNMAPPED' ? 'NONE' : 'HIGH',
    stageMappingSource:
      normalizedStage === 'UNMAPPED' ? 'UNMAPPED' : 'OBSERVED_STATUS',
    parentKey: field(parent?.key ?? null),
    parentIssueTypeId: field(parent?.fields?.issuetype?.id ?? null),
    parentIssueTypeName: field(parent?.fields?.issuetype?.name ?? null),
    epicKey: field(epicLink),
    initiativeKey: missing(),
    ancestorKeys: [],
    hierarchyResolutionSource: parent?.key
      ? 'JIRA_PARENT'
      : epicLink
        ? 'EPIC_LINK'
        : 'UNRESOLVED',
    hierarchyResolutionConfidence: parent?.key || epicLink ? 'HIGH' : 'NONE',
    jiraTeam: field(plain(f.customfield_10001) || null),
    equipoDeuna: field(plain(f.customfield_11377) || null),
    equipoEjecutor: field(plain(f.customfield_11845) || null),
    equipoSolicitante: field(plain(f.customfield_11844) || null),
    equipoHabilitador: field(plain(f.customfield_10603) || null),
    tempoTeam: field(plain(f.customfield_11126) || null),
    resolvedTeam: missing(),
    teamResolutionSource: 'MISSING',
    teamResolutionConfidence: 'NONE',
    teamApplicability: 'REQUIRED',
    resolvedEco: field(plain(f.customfield_11372) || null),
    ecoResolutionSource: plain(f.customfield_11372)
      ? 'PORTFOLIO_FIELD'
      : 'UNKNOWN',
    ecoResolutionConfidence: plain(f.customfield_11372) ? 'HIGH' : 'NONE',
    sprintIds: ids(sprint),
    sprintNames: names(sprint),
    boardIds: Array.isArray(sprint)
      ? sprint
          .map((x) =>
            x && typeof x === 'object' && 'originBoardId' in x
              ? String((x as { originBoardId: unknown }).originBoardId)
              : '',
          )
          .filter(Boolean)
      : [],
    fixVersionIds: ids(versions),
    fixVersionNames: names(versions),
    releaseVersion: field(names(versions).at(-1) ?? null),
    periodEvidence: [],
    createdAt: dateField(f.created),
    updatedAt: dateField(f.updated),
    resolutionDate: dateField(f.resolutiondate),
    dueDate: dateField(f.duedate),
    startDate: dateField(f.customfield_10015),
    devEntryDate: dateField(f.customfield_11977),
    readyQaEntryDate: dateField(f.customfield_12011),
    qaEntryDate: dateField(f.customfield_12012),
    deploymentEntryDate: dateField(f.customfield_11347),
    completionDate: dateField(intervalEnd(f.customfield_11944)),
    closeDate: dateField(f.customfield_11374),
    storyPoints: field(points ?? null),
    flagged: field(
      labels.some(
        (x) => x.toLowerCase() === 'flagged' || x.toLowerCase() === 'blocked',
      ) || normalizedStage === 'BLOCKED',
    ),
    blockedReason: field(plain(f.customfield_10526) || null),
    riskLevel: field(plain(f.customfield_11978) || null),
    severity: field(plain(f.customfield_10159) || null),
    progress: field(
      typeof f.customfield_10118 === 'number' ? f.customfield_10118 : null,
    ),
    okr: field(plain(f.customfield_12920) || null),
    organizationalOkr: field(plain(f.customfield_12859) || null),
    quarters: names(f.customfield_12634),
    okrReferences: names(f.customfield_12162),
    issueLinks,
    periodClassification: 'UNKNOWN_PERIOD',
    periodConfidence: 'NONE',
    owner: field(plain(f.assignee) || null),
    priority: field(plain(f.priority) || null),
    sourceUrl: `${siteUrl}/browse/${encodeURIComponent(String(issue.key ?? ''))}`,
  };
}
export function buildProjectJql(projects: string[]) {
  return `project in (${projects.map((key) => `\"${key}\"`).join(', ')}) ORDER BY updated DESC`;
}
export async function discoverJira(
  client: JiraCloudClient,
  projects: string[],
) {
  const [allProjects, fields, statuses, issueTypes] = await Promise.all([
    client.getProjects(),
    client.getFields(),
    client.getStatuses(),
    client.getIssueTypes(),
  ]);
  const requested = new Set(projects);
  const accessible = allProjects.items.filter((p) =>
    requested.has(String(p.key)),
  );
  const fieldById = new Map(fields.data.map((f) => [String(f.id), f]));
  return {
    projects: accessible,
    projectsRequested: projects,
    projectsInaccessible: projects.filter(
      (key) => !accessible.some((p) => p.key === key),
    ),
    fields: CUSTOM_FIELDS.map((id) => ({
      id,
      name: fieldById.has(id) ? String(fieldById.get(id)?.name ?? '') : null,
      schema: fieldById.get(id)?.schema ?? null,
      status: fieldById.has(id) ? 'AVAILABLE' : 'MISSING',
    })),
    statuses: statuses.data,
    issueTypes: issueTypes.data,
    coverage: Math.round(
      (100 *
        (accessible.length / projects.length +
          CUSTOM_FIELDS.filter((id) => fieldById.has(id)).length /
            CUSTOM_FIELDS.length)) /
        2,
    ),
    warnings: projects
      .filter((key) => !accessible.some((p) => p.key === key))
      .map((key) => `Proyecto ${key}: INACCESSIBLE`),
  };
}
