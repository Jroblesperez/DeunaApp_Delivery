'use client';
import { useEffect, useMemo, useState } from 'react';

type Status = 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
type Metric = {
  value: number | null;
  status: Status;
  coverage: number;
  evidence: string[];
};
type Metrics = Record<string, Metric>;
type ForecastStatus = 'ON_TRACK' | 'WATCH' | 'AT_RISK' | 'NO_EVIDENCE';
type Forecast = {
  displayName: string;
  reference: string;
  eco: string | null;
  initiativeType: string;
  currentStage: string;
  stage: string;
  featureProgress: {
    completed: number | null;
    applicable: number | null;
    percentage: number | null;
    status: 'SIN_INICIAR' | 'EN_CURSO' | 'COMPLETADO' | 'SIN_EVIDENCIA';
  };
  productionReadiness: {
    status: 'READY' | 'PARTIAL' | 'NOT_READY' | 'NO_EVIDENCE';
    reason: string;
  };
  gateReadiness: { label: string; detail: string };
  targetDate: string | null;
  forecastStatus: ForecastStatus;
  forecastReason: string;
  nextGate: string;
  recommendedAction: string;
  confidence: string;
  blocked: boolean;
};
type Risk = {
  type: string;
  severity: string;
  affectedInitiativeCount: number;
  businessImpact: string;
  suggestedAction: string;
  requiresExecutiveDecision: string;
};
type Eco = {
  eco: string;
  committed: number;
  progress: number | null;
  risks: number;
  blocked: number;
};
type Overview = {
  viewer: { greeting: string };
  snapshot: { version: number; lastUpdated: string; portfolioStatus?: string };
  commitment: Metrics;
  progress: Metrics;
  risk: Metrics;
  release: Metrics;
  dataConfidence: Metrics;
  reconciliation: Record<string, number>;
  attention: Risk[];
  ecoHealth: Eco[];
  portfolioMix: Array<{ type: string; count: number; percentage: number }>;
  flow: Array<{ stage: string; initiatives: number; percentage: number }>;
  forecast: Forecast[];
};

const value = (metric?: Metric) => metric?.value ?? 0;
const pct = (number: number) =>
  `${number.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%`;
const typeLabel: Record<string, string> = {
  STRATEGIC: 'Estratégicas',
  IMPROVEMENT: 'Mejoras',
  OPERATIONAL: 'Operativas',
  TECH_DEBT: 'Deuda técnica',
};
const forecastLabel: Record<ForecastStatus, string> = {
  ON_TRACK: 'En trayectoria',
  WATCH: 'Bajo observación',
  AT_RISK: 'En riesgo',
  NO_EVIDENCE: 'Sin evidencia',
};
const executionLabel: Record<Forecast['featureProgress']['status'], string> = {
  SIN_INICIAR: 'Sin iniciar',
  EN_CURSO: 'En curso',
  COMPLETADO: 'Completado',
  SIN_EVIDENCIA: 'Sin evidencia',
};
const confidenceLabel: Record<string, string> = {
  HIGH: 'Confianza alta',
  MEDIUM: 'Confianza media',
  LOW: 'Confianza baja',
  NONE: 'Sin confianza resoluble',
};
const qualityObservation: Record<string, string> = {
  quarter: 'Quarter del PI Planning',
  targetDate: 'Fecha objetivo registrada',
  team: 'Equipo responsable resuelto',
  eco: 'ECO organizacional resuelto',
  delivery: 'Vínculo con Delivery resoluble',
  progress: 'Features vinculadas y estados resueltos',
  risk: 'Trazabilidad del Risk Gate',
  release: 'Trazabilidad de Release',
  okr: 'Referencia de alineación con Boja',
  aging: 'Fecha de última actividad disponible',
};

function PortfolioMix({ items }: { items: Overview['portfolioMix'] }) {
  const gradient = items
    .map((item, index) => {
      const start = items
        .slice(0, index)
        .reduce((sum, x) => sum + x.percentage, 0);
      return `var(--q3-mix-${index + 1}) ${start}% ${start + item.percentage}%`;
    })
    .join(',');
  return (
    <article className="q3-kpi q3-mix-kpi" data-testid="portfolio-mix-top">
      <div>
        <span>Portfolio Mix</span>
        <strong>{items.reduce((sum, x) => sum + x.count, 0)}</strong>
        <small>iniciativas DSP</small>
      </div>
      <div
        className="mix-donut"
        style={{ background: `conic-gradient(${gradient})` }}
        aria-label="Distribución del portafolio"
      />
      <ul>
        {items.map((item, index) => (
          <li key={item.type}>
            <i className={`mix-${index + 1}`} />
            <span>{typeLabel[item.type]}</span>
            <b>
              {item.count} · {pct(item.percentage)}
            </b>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function Q3ExecutiveOverview() {
  const [data, setData] = useState<Overview | null | undefined>(undefined);
  const [filter, setFilter] = useState('En riesgo');
  const [selected, setSelected] = useState<string | null>(null);
  const [eco, setEco] = useState('Todos los ECOs');
  useEffect(() => {
    fetch('/api/q3/overview', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((x) => setData(x.data ?? null))
      .catch(() => setData(null));
  }, []);
  const visibleForecast = useMemo(() => {
    if (!data) return [];
    const scoped =
      eco === 'Todos los ECOs'
        ? data.forecast
        : data.forecast.filter((x) => x.eco === eco);
    if (filter === 'En riesgo')
      return scoped.filter((x) => x.forecastStatus === 'AT_RISK').slice(0, 10);
    if (filter === 'Bloqueadas')
      return scoped.filter((x) => x.blocked).slice(0, 10);
    if (filter === 'Sin iniciar')
      return scoped
        .filter((x) => x.featureProgress.status === 'SIN_INICIAR')
        .slice(0, 10);
    if (filter === 'Próximas')
      return scoped
        .filter(
          (x) => x.targetDate && x.productionReadiness.status !== 'NO_EVIDENCE',
        )
        .sort((a, b) =>
          String(a.targetDate).localeCompare(String(b.targetDate)),
        )
        .slice(0, 5);
    const risks = scoped
      .filter((x) => x.forecastStatus === 'AT_RISK')
      .slice(0, 5);
    const nearest = scoped
      .filter((x) => x.targetDate && !risks.includes(x))
      .sort((a, b) => String(a.targetDate).localeCompare(String(b.targetDate)))
      .slice(0, 5);
    return [...risks, ...nearest];
  }, [data, filter, eco]);
  if (data === undefined)
    return (
      <section className="q3-executive card panel">
        <p>Cargando contexto ejecutivo LIVE…</p>
      </section>
    );
  if (!data || data.snapshot.portfolioStatus !== 'COMPLETED')
    return (
      <section className="q3-executive card panel">
        <h2>Sin evidencia suficiente</h2>
        <p>Se requiere un snapshot LIVE completo del portafolio DSP Q3.</p>
      </section>
    );
  const c = data.commitment;
  const committed = value(c.committed);
  const snapshotDate = new Date(data.snapshot.lastUpdated);
  const releaseSufficient =
    data.release.coverage.status !== 'UNAVAILABLE' &&
    value(data.release.evidenced) > 0 &&
    data.release.coverage.coverage >= 50;
  const risks = data.forecast.filter((x) => x.forecastStatus === 'AT_RISK');
  const progress =
    data.progress.coverage.status === 'UNAVAILABLE'
      ? null
      : data.progress.coverage.value;
  const health: ForecastStatus =
    progress === null ? 'NO_EVIDENCE' : risks.length ? 'AT_RISK' : 'WATCH';
  const flowKey: Record<string, string> = {
    'Sin iniciar': 'flow-planning',
    Ejecución: 'flow-building',
    'Risk Gate': 'flow-risk',
    Aprobación: 'flow-review',
    Release: 'flow-release',
    Producción: 'flow-production-segment',
  };
  const stages = [
    'Sin iniciar',
    'Ejecución',
    'Risk Gate',
    'Aprobación',
    'Release',
    'Producción',
  ].map((label) => {
    const found = (data.flow ?? []).find((x) => x.stage === label);
    return [label, found?.initiatives ?? 0, flowKey[label]] as const;
  });
  const bottleneck = stages.reduce(
    (max, item) => (item[1] > max[1] ? item : max),
    stages[0],
  );
  const ecoNames = [
    ...new Set(data.ecoHealth.map((x) => x.eco).filter((x) => x !== 'UNKNOWN')),
  ];
  const quality = [
    ['Quarter', data.dataConfidence.quarter, 'quarter'],
    ['Fecha objetivo', data.dataConfidence.targetDate, 'targetDate'],
    ['Team', data.dataConfidence.team, 'team'],
    ['ECO', data.dataConfidence.eco, 'eco'],
    ['DSP Delivery', data.dataConfidence.dspDelivery, 'delivery'],
    ['FCR', data.dataConfidence.progress, 'progress'],
    ['Risk linkage', data.dataConfidence.riskLinkage, 'risk'],
    ['Release', data.dataConfidence.release, 'release'],
    ['OKR Boja', data.dataConfidence.okr, 'okr'],
    ['Aging', data.dataConfidence.aging, 'aging'],
  ] as const;
  return (
    <section className="q3-executive">
      <header className="q3-header-v2">
        <div>
          <span className="q3-kicker">
            {data.viewer?.greeting ?? 'Sesión ejecutiva'}
          </span>
          <h1>Resumen Ejecutivo Q3 2026</h1>
          <p>Compromiso, flujo hacia producción y decisiones prioritarias.</p>
        </div>
        <div className="q3-header-controls">
          <label>
            Periodo
            <select aria-label="Periodo">
              <option>Q3 2026</option>
            </select>
          </label>
          <label>
            ECO
            <select
              aria-label="ECO"
              value={eco}
              onChange={(event) => setEco(event.target.value)}
            >
              <option>Todos los ECOs</option>
              {ecoNames.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <div>
            <span>Actualizado</span>
            <b>{snapshotDate.toLocaleString('es-CO')}</b>
            <small>Jira Cloud LIVE · v{data.snapshot.version}</small>
          </div>
        </div>
      </header>

      <div className="q3-kpis q3-kpis-v2">
        <article className="q3-kpi">
          <span>Salud del compromiso</span>
          <strong className={`signal ${health.toLowerCase()}`}>
            {forecastLabel[health]}
          </strong>
          <p>{risks.length} iniciativas requieren intervención.</p>
          <small>{committed} compromisos Q3 vigentes</small>
        </article>
        <article className="q3-kpi">
          <span>Actividad del portafolio</span>
          <strong>
            {value(c.inExecution)} <small>activas / en ejecución</small>
          </strong>
          <p>
            Avance técnico medido aparte:{' '}
            {progress === null
              ? 'sin cobertura suficiente'
              : `${pct(progress)} de cobertura FCR`}
            .
          </p>
          <small>
            Readiness se determina por Risk Gate, Release y Producción.
          </small>
        </article>
        <article className="q3-kpi">
          <span>Iniciativas en riesgo</span>
          <strong className="risk-number">{risks.length}</strong>
          <p>
            {value(c.blocked)} bloqueadas · {value(data.risk.missingMatrix)} sin
            matriz
          </p>
          <small>Riesgo combina ejecución y readiness.</small>
        </article>
        <PortfolioMix items={data.portfolioMix} />
      </div>

      {!releaseSufficient && (
        <div className="q3-info-strip">
          <b>Proyección de salida no disponible.</b>
          <span>
            La cobertura actual de Release no permite identificar próximas a
            producción.
          </span>
        </div>
      )}

      <div className="q3-operating-grid">
        <section className="q3-block eco-health-v2">
          <div className="q3-title">
            <div>
              <span>Salud organizacional</span>
              <h2>ECO Health</h2>
            </div>
          </div>
          <div className="eco-compact">
            <div className="eco-compact-head">
              <span>ECO</span>
              <span>Compromiso</span>
              <span>Avance</span>
              <span>Riesgo</span>
              <span>Estado</span>
            </div>
            {data.ecoHealth.slice(0, 7).map((item) => (
              <div className="eco-compact-row" key={item.eco}>
                <b>{item.eco === 'UNKNOWN' ? 'Sin ECO resoluble' : item.eco}</b>
                <span>{item.committed}</span>
                <div>
                  {item.progress === null ? (
                    <small>Sin evidencia</small>
                  ) : (
                    <>
                      <i>
                        <em style={{ width: `${item.progress}%` }} />
                      </i>
                      <small>{pct(item.progress)}</small>
                    </>
                  )}
                </div>
                <span>{item.risks || '—'}</span>
                <span
                  className={`eco-dot ${item.blocked ? 'critical' : item.risks ? 'watch' : 'healthy'}`}
                >
                  <i />
                  {item.blocked
                    ? 'En riesgo'
                    : item.risks
                      ? 'Atención'
                      : 'Estable'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="q3-block flow-production">
          <div className="q3-title">
            <div>
              <span>Flujo de valor</span>
              <h2>Flow to Production</h2>
            </div>
            <b>{value(c.blocked)} bloqueadas</b>
          </div>
          <div
            className="flow-chart"
            aria-label="Flujo segmentado hacia producción"
          >
            <div className="flow-track">
              {stages.map(([label, count, key]) => (
                <i
                  className={`${key} ${label === bottleneck[0] ? 'bottleneck' : ''}`}
                  key={key}
                  style={{
                    width: `${committed ? (count / committed) * 100 : 0}%`,
                  }}
                  title={`${label}: ${count}`}
                />
              ))}
            </div>
            <div className="flow-labels">
              {stages.map(([label, count, key]) => (
                <div key={key}>
                  <i className={key} />
                  <b>{count}</b>
                  <span>{label}</span>
                  <small>
                    {pct(committed ? (count / committed) * 100 : 0)}
                  </small>
                </div>
              ))}
            </div>
          </div>
          {bottleneck[0] === 'En ejecución' && !releaseSufficient && (
            <p className="flow-insight">
              Actualmente el mayor volumen se concentra en ejecución; la
              trazabilidad de Release limita la proyección de salida.
            </p>
          )}
          <details className="method">
            <summary>Metodología</summary>
            <p>
              Etapas reconciliadas según las reglas Q3 vigentes. Las bloqueadas
              son una señal transversal.
            </p>
          </details>
        </section>

        <aside className="q3-block attention-side">
          <div className="q3-title">
            <div>
              <span>Decisión ejecutiva</span>
              <h2>Atención requerida</h2>
            </div>
          </div>
          {data.attention.slice(0, 4).map((alert, index) => (
            <article
              key={`${alert.type}-${index}`}
              className={`attention-compact ${alert.severity.toLowerCase()}`}
            >
              <div>
                <span>
                  {alert.severity === 'CRITICAL'
                    ? 'Crítica'
                    : alert.severity === 'HIGH'
                      ? 'Alta'
                      : 'Atención'}
                </span>
                <b>{alert.affectedInitiativeCount} iniciativas</b>
              </div>
              <h3>{alert.businessImpact}</h3>
              <p>
                <b>Acción:</b> {alert.suggestedAction}
              </p>
              <small>Decide: {alert.requiresExecutiveDecision}</small>
              <button onClick={() => setFilter('En riesgo')}>
                Ver detalle →
              </button>
            </article>
          ))}
        </aside>
      </div>

      <section className="q3-block forecast-focus">
        <div className="q3-title">
          <div>
            <span>Drill-down principal</span>
            <h2>Forecast de iniciativas</h2>
            <p>
              Desarrollo, Risk Gate, Release y Producción se evalúan por
              separado.
            </p>
          </div>
          <small>Top de riesgo y proximidad con evidencia</small>
        </div>
        <div className="forecast-filters">
          {[
            'En riesgo',
            'Bloqueadas',
            'Sin iniciar',
            'Todas',
            ...(releaseSufficient ? ['Próximas'] : []),
          ].map((name) => (
            <button
              className={filter === name ? 'active' : ''}
              onClick={() => setFilter(name)}
              key={name}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="table-wrap forecast-responsive">
          <table className="forecast-table">
            <thead>
              <tr>
                <th>Iniciativa</th>
                <th>Etapa actual</th>
                <th>Desarrollo</th>
                <th>Gate / readiness</th>
                <th>Fecha objetivo</th>
                <th>Señal</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {visibleForecast.map((item) => (
                <tr
                  key={item.reference}
                  tabIndex={0}
                  aria-selected={selected === item.reference}
                  onClick={() => setSelected(item.reference)}
                  className={`${selected === item.reference ? 'selected ' : ''}${item.forecastStatus === 'AT_RISK' ? 'critical' : ''}`}
                >
                  <td data-label="Iniciativa">
                    <strong>{item.displayName}</strong>
                    <small>
                      {item.reference} · {item.eco ?? 'ECO sin evidencia'}
                    </small>
                  </td>
                  <td data-label="Etapa actual">
                    <b>{item.currentStage}</b>
                    {item.blocked && <small>Bloqueo activo</small>}
                  </td>
                  <td data-label="Desarrollo">
                    <span
                      className={`execution ${item.featureProgress.status.toLowerCase()}`}
                    >
                      {executionLabel[item.featureProgress.status]}
                    </span>
                    <b>
                      {item.featureProgress.percentage === null
                        ? 'Sin evidencia'
                        : pct(item.featureProgress.percentage)}
                    </b>
                    {item.featureProgress.applicable !== null && (
                      <small>
                        {item.featureProgress.completed}/
                        {item.featureProgress.applicable} Features
                      </small>
                    )}
                  </td>
                  <td data-label="Gate / readiness">
                    <b>{item.gateReadiness?.label ?? item.nextGate}</b>
                    <small>{item.gateReadiness?.detail ?? item.productionReadiness.reason}</small>
                  </td>
                  <td data-label="Fecha objetivo">
                    {item.targetDate
                      ? new Date(item.targetDate).toLocaleDateString('es-CO')
                      : 'Sin evidencia'}
                  </td>
                  <td data-label="Señal">
                    <span
                      className={`forecast-status ${item.forecastStatus.toLowerCase()}`}
                      title={confidenceLabel[item.confidence]}
                    >
                      {item.blocked
                        ? 'Bloqueada'
                        : forecastLabel[item.forecastStatus]}
                    </span>
                    <small>{item.forecastReason}</small>
                  </td>
                  <td data-label="Acción">
                    <b>{item.recommendedAction}</b>
                  </td>
                </tr>
              ))}
              {!visibleForecast.length && (
                <tr>
                  <td colSpan={7}>
                    No hay iniciativas para este filtro con el scope actual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <details id="calidad-datos" className="q3-block data-confidence">
        <summary>
          <span>
            <b>Calidad y confianza de los datos</b>
            <small>Detalle ejecutivo de cobertura LIVE</small>
          </span>
          <i>Mostrar detalle</i>
        </summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Dimensión</th>
                <th>Estado</th>
                <th>Cobertura</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {quality.map(([label, metric, key]) => (
                <tr key={label}>
                  <td>
                    <strong>{label}</strong>
                  </td>
                  <td>
                    {metric?.status === 'AVAILABLE'
                      ? 'Confiable'
                      : metric?.status === 'PARTIAL'
                        ? 'Parcial'
                        : 'Sin evidencia'}
                  </td>
                  <td>{pct(metric?.coverage ?? 0)}</td>
                  <td>{qualityObservation[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
