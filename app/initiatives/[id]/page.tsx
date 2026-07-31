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
    <div className="attention-hero"><div><span className="eyebrow purple">EXECUTIVE SITUATION</span><h2>{initiative.confidence < 60 ? 'This initiative is likely to miss its current target.' : 'This initiative remains within its current forecast range.'}</h2><p>{diagnosis.diagnosis} {diagnosis.outsideDevelopment}% of elapsed time occurred outside development. The likely driver should be validated with the gate owner.</p></div><div className="attention-callout"><span>RECOMMENDED ACTION</span><b>{diagnosis.recommendation}</b></div></div>
    <div className="drawer-page" style={{ marginTop: 14 }}><div>
      <TimelineIntelligence initiative={initiative} diagnosis={diagnosis} />
      <NarrativeSection title="Evidence behind the forecast" description="Situation, impact and next action before operational detail."><div className="actionable-grid"><ActionableInsightCard insight={insights[0]} compact /><ActionableInsightCard insight={initiative.risk === 'HIGH' || initiative.risk === 'CRITICAL' ? insights[2] : insights[3]} compact /></div></NarrativeSection>
      <NarrativeSection title="Execution evidence" description="Progressive disclosure of operational context.">{['OKR and expected impact','Delivery and capacity','Dependencies','Risks and action plans','Release and history','Decisions required'].map((title, index) => <details className="card panel" style={{ marginBottom: 9 }} key={title}><summary><b>{title}</b></summary><p className="panel-sub">{index === 0 ? (initiative.okr ?? 'Insufficient data · no OKR traceability') : index === 1 ? `${initiative.team ?? 'No team assigned'} · ${initiative.capacity} Story Points consumed` : index === 2 ? `${initiative.dependencies} open dependencies` : index === 3 ? `${initiative.risk} · ${initiative.actionPlan ? 'Active action plan' : 'No action plan required'}` : index === 4 ? `${initiative.release ?? 'No Plan Release'} · forecast ${initiative.target}` : initiative.decision}</p></details>)}</NarrativeSection>
      <NarrativeSection title="Ask FlowOS about this initiative"><ExecutiveCopilot insights={insights} /></NarrativeSection>
    </div><aside className="card sticky-card"><div className="between"><h3>Executive summary</h3><SourceLink href={initiative.sourceUrl} /></div><div className="detail-grid"><div><b>{initiative.progress}%</b>Progress<Progress value={initiative.progress} /></div><div><b>{initiative.confidence}%</b>Confidence</div><div><b>{initiative.eco}</b>ECO</div><div><b>{initiative.owner}</b>Owner</div><div><b>{initiative.team ?? 'Insufficient data'}</b>Team</div><div><b>{initiative.supplier}</b>Supplier</div><div><b>{initiative.target}</b>Target</div><div><b>{initiative.nextGate}</b>Next gate</div></div><hr /><span className="eyebrow">NEXT DECISION</span><p><b>{initiative.decision}</b></p><button className="pill">Mark under review</button><small className="muted" style={{ display: 'block', marginTop: 10 }}>Simulation only · no Jira write-back</small></aside></div>
  </>;
}
