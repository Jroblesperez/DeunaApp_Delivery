export const Q3_CONFIG = {
  period: 'Q3-2026',
  start: '2026-07-01T00:00:00.000Z',
  end: '2026-09-30T23:59:59.999Z',
  thresholds: {
    stalledDays: 14,
    approvalAgingDays: 10,
    notStartedWarningDay: 30,
    teamActiveInitiativeLimit: 8,
    targetDateWarningDays: 21,
    minimumProgressCoverage: 0.5,
  },
  polarisLinkTypeId: '10006',
  polarisDirection: 'is implemented by',
  sourceProject: 'DSP',
} as const;
export const Q3_PROFILE_VERSION = 'deuna-q3-v2-acquisition';
export const Q3_PORTFOLIO_PROFILE = 'DEUNA_Q3_PORTFOLIO' as const;
export const Q3_REQUIRED_FIELDS = [
  'customfield_12634',
  'customfield_11944',
  'customfield_11372',
  'customfield_10001',
  'customfield_12162',
  'customfield_10015',
  'customfield_13104',
  'customfield_13110',
  'customfield_13112',
  'customfield_13114',
  'customfield_11177',
  'customfield_12981',
  'customfield_10522',
  'customfield_11252',
] as const;
export function q3AcquisitionConfig() {
  const integer = (
    value: string | undefined,
    fallback: number,
    min: number,
    max: number,
  ) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= min && parsed <= max
      ? parsed
      : fallback;
  };
  const project = (process.env.JIRA_Q3_PORTFOLIO_PROJECT ?? 'DSP')
    .trim()
    .toUpperCase();
  return {
    enabled:
      (process.env.JIRA_Q3_PORTFOLIO_ENABLED ?? 'true').toLowerCase() ===
      'true',
    project: /^[A-Z][A-Z0-9_]{1,19}$/.test(project) ? project : 'DSP',
    relationMaxIssues: integer(
      process.env.JIRA_Q3_RELATION_MAX_ISSUES,
      3000,
      1,
      10000,
    ),
    relationConcurrency: integer(
      process.env.JIRA_Q3_RELATION_CONCURRENCY,
      3,
      1,
      10,
    ),
  };
}
