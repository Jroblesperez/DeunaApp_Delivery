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
      headline: `${devWithoutProduction.length} iniciativas terminaron Development, pero aún no han llegado a Producción.`,
      narrative: 'El sistema de delivery acumula trabajo después de Development. La causa probable es Risk Approval: su espera mediana aumentó de 6,1 a 11 días.',
      metric: 'Time to Deploy', currentValue: 21.6, previousValue: 18.1, targetValue: 18, unit: 'días',
      entityType: 'ORGANIZATION', entityId: 'DEUNA', impact: 'La entrega de valor del trimestre podría superar las fechas comprometidas.',
      evidence: [evidence('Initiatives after DEV', String(devWithoutProduction.length), 'Deuna'), evidence('Risk Approval median', '11 days', 'Delivery system', 'Current week')],
      recommendation: 'Crear una revisión conjunta de salida QA y Risk para las tres iniciativas más antiguas.', recommendedDecision: 'ESCALATE', owner: 'Delivery Leader', dueDate: '2026-08-04', confidence: 91, source, lastUpdated: updated, href: '/analytics',
    },
    {
      id: 'INS-CAP-01', category: 'CAPACITY', severity: 'CRITICAL',
      headline: `Habilitadores tiene comprometido ${utilization}% de su capacidad disponible.`,
      narrative: 'La demanda supera el umbral sostenible en 16 puntos y aumenta la cola de dependencias de plataforma.',
      metric: 'Capacity commitment', currentValue: utilization, previousValue: 108, targetValue: 100, unit: '%',
      entityType: 'ECO', entityId: 'HABILITADORES', impact: 'Los compromisos de infraestructura y arquitectura podrían retrasar iniciativas dependientes.',
      evidence: [evidence('Committed capacity', `${habilitadores.committed} SP`, 'Habilitadores'), evidence('Available capacity', `${habilitadores.available} SP`, 'Habilitadores')],
      recommendation: 'Reasignar 24 Story Points o reducir el compromiso activo antes del cierre de planificación.', recommendedDecision: 'REALLOCATE_CAPACITY', owner: 'ECO Leader · Habilitadores', dueDate: '2026-08-03', confidence: 96, source, lastUpdated: updated, href: '/capacity',
    },
    {
      id: 'INS-RISK-01', category: 'RISK', severity: 'CRITICAL',
      headline: `${overduePlans.length} planes de acción están vencidos y dos releases permanecen bloqueados.`,
      narrative: 'Los controles Critical y High abiertos impiden confirmar readiness. Una aprobación ausente se muestra pendiente, nunca completa.',
      metric: 'Overdue action plans', currentValue: overduePlans.length, previousValue: 3, targetValue: 0, unit: 'planes',
      entityType: 'RISK_PORTFOLIO', entityId: 'RISK-Q3', impact: 'Las fechas de Producción permanecen sin confirmar para cambios regulados.',
      evidence: [evidence('Overdue plans', String(overduePlans.length), 'Risk portfolio'), evidence('Blocked releases', String(releases.filter((release) => release.blocked).length), 'Release portfolio')],
      recommendation: 'Solicitar a los responsables fechas de remediación y escalar controles Critical.', recommendedDecision: 'REQUEST_ACTION_PLAN', owner: 'Risk Leader', dueDate: '2026-08-01', confidence: 98, source, lastUpdated: updated, href: '/risks',
    },
    {
      id: 'INS-DEP-01', category: 'DEPENDENCY', severity: 'AT_RISK',
      headline: `${openDependencies.length} dependencias entre equipos continúan sin resolver.`,
      narrative: 'Tres tienen impacto Critical. La cola se concentra en equipos habilitadores, consistente con su presión de capacidad.',
      metric: 'Open dependencies', currentValue: openDependencies.length, previousValue: 8, targetValue: 6, unit: 'dependencias',
      entityType: 'DEPENDENCY_PORTFOLIO', entityId: 'DEP-Q3', impact: 'Los compromisos no aceptados reducen la confianza del forecast.',
      evidence: [evidence('Open dependencies', String(openDependencies.length), 'Deuna'), evidence('Critical dependencies', String(openDependencies.filter((item) => item.impact === 'CRITICAL').length), 'Deuna')],
      recommendation: 'Confirmar responsables y fechas de cada dependencia Critical en la revisión ejecutiva semanal.', recommendedDecision: 'RESOLVE_DEPENDENCY', owner: 'ECO Leaders', dueDate: '2026-08-05', confidence: 88, source, lastUpdated: updated, href: '/dependencies',
    },
    {
      id: 'INS-STR-01', category: 'STRATEGY', severity: 'WATCH',
      headline: 'La capacidad estratégica aumentó a 48%, mientras Delivery Confidence bajó a 68%.',
      narrative: 'La organización invierte más en estrategia, pero la espera posterior a Development reduce la confianza en fechas de resultados.',
      metric: 'Delivery confidence', currentValue: 68, previousValue: 78, targetValue: 80, unit: '%',
      entityType: 'ORGANIZATION', entityId: 'DEUNA', impact: 'La mayor inversión estratégica podría no convertirse en resultados dentro del trimestre.',
      evidence: [evidence('Strategic capacity', '48%', 'Deuna'), evidence('Delivery confidence', '68%', 'Deuna')],
      recommendation: 'Proteger la capacidad estratégica y remover gates downstream antes de agregar trabajo.', recommendedDecision: 'REPRIORITIZE', owner: 'Executive Committee', dueDate: '2026-08-06', confidence: 84, source, lastUpdated: updated, href: '/portfolio',
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
      rule: `${insight.metric} cruzó el umbral configurado`, href: insight.href,
      impactScore: score(insight.severity), urgencyScore: insight.dueDate <= '2026-08-03' ? 100 : 75,
    }))
    .sort((a, b) => b.impactScore - a.impactScore || b.urgencyScore - a.urgencyScore || a.dueDate.localeCompare(b.dueDate) || b.confidence - a.confidence);
}

export function generateExecutiveNarrative() {
  const decisions = generateDecisions();
  return {
    situation: 'La ejecución sigue bajo presión: Delivery Confidence está en 68%, diez puntos bajo el trimestre anterior.',
    changes: 'La espera mediana en Risk Approval aumentó de 6,1 a 11 días y las dependencias abiertas crecieron de siete a diez.',
    risk: 'Tres iniciativas probablemente no llegarán a Producción según su trayectoria y cuatro planes de acción están vencidos.',
    opportunity: 'La capacidad estratégica aumentó de 42% a 48%; protegerla puede acelerar resultados de mayor valor.',
    decisions: `${decisions.filter((decision) => decision.priority === 'P0').length} decisiones requieren atención ejecutiva antes del lunes.`,
    recommendation: 'Priorizar la salida de Risk Approval y reducir presión en Habilitadores antes de aceptar más alcance.',
    evidence: generateActionableInsights().flatMap((insight) => insight.evidence).slice(0, 6),
    lastUpdated,
  };
}

export function generateExecutiveMemory(grain: HistoricalSnapshot['grain'] = 'QUARTER'): MemoryComparison[] {
  const snapshots = historicalSnapshots.filter((snapshot) => snapshot.grain === grain);
  const previous = snapshots.at(-2);
  const current = snapshots.at(-1);
  const definitions = [
    ['cycleTime', 'Cycle Time', 'days', 16, 'la espera en QA aumentó 27%.', 'Finalización más lenta y colas mayores.', 'Limitar WIP y reservar capacidad QA.'],
    ['timeToDeploy', 'Time to Deploy', 'days', 18, 'la espera en Risk Approval aumentó 83%.', 'El valor llega más tarde a clientes.', 'Crear una ventana fija de revisión de riesgos.'],
    ['capacityUtilization', 'Capacity Utilization', '%', 85, 'Habilitadores superó 110% de compromiso.', 'Las colas habilitadoras amenazan trabajo dependiente.', 'Reasignar capacidad desde trabajo de menor prioridad.'],
    ['deliveryConfidence', 'Delivery Confidence', '%', 80, 'La espera posterior a Development aumentó.', 'Los compromisos trimestrales tienen menor predictibilidad.', 'Decidir alcance antes del próximo límite de planificación.'],
    ['openDependencies', 'Open Dependencies', 'dependencies', 6, 'Tres nuevos compromisos entre equipos siguen sin aceptar.', 'Las fechas dependen de trabajo fuera del control del owner.', 'Escalar dependencias Critical.'],
    ['riskApprovalTime', 'Risk Approval Time', 'days', 7, 'Más controles High/Critical entraron en revisión.', 'Release readiness está retrasado.', 'Secuenciar primero las matrices más antiguas.'],
  ] as const;

  return definitions.map(([key, label, unit, target, driver, impact, action]) => {
    const prev = previous?.metrics[key] ?? null;
    const curr = current?.metrics[key] ?? null;
    if (prev === null || curr === null) return {id:key,metric:label,previous:prev,current:curr,target,unit,absoluteChange:null,percentageChange:null,interpretation:'Datos insuficientes',driver:'Datos insuficientes',impact:'No se puede evaluar el impacto.',action:'Confirmar cobertura de la fuente.',direction:'INSUFFICIENT_DATA' as const};
    const absolute = Number((curr - prev).toFixed(1));
    const percentage = prev === 0 ? null : Math.round((absolute / prev) * 100);
    const lowerIsBetter = !['deliveryConfidence'].includes(key);
    const direction = Math.abs(percentage ?? 0) < 3 ? 'STABLE' : (lowerIsBetter ? absolute < 0 : absolute > 0) ? 'IMPROVING' : 'DETERIORATING';
    return {id:key,metric:label,previous:prev,current:curr,target,unit,absoluteChange:absolute,percentageChange:percentage,interpretation:direction === 'DETERIORATING' ? `${label} se alejó del objetivo.` : `${label} se acercó al objetivo.`,driver:`Causa probable: ${driver}`,impact,action,direction};
  });
}

export function generateStrategicMovements() {
  return [
    {id:'MOV-01',direction:'IMPROVING',headline:'La capacidad estratégica aumentó',before:'42%',now:'48%',cause:'Seis puntos porcentuales se reasignaron desde trabajo operativo.',impact:'Más inversión está alineada con resultados corporativos.',evidence:'Q2 vs Q3 capacity snapshots',href:'/portfolio'},
    {id:'MOV-02',direction:'DETERIORATING',headline:'Delivery Confidence disminuyó',before:'78%',now:'68%',cause:'Causa probable: la espera entre QA y Risk aumentó.',impact:'Tres iniciativas probablemente no llegarán a Producción este trimestre.',evidence:'Snapshots de confianza y flujo Q2 vs Q3',href:'/analytics'},
    {id:'MOV-03',direction:'DETERIORATING',headline:'El consumo de deuda técnica aumentó',before:'18%',now:'27%',cause:'El hardening de plataforma y la modernización del SDK entraron a delivery.',impact:'La capacidad de features disminuye a corto plazo mientras mejora la resiliencia.',evidence:'Portfolio mix by initiative type',href:'/portfolio'},
    {id:'MOV-04',direction:'IMPROVING',headline:'Cinco iniciativas avanzaron downstream',before:'Development',now:'QA o posterior',cause:'Sprint completion se mantuvo sobre 84%.',impact:'El valor está más cerca de Producción si se resuelven los gates.',evidence:'Transiciones de etapa · semana actual',href:'/initiatives'},
  ];
}

export function generateOrganizationalPulse() {
  const severity = { CRITICAL: 5, AT_RISK: 4, WATCH: 3, HEALTHY: 2, INSUFFICIENT_DATA: 1 } as const;
  return ecos.map((eco, index) => {
    const utilization = capacityUtilization(eco.committed, eco.available);
    const status = utilization > 115 ? 'CRITICAL' : utilization > 100 || eco.risks >= 3 ? 'AT_RISK' : eco.health === 'WARNING' ? 'WATCH' : 'HEALTHY';
    return {
      id: eco.name.toUpperCase(), name: eco.name, status: status as keyof typeof severity,
      strength: eco.progress >= 70 ? 'El avance trimestral permanece sobre la mediana del portafolio.' : 'Throughput permanece estable.',
      risk: utilization > 100 ? `Capacity commitment is ${utilization}%.` : eco.dependencies > 6 ? `${eco.dependencies} dependencias requieren coordinación.` : 'Los próximos gates de release requieren monitoreo.',
      utilization, confidence: Math.max(48, 82 - index * 3), dependencies: eco.dependencies,
      riskExposure: eco.risks, forecast: eco.forecast,
      recommendation: utilization > 100 ? 'Reducir compromiso o reasignar capacidad.' : eco.dependencies > 6 ? 'Confirmar owners de dependencias esta semana.' : 'Mantener foco y validar los próximos controles de release.',
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
    forecast: projectedDelay ? `${projectedDelay} días después del objetivo` : 'Dentro del rango objetivo',
    diagnosis: `${slowest.name} es la mayor contribución al tiempo transcurrido.`,
    recommendation: slowest.name === 'Riesgo' ? 'Escalar la evidencia pendiente de Risk Approval.' : 'Confirmar el owner del siguiente gate y proteger el flujo de WIP adicional.',
  };
}

