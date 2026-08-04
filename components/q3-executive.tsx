'use client';
import { useEffect, useState } from 'react';
type Metric = {
  value: unknown;
  status: 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
  coverage: number;
};
type Risk = {
  type: string;
  severity: string;
  affectedInitiativeCount: number;
  businessImpact: string;
  suggestedAction: string;
  requiresExecutiveDecision: string;
};
type Overview = {
  snapshot: {
    version: number;
    lastUpdated: string;
    truncated: boolean;
    portfolioStatus?: 'COMPLETED' | 'PARTIAL' | 'UNAVAILABLE';
  };
  pulse: Record<string, Metric>;
  flow: Array<{
    stage: string;
    initiatives: number;
    percentage: number;
    coverage: number;
    attention: boolean;
  }>;
  attention: Risk[];
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
    confidence: string;
  }>;
  portfolioMix: Array<{ type: string; count: number; percentage: number }>;
  businessImpact: { status: string; message: string };
  dataConfidence: Record<string, Metric>;
};
const labels: Record<string, string> = {
  commitment: 'Compromiso vigente',
  candidates: 'Candidatas / despriorizadas',
  delivered: 'Entregadas',
  administrativeClosures: 'Cierres administrativos',
  noGoCancelled: 'No-Go / canceladas',
  executing: 'En ejecución',
  notStarted: 'Sin iniciar',
  blocked: 'Bloqueadas',
  carryOver: 'Carry-over',
  progress: 'Avance FCR',
};
const shown = (metric: Metric) =>
  metric.status === 'UNAVAILABLE'
    ? 'No disponible'
    : String(metric.value ?? 'No disponible');
export function Q3ExecutiveOverview() {
  const [data, setData] = useState<Overview | null | undefined>(undefined);
  useEffect(() => {
    fetch('/api/q3/overview')
      .then((r) => r.json())
      .then((x) => setData(x.data ?? null))
      .catch(() => setData(null));
  }, []);
  if (data === undefined)
    return (
      <section className="card panel">
        <span className="eyebrow purple">Q3 · VALIDANDO EVIDENCIA</span>
        <h2>Construyendo contexto ejecutivo…</h2>
      </section>
    );
  if (!data)
    return (
      <section className="card panel">
        <span className="eyebrow purple">LIVE DATA · JIRA CLOUD</span>
        <h2>Requiere nuevo snapshot semántico Q3.</h2>
        <p className="muted">
          El snapshot disponible no contiene todavía la evidencia canónica de
          Quarters y relaciones Polaris.
        </p>
      </section>
    );
  if (data.snapshot.portfolioStatus !== 'COMPLETED')
    return (
      <section className="card panel">
        <span className="eyebrow purple">Q3 PORTFOLIO · LIVE DATA</span>
        <h2>No fue posible completar el universo DSP Q3.</h2>
        <p className="muted">
          Revisa la consulta canónica, campos requeridos y expansión de
          relaciones en el Centro de sincronización.
        </p>
      </section>
    );
  return (
    <section className="live-overview">
      <div className="attention-hero">
        <div>
          <span className="eyebrow purple">Q3 PULSE · LIVE DATA</span>
          <h2>Compromiso y flujo a valor sustentados por DSP y delivery.</h2>
          <p>
            Snapshot v{data.snapshot.version} ·{' '}
            {new Date(data.snapshot.lastUpdated).toLocaleString('es-CO')} ·{' '}
            {data.snapshot.truncated
              ? 'Población truncada'
              : 'Población capturada sin truncamiento'}
          </p>
        </div>
        <div className="attention-callout">
          <span>FUENTE CANÓNICA</span>
          <b>DSP · Jira Cloud · FlowOS</b>
        </div>
      </div>
      <div className="kpi-grid">
        {Object.entries(data.pulse).map(([key, value]) => (
          <article className="card kpi" key={key}>
            <span>{labels[key] ?? key}</span>
            <strong>
              {shown(value)}
              {key === 'progress' && value.status !== 'UNAVAILABLE' ? '%' : ''}
            </strong>
            <small>
              {value.status} · cobertura {value.coverage}%
            </small>
          </article>
        ))}
      </div>
      <div className="section-title">
        <div>
          <h2>Flow to Value</h2>
          <p>
            Distribución de iniciativas comprometidas por estado consolidado.
          </p>
        </div>
      </div>
      <div className="kpi-grid">
        {data.flow.map((item) => (
          <article className="card kpi" key={item.stage}>
            <span>{item.stage}</span>
            <strong>{item.initiatives}</strong>
            <small>
              {item.percentage}% · cobertura {item.coverage}%
              {item.attention ? ' · requiere atención' : ''}
            </small>
          </article>
        ))}
      </div>
      <div className="section-title">
        <div>
          <h2>Attention Required</h2>
          <p>
            Máximo cinco señales priorizadas por severidad, sin nombres
            personales.
          </p>
        </div>
      </div>
      {data.attention.length ? (
        <div className="actionable-grid">
          {data.attention.map((alert) => (
            <article className="card panel" key={alert.type}>
              <span className="eyebrow purple">
                {alert.severity} · {alert.type}
              </span>
              <h3>{alert.affectedInitiativeCount} iniciativas afectadas</h3>
              <p>{alert.businessImpact}</p>
              <p className="muted">Acción: {alert.suggestedAction}</p>
              <span className="pill">
                Decide: {alert.requiresExecutiveDecision}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <section className="card panel">
          <h3>Sin señales ejecutivas con evidencia suficiente.</h3>
        </section>
      )}
      <div className="section-title">
        <div>
          <h2>ECO Health</h2>
          <p>Compromiso, avance FCR y señales calculadas por ECO.</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ECO</th>
              <th>COMPROMETIDAS</th>
              <th>EJECUCIÓN</th>
              <th>SIN INICIAR</th>
              <th>ENTREGADAS</th>
              <th>BLOQUEADAS</th>
              <th>CARRY-OVER</th>
              <th>FCR</th>
              <th>RIESGOS</th>
              <th>CONFIANZA</th>
            </tr>
          </thead>
          <tbody>
            {data.ecoHealth.map((eco) => (
              <tr key={eco.eco}>
                <td>
                  <strong>{eco.eco}</strong>
                </td>
                <td>{eco.committed}</td>
                <td>{eco.executing}</td>
                <td>{eco.notStarted}</td>
                <td>{eco.delivered}</td>
                <td>{eco.blocked}</td>
                <td>{eco.carryOver}</td>
                <td>
                  {eco.progress === null ? 'No disponible' : `${eco.progress}%`}
                </td>
                <td>{eco.risks}</td>
                <td>{eco.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section-title">
        <div>
          <h2>Portfolio Mix</h2>
          <p>Exclusivamente iniciativas canónicas DSP.</p>
        </div>
      </div>
      <div className="kpi-grid">
        {data.portfolioMix.map((item) => (
          <article className="card kpi" key={item.type}>
            <span>{item.type}</span>
            <strong>{item.count}</strong>
            <small>{item.percentage}% del compromiso vigente</small>
          </article>
        ))}
      </div>
      <details className="card panel">
        <summary>Business Impact · {data.businessImpact.status}</summary>
        <p>{data.businessImpact.message}</p>
        <p className="muted">
          Acción organizacional: completar referencias verificables en Boja/Jira
          sin usar Atlas Goals.
        </p>
      </details>
      <div className="section-title">
        <div>
          <h2>Data Confidence</h2>
          <p>Cobertura real por dimensión de evidencia.</p>
        </div>
      </div>
      <div className="kpi-grid">
        {Object.entries(data.dataConfidence).map(([key, value]) => (
          <article className="card kpi" key={key}>
            <span>{key}</span>
            <strong>
              {shown(value)}
              {typeof value.value === 'number' ? '%' : ''}
            </strong>
            <small>
              {value.status} · cobertura {value.coverage}%
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}
