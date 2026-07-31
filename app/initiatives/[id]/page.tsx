import { notFound } from 'next/navigation';
import { ActionableInsightCard, ExecutiveCopilot, NarrativeSection, TimelineIntelligence } from '@/components/experience';
import { HealthBadge, PageHeader, Progress, SourceLink } from '@/components/ui';
import { initiatives } from '@/lib/demo-data';
import { generateActionableInsights, generateTimelineDiagnosis } from '@/lib/experience';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initiative = initiatives.find((item) => item.id === id);
  if (!initiative) notFound();
  const diagnosis = generateTimelineDiagnosis(initiative);
  const insights = generateActionableInsights();

  return <>
    <PageHeader eyebrow={`PORTFOLIO / ${initiative.id}`} title={initiative.name} description={initiative.impact} action={<HealthBadge status={initiative.risk} />} />
    <div className="attention-hero"><div><span className="eyebrow purple">SITUACIÓN EJECUTIVA</span><h2>{initiative.confidence < 60 ? 'Esta iniciativa probablemente incumplirá su objetivo actual.' : 'Esta iniciativa permanece dentro de su forecast actual.'}</h2><p>{diagnosis.diagnosis} {diagnosis.outsideDevelopment}% del tiempo transcurrió fuera de Development. La causa probable debe validarse con el owner del gate.</p></div><div className="attention-callout"><span>ACCIÓN RECOMENDADA</span><b>{diagnosis.recommendation}</b></div></div>
    <div className="drawer-page" style={{ marginTop: 14 }}><div>
      <TimelineIntelligence initiative={initiative} diagnosis={diagnosis} />
      <NarrativeSection title="Evidencia detrás del forecast" description="Situación, impacto y acción antes del detalle operativo."><div className="actionable-grid"><ActionableInsightCard insight={insights[0]} compact /><ActionableInsightCard insight={initiative.risk === 'HIGH' || initiative.risk === 'CRITICAL' ? insights[2] : insights[3]} compact /></div></NarrativeSection>
      <NarrativeSection title="Evidencia de ejecución" description="Revelación progresiva del contexto operativo.">{['OKR e impacto esperado','Delivery y capacidad','Dependencias','Riesgos y planes de acción','Release e historial','Decisiones requeridas'].map((title, index) => <details className="card panel" style={{ marginBottom: 9 }} key={title}><summary><b>{title}</b></summary><p className="panel-sub">{index === 0 ? (initiative.okr ?? 'Datos insuficientes · sin trazabilidad OKR') : index === 1 ? `${initiative.team ?? 'Sin equipo asignado'} · ${initiative.capacity} Story Points consumidos` : index === 2 ? `${initiative.dependencies} dependencias abiertas` : index === 3 ? `${initiative.risk} · ${initiative.actionPlan ? 'Plan de acción activo' : 'Sin plan requerido'}` : index === 4 ? `${initiative.release ?? 'Sin Plan Release'} · forecast ${initiative.target}` : initiative.decision}</p></details>)}</NarrativeSection>
      <NarrativeSection title="Pregunta a FlowOS sobre esta iniciativa"><ExecutiveCopilot insights={insights} /></NarrativeSection>
    </div><aside className="card sticky-card"><div className="between"><h3>Resumen ejecutivo</h3><SourceLink href={initiative.sourceUrl} /></div><div className="detail-grid"><div><b>{initiative.progress}%</b>Avance<Progress value={initiative.progress} /></div><div><b>{initiative.confidence}%</b>Confianza</div><div><b>{initiative.eco}</b>ECO</div><div><b>{initiative.owner}</b>Owner</div><div><b>{initiative.team ?? 'Datos insuficientes'}</b>Equipo</div><div><b>{initiative.supplier}</b>Proveedor</div><div><b>{initiative.target}</b>Objetivo</div><div><b>{initiative.nextGate}</b>Siguiente gate</div></div><hr /><span className="eyebrow">PRÓXIMA DECISIÓN</span><p><b>{initiative.decision}</b></p><button className="pill">Marcar en revisión</button><small className="muted" style={{ display: 'block', marginTop: 10 }}>Solo simulación · sin escritura en Jira</small></aside></div>
  </>;
}
