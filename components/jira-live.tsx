'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Q3ExecutiveOverview } from './q3-executive';
type JiraUiData = {
  accountDisplayName?: string;
  accountIdMasked?: string;
  permissions?: string;
  accessibleProjects?: number;
  projects?: unknown[];
  durationMs?: number;
  fields?: Array<{ status: string }>;
  issuesProcessed?: number;
  pagesProcessed?: number;
  truncated?: boolean;
  status?: string;
};
type Envelope = {
  data: JiraUiData | null;
  status: string;
  source: string;
  lastUpdated: string;
  warnings: string[];
  coverage: number;
};
type SnapshotUi = {
  snapshotId: string;
  previousSnapshotId: string | null;
  version: number;
  syncMode: 'FULL' | 'INCREMENTAL';
  correlationId: string;
  status: string;
  checkpoint: string;
  completedAt: string;
  projectsAccessible: string[];
  pagesProcessed: number;
  issuesProcessed: number;
  issuesChanged: number;
  coverage: number;
  truncated: boolean;
  durationMs: number;
  warnings: string[];
  datasets?: {
    portfolio: { status: string; initiativesDetected?: number; itemsProcessed: number; fieldsCoverage?: number; truncated: boolean };
    operational: { status: string; itemsProcessed: number; projects?: string[]; truncated: boolean };
    relationships: { status: string; deliveryParentsFound: number; deliveryParentsResolved: number; featuresFound: number; controlsFound: number; coverage: number; truncated: boolean };
  };
};
type SemanticMetric = {
  value: unknown;
  status: 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
  coverage: number;
  evidence: string[];
};
type SemanticMetrics = {
  snapshotContext: Record<string, SemanticMetric>;
  dataConfidence: Record<string, SemanticMetric>;
  q3Activity: Record<string, SemanticMetric>;
  flowDistribution: Record<string, SemanticMetric>;
  unavailable: Record<string, SemanticMetric>;
};
export type LiveUi = {
  data?: {
    dataMode?: 'DEMO' | 'LIVE';
    available?: boolean;
    semanticAvailable?: boolean;
    legacyDetected?: boolean;
    schemaVersion?: number;
    source?: string;
    lastSync?: string;
    coverage?: number;
    status?: string;
    metrics?: SemanticMetrics;
    dataQuality?: Array<{
      code: string;
      count: number;
      rate: number;
      severity: string;
    }>;
  };
};
const unavailable = 'Dato no disponible';
export function JiraIntegrationPanel() {
  const [result, setResult] = useState<Envelope | null>(null);
  const [busy, setBusy] = useState('');
  const run = async (kind: 'test' | 'discovery' | 'snapshot') => {
    setBusy(kind);
    try {
      const response = await fetch(
        kind === 'snapshot'
          ? '/api/sync/jira/snapshot'
          : `/api/integrations/jira/${kind}`,
        { method: kind === 'snapshot' ? 'POST' : 'GET' },
      );
      setResult(await response.json());
    } catch {
      setResult({
        data: null,
        status: 'ERROR',
        source: 'Jira Cloud',
        lastUpdated: new Date().toISOString(),
        warnings: ['No fue posible completar la operación.'],
        coverage: 0,
      });
    } finally {
      setBusy('');
    }
  };
  const data = result?.data;
  return (
    <section className="card panel jira-live-panel">
      <div className="between">
        <div>
          <span className="eyebrow purple">JIRA SOFTWARE · READ_ONLY</span>
          <h2>Conexión Jira Cloud LIVE</h2>
        </div>
        <span
          className={`integration-status s-${result?.status === 'SUCCESS' ? 'connected' : result?.status === 'PARTIAL' ? 'degraded' : 'ready_to_connect'}`}
        >
          {result?.status ?? 'SIN PROBAR'}
        </span>
      </div>
      <div className="integration-metrics">
        <span>
          <b>{result ? 'Cuenta Jira conectada' : unavailable}</b>Identidad
        </span>
        <span>
          <b>
            {data?.accessibleProjects ?? data?.projects?.length ?? unavailable}
          </b>
          Proyectos accesibles
        </span>
        <span>
          <b>{result ? `${result.coverage}%` : unavailable}</b>Cobertura
        </span>
      </div>
      {data?.accountIdMasked && (
        <p>
          Cuenta: {data.accountIdMasked} · permisos: {data.permissions}
        </p>
      )}
      <p className="muted">
        Última prueba:{' '}
        {result
          ? new Date(result.lastUpdated).toLocaleString('es-CO')
          : unavailable}{' '}
        · Duración:{' '}
        {data?.durationMs != null ? `${data.durationMs} ms` : unavailable}
      </p>
      {result?.warnings?.length ? (
        <div className="critical-banner">{result.warnings.join(' · ')}</div>
      ) : null}
      <div className="sync-actions">
        <button disabled={!!busy} onClick={() => run('test')}>
          {busy === 'test' ? 'Probando…' : 'Probar conexión'}
        </button>
        <button disabled={!!busy} onClick={() => run('discovery')}>
          {busy === 'discovery' ? 'Descubriendo…' : 'Descubrir metadatos'}
        </button>
        <button disabled={!!busy} onClick={() => run('snapshot')}>
          {busy === 'snapshot' ? 'Generando…' : 'Generar snapshot'}
        </button>
      </div>
      {data?.fields && (
        <small>
          {
            data.fields.filter(
              (x: { status: string }) => x.status === 'AVAILABLE',
            ).length
          }{' '}
          custom fields disponibles ·{' '}
          {
            data.fields.filter(
              (x: { status: string }) => x.status !== 'AVAILABLE',
            ).length
          }{' '}
          ausentes/inaccesibles
        </small>
      )}
      {data?.issuesProcessed != null && (
        <small>
          Snapshot {data.status}: {data.issuesProcessed} issues ·{' '}
          {data.pagesProcessed} páginas ·{' '}
          {data.truncated ? 'truncado' : 'completo'}
        </small>
      )}
    </section>
  );
}

export function maskSnapshotId(value: string | null) {
  if (!value) return 'Primera captura';
  return value.length <= 16 ? value : `${value.slice(0, 8)}…${value.slice(-6)}`;
}
export function JiraSyncPanel() {
  const [runs, setRuns] = useState<SnapshotUi[]>([]);
  const [error, setError] = useState('');
  const load = () =>
    fetch('/api/sync/jira/snapshots')
      .then((r) => r.json())
      .then((x: { data?: SnapshotUi[]; warnings?: string[] }) => {
        setRuns(x.data ?? []);
        setError(x.warnings?.[0] ?? '');
      })
      .catch(() => setError('No fue posible consultar snapshots LIVE.'));
  useEffect(() => {
    void load();
  }, []);
  const latest = runs[0];
  const warnings = latest?.warnings ?? [];
  return (
    <>
      <div className="sync-overview">
        <article className="card">
          <span>SNAPSHOT LIVE · VERSIÓN</span>
          <strong>
            {latest ? `v${latest.version} · ${latest.status}` : unavailable}
          </strong>
          <b>
            {latest
              ? new Date(latest.completedAt).toLocaleString('es-CO')
              : error || unavailable}
          </b>
        </article>
        <article className="card">
          <span>MODO / ANTERIOR</span>
          <strong>{latest?.syncMode ?? unavailable}</strong>
          <b>
            {latest ? maskSnapshotId(latest.previousSnapshotId) : unavailable}
          </b>
        </article>
        <article className="card">
          <span>ISSUES / CAMBIOS</span>
          <strong>
            {latest
              ? `${latest.issuesProcessed} / ${latest.issuesChanged}`
              : unavailable}
          </strong>
          <b>
            {latest
              ? `${latest.pagesProcessed} páginas · ${latest.truncated ? 'truncado' : 'completo'}`
              : unavailable}
          </b>
        </article>
        <article className="card">
          <span>COBERTURA / DURACIÓN</span>
          <strong>{latest ? `${latest.coverage}%` : unavailable}</strong>
          <b>{latest ? `${latest.durationMs} ms` : unavailable}</b>
        </article>
      </div>
      {latest?.datasets && (
        <div className="sync-overview">
          <article className="card">
            <span>PORTFOLIO Q3 · {latest.datasets.portfolio.status}</span>
            <strong>{latest.datasets.portfolio.initiativesDetected ?? 0} iniciativas</strong>
            <b>{latest.datasets.portfolio.fieldsCoverage ?? 0}% campos · {latest.datasets.portfolio.truncated ? 'truncado' : 'completo'}</b>
          </article>
          <article className="card">
            <span>OPERACIÓN · {latest.datasets.operational.status}</span>
            <strong>{latest.datasets.operational.itemsProcessed} items</strong>
            <b>{latest.datasets.operational.projects?.join(', ') || unavailable} · {latest.datasets.operational.truncated ? 'truncado' : 'completo'}</b>
          </article>
          <article className="card">
            <span>RELACIONES · {latest.datasets.relationships.status}</span>
            <strong>{latest.datasets.relationships.deliveryParentsResolved} / {latest.datasets.relationships.deliveryParentsFound} Polaris</strong>
            <b>{latest.datasets.relationships.featuresFound} Features · {latest.datasets.relationships.controlsFound} controles</b>
          </article>
          <article className="card">
            <span>COBERTURA RELACIONES</span>
            <strong>{latest.datasets.relationships.coverage}%</strong>
            <b>{latest.datasets.relationships.truncated ? 'Expansión truncada' : 'Expansión completa'}</b>
          </article>
        </div>
      )}
      {latest && (
        <div className="card panel">
          <div className="between">
            <div>
              <span className="eyebrow purple">
                JIRA CLOUD · {latest.status}
              </span>
              <h2>
                {latest.projectsAccessible.length} proyectos ·{' '}
                {latest.projectsAccessible.join(', ')}
              </h2>
            </div>
            <span className="pill">
              Checkpoint {new Date(latest.checkpoint).toLocaleString('es-CO')}
            </span>
          </div>
          {latest.status === 'PARTIAL' && (
            <p className="muted">
              Snapshot utilizable con cobertura parcial: algunas consultas de
              metadatos no estuvieron disponibles.
            </p>
          )}
          {warnings.length > 0 && (
            <details className="critical-banner">
              <summary>{warnings.length} advertencias de acceso</summary>
              <ul>
                {warnings.slice(0, 5).map((warning, index) => (
                  <li key={`${warning}-${index}`}>{warning}</li>
                ))}
              </ul>
              {warnings.length > 5 && (
                <small>
                  + {warnings.length - 5} advertencias adicionales agrupadas.
                </small>
              )}
            </details>
          )}
        </div>
      )}
      {runs.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>VERSIÓN</th>
                <th>MODO</th>
                <th>ESTADO</th>
                <th>PROYECTOS</th>
                <th>PÁGINAS</th>
                <th>ISSUES</th>
                <th>CAMBIOS</th>
                <th>COBERTURA</th>
                <th>TRUNCADO</th>
                <th>DURACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.snapshotId}>
                  <td>
                    <strong>v{run.version}</strong>
                    <span className="muted">
                      {maskSnapshotId(run.snapshotId)}
                    </span>
                  </td>
                  <td>{run.syncMode}</td>
                  <td>{run.status}</td>
                  <td>{run.projectsAccessible.join(', ')}</td>
                  <td>{run.pagesProcessed}</td>
                  <td>{run.issuesProcessed}</td>
                  <td>{run.issuesChanged}</td>
                  <td>{run.coverage}%</td>
                  <td>{run.truncated ? 'Sí' : 'No'}</td>
                  <td>{run.durationMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function LiveExecutiveEmptyState() {
  return (
    <section className="card panel live-overview">
      <span className="eyebrow purple">LIVE DATA · JIRA CLOUD</span>
      <h2>
        Jira está configurado en modo LIVE, pero aún no existe un snapshot
        válido.
      </h2>
      <p className="muted">
        Genera el primer snapshot para habilitar métricas ejecutivas sustentadas
        por Jira Cloud.
      </p>
      <div className="sync-actions">
        <Link className="pill" href="/admin/integrations">
          Ir a Integration Hub
        </Link>
        <Link className="pill" href="/admin/sync">
          Ir al Centro de sincronización
        </Link>
      </div>
    </section>
  );
}
export function LiveExecutiveLegacyState() {
  return (
    <section className="card panel live-overview">
      <span className="eyebrow purple">LIVE DATA · JIRA CLOUD</span>
      <h2>Snapshot legacy detectado</h2>
      <p className="muted">Requiere nuevo snapshot semántico.</p>
      <div className="sync-actions">
        <Link className="pill" href="/admin/integrations">
          Ir a Integration Hub
        </Link>
        <Link className="pill" href="/admin/sync">
          Ir al Centro de sincronización
        </Link>
      </div>
    </section>
  );
}
export function LiveExecutiveOverview({ live }: { live: LiveUi }) {
  if (!live.data?.available) return <LiveExecutiveEmptyState />;
  if (!live.data.semanticAvailable || !live.data.metrics)
    return <LiveExecutiveLegacyState />;
  return <Q3ExecutiveOverview />;
}
