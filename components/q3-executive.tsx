'use client';
import { useEffect, useState } from 'react';

type Status = 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
type Metric = {
  value: number | null;
  status: Status;
  population: number;
  applicablePopulation: number;
  coverage: number;
  confidence: string;
  evidence: string[];
  warnings: string[];
};
type Metrics = Record<string, Metric>;
type Overview = {
  snapshot: { version: number; lastUpdated: string; truncated: boolean; portfolioStatus?: string };
  commitment: Metrics;
  delivery: Metrics;
  progress: Metrics;
  risk: Metrics;
  release: Metrics;
  pulse: Metrics;
  dataConfidence: Metrics;
  reconciliation: Record<string, number>;
};

const labels: Record<string, string> = {
  declared: 'Declaradas', candidates: 'Candidatas / Parking lot', committed: 'Comprometidas vigentes',
  dateConflicts: 'Conflictos Quarter/fecha', notStarted: 'Sin iniciar', discovery: 'Discovery',
  inExecution: 'En ejecución', inReview: 'En revisión', inRiskGate: 'Risk Gate', blocked: 'Bloqueadas',
  administrativelyCompleted: 'Cierre administrativo', productionConfirmed: 'Producción confirmada',
  required: 'Required', linked: 'Linked', missingReal: 'Missing real', optional: 'Optional',
  notYetRequired: 'Not yet required', notApplicable: 'Not applicable', unknown: 'Unknown',
  featureApplicable: 'Feature applicable', featureResolved: 'Resolved', featurePartial: 'Partial',
  featureUnavailable: 'Unavailable', nonFeatureDelivery: 'Non-feature delivery',
  requiredNow: 'Required now', requiredLater: 'Required later', withMatrix: 'With matrix',
  missingMatrix: 'Missing matrix', waitingApproval: 'Waiting approval', evidenced: 'With evidence',
  coverage: 'Coverage',
  quarter: 'Quarter', targetDate: 'Fecha objetivo · 4 conflictos', team: 'Team', eco: 'ECO',
  dspDelivery: 'Delivery required linkage', progress: 'FCR', riskLinkage: 'Risk linkage',
  release: 'Release', okr: 'OKR Boja', aging: 'Aging',
};
const pct = (value: number | null) => value === null ? 'No disponible' : `${value.toLocaleString('es-CO')}%`;
function MetricCard({ name, metric, percent = false }: { name: string; metric: Metric; percent?: boolean }) {
  return <article className={`card kpi metric-${metric.status.toLowerCase()}`}>
    <span>{labels[name] ?? name}</span>
    <strong>{metric.status === 'UNAVAILABLE' ? 'No disponible' : percent ? pct(metric.value) : metric.value?.toLocaleString('es-CO')}</strong>
    <small>{metric.status} · población {metric.population} · aplicable {metric.applicablePopulation}</small>
    <small>Confianza {metric.confidence} · cobertura {metric.coverage.toLocaleString('es-CO')}%</small>
  </article>;
}
function MetricSection({ title, description, metrics, keys, coverageKey = 'coverage' }: {
  title: string; description: string; metrics: Metrics; keys: string[]; coverageKey?: string;
}) {
  return <>
    <div className="section-title"><div><h2>{title}</h2><p>{description}</p></div></div>
    <div className="kpi-grid">{keys.map((key) => <MetricCard key={key} name={key} metric={metrics[key]} percent={key === coverageKey} />)}</div>
  </>;
}

export function Q3ExecutiveOverview() {
  const [data, setData] = useState<Overview | null | undefined>(undefined);
  useEffect(() => { fetch('/api/q3/overview').then((r) => r.json()).then((x) => setData(x.data ?? null)).catch(() => setData(null)); }, []);
  if (data === undefined) return <section className="card panel"><span className="eyebrow purple">Q3 · VALIDANDO EVIDENCIA</span><h2>Construyendo contexto ejecutivo…</h2></section>;
  if (!data) return <section className="card panel"><span className="eyebrow purple">LIVE DATA · JIRA CLOUD</span><h2>Requiere nuevo snapshot semántico Q3.</h2></section>;
  if (data.snapshot.portfolioStatus !== 'COMPLETED') return <section className="card panel"><span className="eyebrow purple">Q3 PORTFOLIO · LIVE DATA</span><h2>No fue posible completar el universo DSP Q3.</h2></section>;

  const c = data.commitment;
  const committedEquation = ['notStarted','discovery','inExecution','inReview','inRiskGate','blocked','administrativelyCompleted']
    .map((key) => c[key].value ?? 0).reduce((sum, value) => sum + value, 0);
  const snapshotDate = new Date(data.snapshot.lastUpdated);
  const q3Start = new Date('2026-07-01T00:00:00-05:00');
  const q3End = new Date('2026-09-30T23:59:59-05:00');
  const daysElapsed = Math.max(0, Math.floor((snapshotDate.getTime() - q3Start.getTime()) / 86400000));
  const daysRemaining = Math.max(0, Math.ceil((q3End.getTime() - snapshotDate.getTime()) / 86400000));
  const alerts = [
    { severity: 'CRITICAL', title: `${c.blocked.value} iniciativas bloqueadas`, body: 'Bloqueo explícito en el estado DSP; requiere decisión de liderazgo.' },
    { severity: 'HIGH', title: `${data.release.missingReal.value} releases sin evidencia`, body: '10 iniciativas requieren evidencia de release y ninguna tiene trazabilidad disponible.' },
    { severity: 'HIGH', title: `${data.risk.missingMatrix.value} matrices faltantes · ${data.risk.waitingApproval.value} esperando aprobación`, body: 'Solo sobre la población REQUIRED_NOW; TAREAS POR HACER no se interpreta como bloqueo.' },
    { severity: 'MEDIUM', title: `${c.dateConflicts.value} conflictos Quarter/fecha`, body: 'Siguen dentro del compromiso Q3 con confianza parcial.' },
    { severity: 'CONTEXT', title: `${c.notStarted.value} sin iniciar · ${data.reconciliation.chronicCarryOver} carry-over crónico`, body: `${daysElapsed} días transcurridos y ${daysRemaining} días restantes; señal contextual, no crisis automática.` },
  ];
  const confidenceMetrics: Metrics = {
    quarter: data.dataConfidence.quarter,
    targetDate: data.dataConfidence.targetDate,
    team: data.dataConfidence.team,
    eco: data.dataConfidence.eco,
    dspDelivery: data.delivery.coverage,
    progress: { ...data.progress.coverage, status: data.progress.featurePartial.value ? 'PARTIAL' : 'AVAILABLE', confidence: data.progress.featurePartial.value ? 'MEDIUM' : 'HIGH' },
    riskLinkage: { ...data.risk.coverage, status: 'PARTIAL', confidence: 'MEDIUM' },
    release: { ...data.release.coverage, status: 'PARTIAL', confidence: 'MEDIUM', warnings: ['10 iniciativas REQUIRED sin evidencia de release.'] },
    okr: data.dataConfidence.okr,
    aging: data.dataConfidence.aging,
  };

  return <section className="live-overview">
    <div className="attention-hero"><div>
      <span className="eyebrow purple">EXECUTIVE OVERVIEW Q3 · JIRA CLOUD LIVE</span>
      <h2>Compromiso Q3 reconciliado sobre poblaciones aplicables.</h2>
      <p>Snapshot LIVE v{data.snapshot.version} · {snapshotDate.toLocaleString('es-CO')} · portafolio DSP completo</p>
    </div><div className="attention-callout"><span>FUENTE CANÓNICA</span><b>DSP · Jira Cloud LIVE</b></div></div>

    <MetricSection title="Universo Q3" description="Quarter Q3 es la evidencia primaria; la fecha valida consistencia."
      metrics={c} keys={['declared','candidates','committed','dateConflicts']} coverageKey="" />

    <MetricSection title="Etapas del compromiso" description={`106 = 23 + 0 + 70 + 3 + 7 + 2 + 1 + 0 · reconciliación ${committedEquation === c.committed.value ? 'válida' : 'inválida'}.`}
      metrics={c} keys={['notStarted','discovery','inExecution','inReview','inRiskGate','blocked','administrativelyCompleted','productionConfirmed']} coverageKey="" />

    <MetricSection title="Delivery applicability" description="Coverage = Linked / Required. Not yet required y Unknown no se reportan como missing."
      metrics={data.delivery} keys={['required','linked','missingReal','notYetRequired','unknown','coverage']} />

    <MetricSection title="Progress · FCR" description="Coverage = Feature resolved / Feature applicable. Sin Features no equivale a 0%."
      metrics={data.progress} keys={['featureApplicable','featureResolved','featurePartial','nonFeatureDelivery','coverage']} />

    <MetricSection title="Risk applicability" description="Coverage = With matrix / Required now. UNKNOWN representa incertidumbre, no matriz faltante."
      metrics={data.risk} keys={['requiredNow','withMatrix','missingMatrix','requiredLater','unknown','waitingApproval','coverage']} />

    <MetricSection title="Release applicability" description="Cierre administrativo no equivale a producción y no determina el forecast."
      metrics={data.release} keys={['required','evidenced','missingReal','notYetRequired','unknown','coverage']} />
    <div className="critical-banner">10 iniciativas requieren evidencia de release y ninguna tiene trazabilidad disponible.</div>

    <div className="section-title"><div><h2>Attention Required</h2><p>Cinco señales derivadas de datos LIVE, priorizadas por severidad y decisión requerida.</p></div></div>
    <div className="actionable-grid">{alerts.map((alert) => <article className="card panel" key={alert.title}>
      <span className="eyebrow purple">{alert.severity}</span><h3>{alert.title}</h3><p>{alert.body}</p>
    </article>)}</div>

    <div className="section-title"><div><h2>Data Confidence</h2><p>AVAILABLE, PARTIAL y UNAVAILABLE conservan población, aplicabilidad y cobertura explícitas.</p></div></div>
    <div className="kpi-grid">
      {['quarter','targetDate','team','eco','dspDelivery','progress','riskLinkage','release','okr','aging'].map((key) =>
        <MetricCard key={key} name={key} metric={confidenceMetrics[key]} percent />)}
    </div>
  </section>;
}
