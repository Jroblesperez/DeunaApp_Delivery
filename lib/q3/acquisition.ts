import type { JiraCloudClient, JiraPage } from '@/lib/jira/client';
import type { JiraCredentials } from '@/lib/jira/credentials';
import { ISSUE_FIELDS } from '@/lib/jira/live';
import {
  Q3_PORTFOLIO_PROFILE,
  Q3_REQUIRED_FIELDS,
  q3AcquisitionConfig,
} from './config';
type Raw = Record<string, unknown>;
export type FieldSampleState =
  | 'PRESENT'
  | 'EMPTY'
  | 'MISSING_FROM_RESPONSE'
  | 'INACCESSIBLE'
  | 'PARSE_ERROR';
export interface DatasetStatus {
  status: 'COMPLETED' | 'PARTIAL' | 'UNAVAILABLE';
  profile?: typeof Q3_PORTFOLIO_PROFILE;
  queryScope?: string;
  projects?: string[];
  itemsProcessed: number;
  initiativesDetected?: number;
  pagesProcessed: number;
  truncated: boolean;
  fieldsCoverage?: number;
  warnings: string[];
  queriedAt: string;
}
export interface RelationshipStatus {
  status: 'COMPLETED' | 'PARTIAL' | 'UNAVAILABLE';
  initiativesExpanded: number;
  deliveryParentsFound: number;
  deliveryParentsResolved: number;
  featuresFound: number;
  controlsFound: number;
  unresolvedLinks: number;
  truncated: boolean;
  coverage: number;
  warnings: string[];
  queriedAt: string;
}
export interface Q3Acquisition {
  portfolio: DatasetStatus;
  operational: DatasetStatus;
  relationships: RelationshipStatus;
  fieldDiscovery: Array<{
    id: string;
    name: string | null;
    schema: unknown;
    status: 'AVAILABLE' | 'MISSING_FIELD';
  }>;
  fieldSample: Record<string, FieldSampleState>;
  portfolioMain: Raw[];
  portfolioControl: Raw[];
  operationalItems: Raw[];
  relationshipItems: Raw[];
}
const initiativeTypes =
  '"Iniciativa estratégica", "Iniciativa Operativa", "Mejora Evolutiva", "Deuda Tecnica"';
const controls =
  '"Matriz de Riesgos", "Matriz Riesgos", "Dependencia", "Plan de Acción", "Plan Release"';
const quote = (value: string) => `"${value.replaceAll('"', '\\"')}"`;
const keyOf = (issue: Raw) => String(issue.key ?? '');
const dedupe = (items: Raw[]) =>
  [...new Map(items.map((item) => [keyOf(item), item])).values()].filter(
    (item) => keyOf(item),
  );
const chunks = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );
const fieldsOf = (issue: Raw) =>
  (issue.fields ?? {}) as Record<string, unknown>;
const issueTypeOf = (issue: Raw) =>
  String(
    ((fieldsOf(issue).issuetype ?? {}) as Record<string, unknown>).name ?? '',
  );
const issueTypeIdOf = (issue: Raw) =>
  String(
    ((fieldsOf(issue).issuetype ?? {}) as Record<string, unknown>).id ?? '',
  );
const empty = (value: unknown) =>
  value == null || value === '' || (Array.isArray(value) && value.length === 0);
function polarisKeys(issue: Raw) {
  const links = fieldsOf(issue).issuelinks;
  if (!Array.isArray(links)) return [];
  return links.flatMap((raw) => {
    const link = raw as Record<string, unknown>;
    const type = (link.type ?? {}) as Record<string, unknown>;
    if (String(type.id ?? '') !== '10006') return [];
    for (const side of ['outwardIssue', 'inwardIssue']) {
      const target = link[side] as Record<string, unknown> | undefined;
      if (target?.key) return [String(target.key)];
    }
    return [];
  });
}
function linkedControlKeys(issue: Raw) {
  const links = fieldsOf(issue).issuelinks;
  if (!Array.isArray(links)) return [];
  return links.flatMap((raw) => {
    const link = raw as Record<string, unknown>;
    for (const side of ['outwardIssue', 'inwardIssue']) {
      const target = link[side] as Record<string, unknown> | undefined;
      const targetFields = (target?.fields ?? {}) as Record<string, unknown>;
      const type = String(
        ((targetFields.issuetype ?? {}) as Record<string, unknown>).name ?? '',
      );
      if (
        target?.key &&
        /matriz|dependencia|plan de acci[oó]n|plan release/i.test(type)
      )
        return [String(target.key)];
    }
    return [];
  });
}
async function searchSafely(
  client: JiraCloudClient,
  jql: string,
  fields: string[],
  limit: number,
  warnings: string[],
  label: string,
): Promise<JiraPage<Raw>> {
  try {
    return await client.searchIssues(jql, fields, limit);
  } catch {
    warnings.push(`${label}: INACCESSIBLE`);
    return {
      items: [],
      pagesProcessed: 0,
      truncated: false,
      partial: true,
      warnings: [],
      correlationId: '',
      durationMs: 0,
    };
  }
}
async function pooled<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
) {
  const output: R[] = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        output[index] = await worker(items[index]);
      }
    }),
  );
  return output;
}
export async function acquireQ3Datasets(
  client: JiraCloudClient,
  credentials: JiraCredentials,
  operationalCheckpoint?: string,
): Promise<Q3Acquisition> {
  const config = q3AcquisitionConfig();
  const queriedAt = new Date().toISOString();
  const catalog = (await client.getFields()).data;
  const byId = new Map(catalog.map((field) => [String(field.id), field]));
  const fieldDiscovery = Q3_REQUIRED_FIELDS.map((id) => {
    const found = byId.get(id);
    return {
      id,
      name: found ? String(found.name ?? '') : null,
      schema: found?.schema ?? null,
      status: found ? ('AVAILABLE' as const) : ('MISSING_FIELD' as const),
    };
  });
  const warnings = fieldDiscovery
    .filter((x) => x.status === 'MISSING_FIELD')
    .map((x) => `${x.id}: MISSING_FIELD`);
  const selected = [
    ...new Set([
      ...ISSUE_FIELDS,
      ...Q3_REQUIRED_FIELDS.filter((id) => byId.has(id)),
    ]),
  ];
  if (!config.enabled)
    return {
      portfolio: {
        status: 'UNAVAILABLE',
        profile: Q3_PORTFOLIO_PROFILE,
        queryScope: 'DISABLED',
        itemsProcessed: 0,
        initiativesDetected: 0,
        pagesProcessed: 0,
        truncated: false,
        fieldsCoverage: 0,
        warnings: ['Perfil Q3 deshabilitado.'],
        queriedAt,
      },
      operational: {
        status: 'UNAVAILABLE',
        projects: credentials.projects,
        itemsProcessed: 0,
        pagesProcessed: 0,
        truncated: false,
        warnings: [],
        queriedAt,
      },
      relationships: {
        status: 'UNAVAILABLE',
        initiativesExpanded: 0,
        deliveryParentsFound: 0,
        deliveryParentsResolved: 0,
        featuresFound: 0,
        controlsFound: 0,
        unresolvedLinks: 0,
        truncated: false,
        coverage: 0,
        warnings: [],
        queriedAt,
      },
      fieldDiscovery,
      fieldSample: {},
      portfolioMain: [],
      portfolioControl: [],
      operationalItems: [],
      relationshipItems: [],
    };
  const mainJql = `project = ${config.project} AND issuetype IN (${initiativeTypes}) AND cf[12634] = Q3 ORDER BY key ASC`;
  const controlJql = `project = ${config.project} AND issuetype IN (${initiativeTypes}) AND (cf[12634] = Q3 OR (cf[11944] >= "2026-07-01" AND cf[11944] <= "2026-09-30")) ORDER BY key ASC`;
  const portfolioQueryable =
    byId.has('customfield_12634') && byId.has('customfield_11944');
  const emptyPage: JiraPage<Raw> = {
    items: [],
    pagesProcessed: 0,
    truncated: false,
    partial: true,
    warnings: [],
    correlationId: '',
    durationMs: 0,
  };
  const main = portfolioQueryable
    ? await searchSafely(
        client,
        mainJql,
        selected,
        Number.MAX_SAFE_INTEGER,
        warnings,
        'Portfolio Q3',
      )
    : emptyPage;
  const control = portfolioQueryable
    ? await searchSafely(
        client,
        controlJql,
        selected,
        Number.MAX_SAFE_INTEGER,
        warnings,
        'Control Q3',
      )
    : emptyPage;
  const controlOnly = dedupe(control.items).filter(
    (item) => !new Set(main.items.map(keyOf)).has(keyOf(item)),
  );
  const sample = main.items[0] ?? control.items[0];
  const fieldSample = Object.fromEntries(
    Q3_REQUIRED_FIELDS.map((id) => {
      if (!byId.has(id)) return [id, 'INACCESSIBLE'];
      if (!sample) return [id, 'MISSING_FROM_RESPONSE'];
      const fields = fieldsOf(sample);
      if (!Object.prototype.hasOwnProperty.call(fields, id))
        return [id, 'MISSING_FROM_RESPONSE'];
      try {
        return [id, empty(fields[id]) ? 'EMPTY' : 'PRESENT'];
      } catch {
        return [id, 'PARSE_ERROR'];
      }
    }),
  ) as Record<string, FieldSampleState>;
  const operationalProjects = credentials.projects.filter(
    (key) => key !== config.project,
  );
  const operationalFilter = operationalCheckpoint
    ? ` AND updated >= "${operationalCheckpoint.replace('T', ' ').slice(0, 19)}"`
    : '';
  const operationalJql = operationalProjects.length
    ? `project in (${operationalProjects.map(quote).join(', ')})${operationalFilter} ORDER BY updated ${operationalCheckpoint ? 'ASC' : 'DESC'}`
    : 'key IS EMPTY';
  const operational = await searchSafely(
    client,
    operationalJql,
    selected,
    credentials.maxIssues,
    [],
    'Operational',
  );
  const portfolioAll = dedupe([...main.items, ...controlOnly]);
  const parentKeys = [...new Set(portfolioAll.flatMap(polarisKeys))];
  const relationshipWarnings: string[] = [];
  let remaining = config.relationMaxIssues;
  const parentPages = await pooled(
    chunks(parentKeys, 50),
    config.relationConcurrency,
    async (batch) => {
      if (remaining <= 0) return null;
      const limit = Math.min(remaining, batch.length);
      const page = await searchSafely(
        client,
        `key in (${batch.map(quote).join(', ')})`,
        selected,
        limit,
        relationshipWarnings,
        'Delivery parent',
      );
      remaining -= page.items.length;
      return page;
    },
  );
  const parents = dedupe(parentPages.flatMap((page) => page?.items ?? []));
  const resolvedParentKeys = parents.map(keyOf);
  const features =
    remaining > 0 && resolvedParentKeys.length
      ? await searchSafely(
          client,
          `parent in (${resolvedParentKeys.map(quote).join(', ')}) AND issuetype = Feature ORDER BY key ASC`,
          selected,
          remaining,
          relationshipWarnings,
          'Features',
        )
      : {
          items: [],
          pagesProcessed: 0,
          truncated: false,
          partial: false,
          warnings: [],
          correlationId: '',
          durationMs: 0,
        };
  remaining -= features.items.length;
  const controlByParent =
    remaining > 0 && resolvedParentKeys.length
      ? await searchSafely(
          client,
          `parent in (${resolvedParentKeys.map(quote).join(', ')}) AND issuetype IN (${controls}) ORDER BY key ASC`,
          selected,
          remaining,
          relationshipWarnings,
          'Controls',
        )
      : {
          items: [],
          pagesProcessed: 0,
          truncated: false,
          partial: false,
          warnings: [],
          correlationId: '',
          durationMs: 0,
        };
  remaining -= controlByParent.items.length;
  const matrixKeys = dedupe([...controlByParent.items])
    .filter(
      (item) =>
        issueTypeIdOf(item) === '10210' ||
        /matriz (de )?riesgos/i.test(issueTypeOf(item)),
    )
    .map(keyOf);
  const riskDomainChildren =
    remaining > 0 && matrixKeys.length
      ? await searchSafely(
          client,
          `parent in (${matrixKeys.map(quote).join(', ')}) ORDER BY key ASC`,
          selected,
          remaining,
          relationshipWarnings,
          'Risk Gate domains',
        )
      : {
          items: [],
          pagesProcessed: 0,
          truncated: false,
          partial: false,
          warnings: [],
          correlationId: '',
          durationMs: 0,
        };
  remaining -= riskDomainChildren.items.length;
  const explicitControlKeys = [
    ...new Set(
      [...portfolioAll, ...parents, ...features.items].flatMap(
        linkedControlKeys,
      ),
    ),
  ].filter((key) => !new Set(controlByParent.items.map(keyOf)).has(key));
  const explicitControls =
    remaining > 0 && explicitControlKeys.length
      ? await searchSafely(
          client,
          `key in (${explicitControlKeys.slice(0, remaining).map(quote).join(', ')})`,
          selected,
          remaining,
          relationshipWarnings,
          'Linked controls',
        )
      : {
          items: [],
          pagesProcessed: 0,
          truncated: false,
          partial: false,
          warnings: [],
          correlationId: '',
          durationMs: 0,
        };
  const relationshipItems = dedupe([
    ...parents,
    ...features.items,
    ...controlByParent.items,
    ...riskDomainChildren.items,
    ...explicitControls.items,
  ]);
  const relationTruncated =
    remaining <= 0 ||
    features.truncated ||
    controlByParent.truncated ||
    riskDomainChildren.truncated ||
    explicitControls.truncated;
  const unresolved = Math.max(0, parentKeys.length - parents.length);
  const relationCoverage = parentKeys.length
    ? Math.round((parents.length / parentKeys.length) * 10000) / 100
    : 100;
  const portfolioCoverage =
    Math.round(
      (fieldDiscovery.filter((x) => x.status === 'AVAILABLE').length /
        fieldDiscovery.length) *
        10000,
    ) / 100;
  return {
    portfolio: {
      status: !portfolioQueryable
        ? 'UNAVAILABLE'
        : main.partial || warnings.length
          ? 'PARTIAL'
          : 'COMPLETED',
      profile: Q3_PORTFOLIO_PROFILE,
      queryScope: 'DSP canonical initiatives with Quarter Q3',
      itemsProcessed: portfolioAll.length,
      initiativesDetected: main.items.length,
      pagesProcessed: main.pagesProcessed + control.pagesProcessed,
      truncated: main.truncated || control.truncated,
      fieldsCoverage: portfolioCoverage,
      warnings: [...warnings, ...main.warnings, ...control.warnings],
      queriedAt,
    },
    operational: {
      status:
        operational.partial || operational.truncated ? 'PARTIAL' : 'COMPLETED',
      projects: operationalProjects,
      itemsProcessed: operational.items.length,
      pagesProcessed: operational.pagesProcessed,
      truncated: operational.truncated,
      warnings: operational.warnings,
      queriedAt,
    },
    relationships: {
      status:
        relationshipWarnings.length || unresolved || relationTruncated
          ? 'PARTIAL'
          : 'COMPLETED',
      initiativesExpanded: portfolioAll.length,
      deliveryParentsFound: parentKeys.length,
      deliveryParentsResolved: parents.length,
      featuresFound: relationshipItems.filter(
        (item) => issueTypeOf(item).toLowerCase() === 'feature',
      ).length,
      controlsFound: relationshipItems.filter((item) =>
        /matriz|dependencia|plan de acci[oó]n|plan release/i.test(
          issueTypeOf(item),
        ),
      ).length,
      unresolvedLinks: unresolved,
      truncated: relationTruncated,
      coverage: relationCoverage,
      warnings: relationshipWarnings,
      queriedAt,
    },
    fieldDiscovery,
    fieldSample,
    portfolioMain: main.items,
    portfolioControl: controlOnly,
    operationalItems: operational.items,
    relationshipItems,
  };
}
