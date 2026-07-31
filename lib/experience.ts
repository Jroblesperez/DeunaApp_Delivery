import {
  dependencies,
  ecos,
  historicalSnapshots,
  initiatives,
  lastUpdated,
  releases,
  risks,
} from './demo-data';
import { capacityUtilization, cycleTime } from './metrics';
import type {
  ActionableInsight,
  Evidence,
  ExecutiveDecision,
  HistoricalSnapshot,
  Initiative,
  MemoryComparison,
  SignalSeverity,
} from './types';

const source = 'FlowOS · Jira Demo Data';
const updated = '2026-07-31T09:42:00Z';

function evidence(metric: string, value: string, entity: string, period = 'Q3 2026'): Evidence {
  return { metric, value, entity, period, source, lastUpdated: updated, coverage: 100 };
}

export function generateActionableInsights(): ActionableInsight[] {
  const devWithoutProduction = initiatives.filter((item) =>
    ['READY_FOR_QA', 'IN_QA', 'RISK_APPROVAL', 'READY_FOR_RELEASE'].includes(item.status),
  );
  const overduePlans = risks.filter((risk) => risk.plan === 'Vencido');
  const habilitadores = ecos.find((eco) => eco.name === 'Habilitadores')!;
  const utilization = capacityUtilization(habilitadores.committed, habilitadores.available);
  const openDependencies = dependencies.filter((dependency) => dependency.status !== 'DELIVERED');

  return [
    {
      id: 'INS-FLOW-01', category: 'FLOW', severity: 'AT_RISK',
      headline: `${devWithoutProduction.length} initiatives completed development but have not reached production.`,
      narrative: 'The delivery system is accumulating work after development. Risk Approval is the likely driver because its median wait increased from 6.1 to 11 days.',
      metric: 'Time to Deploy', currentValue: 21.6, previousValue: 18.1, targetValue: 18, unit: 'days',
      entityType: 'ORGANIZATION', entityId: 'DEUNA', impact: 'Quarterly value realization is likely to move beyond committed dates.',
      evidence: [evidence('Initiatives after DEV', String(devWithoutProduction.length), 'Deuna'), evidence('Risk Approval median', '11 days', 'Delivery system', 'Current week')],
      recommendation: 'Create a joint QA and Risk exit review for the three oldest initiatives.', recommendedDecision: 'ESCALATE', owner: 'Delivery Leader', dueDate: '2026-08-04', confidence: 91, source, lastUpdated: updated, href: '/analytics',
    },
    {
      id: 'INS-CAP-01', category: 'CAPACITY', severity: 'CRITICAL',
      headline: `Habilitadores has committed ${utilization}% of available capacity.`,
      narrative: 'Demand exceeds the sustainable threshold by 16 percentage points, increasing queue time for platform dependencies.',
      metric: 'Capacity commitment', currentValue: utilization, previousValue: 108, targetValue: 100, unit: '%',
      entityType: 'ECO', entityId: 'HABILITADORES', impact: 'Infrastructure and architecture commitments may delay dependent initiatives.',
      evidence: [evidence('Committed capacity', `${habilitadores.committed} SP`, 'Habilitadores'), evidence('Available capacity', `${habilitadores.available} SP`, 'Habilitadores')],
      recommendation: 'Reallocate 24 Story Points or reduce the active commitment before planning closes.', recommendedDecision: 'REALLOCATE_CAPACITY', owner: 'ECO Leader · Habilitadores', dueDate: '2026-08-03', confidence: 96, source, lastUpdated: updated, href: '/capacity',
    },
    {
      id: 'INS-RISK-01', category: 'RISK', severity: 'CRITICAL',
      headline: `${overduePlans.length} action plans are overdue and two releases remain blocked.`,
      narrative: 'Open Critical and High controls prevent readiness confirmation. Missing approval is shown as pending, never inferred as complete.',
      metric: 'Overdue action plans', currentValue: overduePlans.length, previousValue: 3, targetValue: 0, unit: 'plans',
      entityType: 'RISK_PORTFOLIO', entityId: 'RISK-Q3', impact: 'Production dates remain unconfirmed for regulated changes.',
      evidence: [evidence('Overdue plans', String(overduePlans.length), 'Risk portfolio'), evidence('Blocked releases', String(releases.filter((release) => release.blocked).length), 'Release portfolio')],
      recommendation: 'Request owners to confirm remediation dates and escalate Critical controls.', recommendedDecision: 'REQUEST_ACTION_PLAN', owner: 'Risk Leader', dueDate: '2026-08-01', confidence: 98, source, lastUpdated: updated, href: '/risks',
    },
    {
      id: 'INS-DEP-01', category: 'DEPENDENCY', severity: 'AT_RISK',
      headline: `${openDependencies.length} cross-team dependencies remain unresolved.`,
      narrative: 'Three have Critical impact. The queue is concentrated in enabling teams, which is consistent with their capacity pressure.',
      metric: 'Open dependencies', currentValue: openDependencies.length, previousValue: 8, targetValue: 6, unit: 'dependencies',
      entityType: 'DEPENDENCY_PORTFOLIO', entityId: 'DEP-Q3', impact: 'Unaccepted commitments reduce delivery forecast confidence.',
      evidence: [evidence('Open dependencies', String(openDependencies.length), 'Deuna'), evidence('Critical dependencies', String(openDependencies.filter((item) => item.impact === 'CRITICAL').length), 'Deuna')],
      recommendation: 'Confirm owners and dates for every Critical dependency in the weekly executive review.', recommendedDecision: 'RESOLVE_DEPENDENCY', owner: 'ECO Leaders', dueDate: '2026-08-05', confidence: 88, source, lastUpdated: updated, href: '/dependencies',
    },
    {
      id: 'INS-STR-01', category: 'STRATEGY', severity: 'WATCH',
      headline: 'Strategic capacity increased to 48%, while delivery confidence declined to 68%.',
      narrative: 'The organization is investing more in strategy, but rising post-development waiting time is reducing confidence in outcome dates.',
      metric: 'Delivery confidence', currentValue: 68, previousValue: 78, targetValue: 80, unit: '%',
      entityType: 'ORGANIZATION', entityId: 'DEUNA', impact: 'More strategic investment may not translate into outcomes within the quarter.',
      evidence: [evidence('Strategic capacity', '48%', 'Deuna'), evidence('Delivery confidence', '68%', 'Deuna')],
      recommendation: 'Protect strategic capacity and remove downstream gates rather than adding new work.', recommendedDecision: 'REPRIORITIZE', owner: 'Executive Committee', dueDate: '2026-08-06', confidence: 84, source, lastUpdated: updated, href: '/portfolio',
    },
  ];
}

export function generateDecisions(): ExecutiveDecision[] {
  const priority = (severity: SignalSeverity): 'P0'|'P1'|'P2' => severity === 'CRITICAL' ? 'P0' : severity === 'AT_RISK' ? 'P1' : 'P2';
  const score = (severity: SignalSeverity) => severity === 'CRITICAL' ? 100 : severity === 'AT_RISK' ? 80 : 55;
  return generateActionableInsights()
    .map((insight) => ({
      id: insight.id.replace('INS', 'DEC'), title: insight.recommendation, type: insight.recommendedDecision,
      category: insight.category, priority: priority(insight.severity), status: 'OPEN' as const,
      situation: insight.headline, impact: insight.impact, evidence: insight.evidence,
      recommendation: insight.recommendation, owner: insight.owner, dueDate: insight.dueDate,
      entity: `${insight.entityType} · ${insight.entityId}`, confidence: insight.confidence,
      rule: `${insight.metric} crossed configured threshold`, href: insight.href,
      impactScore: score(insight.severity), urgencyScore: insight.dueDate <= '2026-08-03' ? 100 : 75,
    }))
    .sort((a, b) => b.impactScore - a.impactScore || b.urgencyScore - a.urgencyScore || a.dueDate.localeCompare(b.dueDate) || b.confidence - a.confidence);
}

export function generateExecutiveNarrative() {
  const decisions = generateDecisions();
  return {
    situation: 'Execution remains under pressure: delivery confidence is 68%, ten points below the previous quarter.',
    changes: 'Risk Approval median wait increased from 6.1 to 11 days, while open dependencies grew from seven to ten.',
    risk: 'Three initiatives are unlikely to reach production on their committed trajectory and four action plans are overdue.',
    opportunity: 'Strategic capacity increased from 42% to 48%; protecting it could accelerate the highest-value outcomes.',
    decisions: `${decisions.filter((decision) => decision.priority === 'P0').length} decisions require executive attention before Monday.`,
    recommendation: 'Prioritize the Risk Approval exit review and remove capacity pressure in Habilitadores before accepting more scope.',
    evidence: generateActionableInsights().flatMap((insight) => insight.evidence).slice(0, 6),
    lastUpdated,
  };
}

export function generateExecutiveMemory(grain: HistoricalSnapshot['grain'] = 'QUARTER'): MemoryComparison[] {
  const snapshots = historicalSnapshots.filter((snapshot) => snapshot.grain === grain);
  const previous = snapshots.at(-2);
  const current = snapshots.at(-1);
  const definitions = [
    ['cycleTime', 'Cycle Time', 'days', 16, 'QA waiting time increased 27%.', 'Slower completion and larger queues.', 'Limit WIP and reserve QA capacity.'],
    ['timeToDeploy', 'Time to Deploy', 'days', 18, 'Risk Approval wait increased 83%.', 'Value reaches customers later.', 'Create a fixed risk review window.'],
    ['capacityUtilization', 'Capacity Utilization', '%', 85, 'Habilitadores crossed 110% commitment.', 'Enabling queues threaten dependent work.', 'Reallocate capacity from lower-priority work.'],
    ['deliveryConfidence', 'Delivery Confidence', '%', 80, 'Post-development waiting time increased.', 'Quarter commitments have lower predictability.', 'Decide scope before the next planning boundary.'],
    ['openDependencies', 'Open Dependencies', 'dependencies', 6, 'Three new cross-team commitments remain unaccepted.', 'Dates depend on work outside owner control.', 'Escalate Critical dependencies.'],
    ['riskApprovalTime', 'Risk Approval Time', 'days', 7, 'More High/Critical controls entered review.', 'Release readiness is delayed.', 'Sequence the oldest risk matrices first.'],
  ] as const;

  return definitions.map(([key, label, unit, target, driver, impact, action]) => {
    const prev = previous?.metrics[key] ?? null;
    const curr = current?.metrics[key] ?? null;
    if (prev === null || curr === null) return {id:key,metric:label,previous:prev,current:curr,target,unit,absoluteChange:null,percentageChange:null,interpretation:'Insufficient data',driver:'Insufficient data',impact:'Impact cannot be assessed.',action:'Confirm source coverage.',direction:'INSUFFICIENT_DATA' as const};
    const absolute = Number((curr - prev).toFixed(1));
    const percentage = prev === 0 ? null : Math.round((absolute / prev) * 100);
    const lowerIsBetter = !['deliveryConfidence'].includes(key);
    const direction = Math.abs(percentage ?? 0) < 3 ? 'STABLE' : (lowerIsBetter ? absolute < 0 : absolute > 0) ? 'IMPROVING' : 'DETERIORATING';
    return {id:key,metric:label,previous:prev,current:curr,target,unit,absoluteChange:absolute,percentageChange:percentage,interpretation:direction === 'DETERIORATING' ? `${label} moved away from target.` : `${label} moved toward target.`,driver:`Likely driver: ${driver}`,impact,action,direction};
  });
}

export function generateStrategicMovements() {
  return [
    {id:'MOV-01',direction:'IMPROVING',headline:'Strategic capacity increased',before:'42%',now:'48%',cause:'Six percentage points moved from operational work.',impact:'More investment is aligned with corporate outcomes.',evidence:'Q2 vs Q3 capacity snapshots',href:'/portfolio'},
    {id:'MOV-02',direction:'DETERIORATING',headline:'Delivery confidence declined',before:'78%',now:'68%',cause:'Likely driver: waiting between QA and Risk increased.',impact:'Three initiatives are unlikely to reach production this quarter.',evidence:'Q2 vs Q3 confidence and flow snapshots',href:'/analytics'},
    {id:'MOV-03',direction:'DETERIORATING',headline:'Technical debt consumption increased',before:'18%',now:'27%',cause:'Platform hardening and SDK modernization entered delivery.',impact:'Short-term feature capacity is reduced, while resilience improves.',evidence:'Portfolio mix by initiative type',href:'/portfolio'},
    {id:'MOV-04',direction:'IMPROVING',headline:'Five initiatives advanced downstream',before:'Development',now:'QA or later',cause:'Sprint completion remained above 84%.',impact:'Value is closer to production if exit gates are cleared.',evidence:'Stage transitions · current week',href:'/initiatives'},
  ];
}

export function generateOrganizationalPulse() {
  const severity = { CRITICAL: 5, AT_RISK: 4, WATCH: 3, HEALTHY: 2, INSUFFICIENT_DATA: 1 } as const;
  return ecos.map((eco, index) => {
    const utilization = capacityUtilization(eco.committed, eco.available);
    const status = utilization > 115 ? 'CRITICAL' : utilization > 100 || eco.risks >= 3 ? 'AT_RISK' : eco.health === 'WARNING' ? 'WATCH' : 'HEALTHY';
    return {
      id: eco.name.toUpperCase(), name: eco.name, status: status as keyof typeof severity,
      strength: eco.progress >= 70 ? 'Quarter progress remains above portfolio median.' : 'Throughput remains stable.',
      risk: utilization > 100 ? `Capacity commitment is ${utilization}%.` : eco.dependencies > 6 ? `${eco.dependencies} dependencies require coordination.` : 'Upcoming release gates require monitoring.',
      utilization, confidence: Math.max(48, 82 - index * 3), dependencies: eco.dependencies,
      riskExposure: eco.risks, forecast: eco.forecast,
      recommendation: utilization > 100 ? 'Reduce commitment or reallocate capacity.' : eco.dependencies > 6 ? 'Confirm dependency owners this week.' : 'Maintain focus and validate upcoming release controls.',
      severity: severity[status], href: `/ecos#${eco.name.toLowerCase()}`,
    };
  }).sort((a, b) => b.severity - a.severity || a.confidence - b.confidence);
}

export function generateTimelineDiagnosis(initiative: Initiative) {
  const elapsed = initiative.stages.filter((stage) => stage.state !== 'next');
  const total = cycleTime(initiative.stages);
  const activeStages = new Set(['DEV', 'Development', 'QA', 'Despliegue']);
  const active = elapsed.filter((stage) => activeStages.has(stage.name)).reduce((sum, stage) => sum + stage.days, 0);
  const blocked = initiative.status === 'BLOCKED' ? initiative.daysInStatus : 0;
  const waiting = Math.max(0, total - active);
  const slowest = [...elapsed].sort((a, b) => b.days - a.days)[0] ?? initiative.stages[0];
  const outsideDevelopment = total ? Math.round(((total - (elapsed.find((stage) => stage.name === 'DEV')?.days ?? 0)) / total) * 100) : 0;
  const projectedDelay = initiative.confidence < 60 ? Math.max(3, Math.round((60 - initiative.confidence) / 2)) : 0;
  return {
    total, active, waiting, blocked, outsideDevelopment, slowest,
    current: initiative.stages.find((stage) => stage.state === 'current')?.name ?? initiative.status,
    historicalMedian: 6.4, deviation: slowest.days ? Math.round(((slowest.days - 6.4) / 6.4) * 100) : 0,
    projectedDelay, target: initiative.target,
    forecast: projectedDelay ? `${projectedDelay} days after target` : 'Within target range',
    diagnosis: `${slowest.name} is the largest contributor to elapsed time.`,
    recommendation: slowest.name === 'Riesgo' ? 'Escalate the pending Risk Approval evidence.' : 'Confirm the next gate owner and protect flow from additional WIP.',
  };
}

