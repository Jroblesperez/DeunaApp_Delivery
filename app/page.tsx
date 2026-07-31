import Link from 'next/link';
import {
  ActionableInsightCard,
  ExecutiveCopilot,
  ExecutiveGreeting,
  ExecutiveNarrative,
  MetricExplanationDrawer,
  NarrativeSection,
  OrganizationalPulseCard,
  StrategicMovementCard,
} from '@/components/experience';
import {
  generateActionableInsights,
  generateDecisions,
  generateExecutiveNarrative,
  generateOrganizationalPulse,
  generateStrategicMovements,
} from '@/lib/experience';

export default function Home() {
  const insights = generateActionableInsights();
  const decisions = generateDecisions();
  const narrative = generateExecutiveNarrative();
  const pulse = generateOrganizationalPulse();
  const movements = generateStrategicMovements();

  return <>
    <ExecutiveGreeting />
    <ExecutiveNarrative narrative={narrative} insights={insights} />

    <NarrativeSection eyebrow="DECISIONS BEFORE DASHBOARDS" title="Decisions that cannot wait" description="Ordered by impact, urgency, due date and recommendation confidence." action={<Link className="pill" href="/decisions">Open Decision Center →</Link>}>
      <div className="actionable-grid">{insights.slice(0, 2).map((insight) => <ActionableInsightCard insight={insight} key={insight.id} />)}</div>
      <div className="brief-signals">{decisions.slice(0, 4).map((decision) => <span key={decision.id}><b>{decision.priority}</b> · {decision.owner} · due {decision.dueDate}</span>)}</div>
    </NarrativeSection>

    <NarrativeSection eyebrow="ORGANIZATIONAL PULSE" title="Where leadership support is needed" description="A narrative health view across ECOs and CoEs — not another scorecard." action={<Link className="pill" href="/pulse">Explore organizational pulse →</Link>}>
      <div className="pulse-grid">{pulse.slice(0, 3).map((item) => <OrganizationalPulseCard pulse={item} key={item.id} />)}</div>
    </NarrativeSection>

    <NarrativeSection eyebrow="STRATEGIC MOVEMENT" title="What changed — and why it matters" description="Threshold crossings, investment shifts and movement through the value stream." action={<Link className="pill" href="/intelligence#movement">View all movement →</Link>}>
      <div className="movement-grid">{movements.map((movement) => <StrategicMovementCard movement={movement} key={movement.id} />)}</div>
    </NarrativeSection>

    <NarrativeSection eyebrow="PORTFOLIO ATTENTION" title="Signals behind the quarter" description="Each signal includes evidence, impact and a recommended next step." action={<Link className="pill" href="/initiatives">Explore initiatives →</Link>}>
      <div className="actionable-grid">{insights.slice(2).map((insight) => <ActionableInsightCard insight={insight} compact key={insight.id} />)}</div>
    </NarrativeSection>

    <NarrativeSection eyebrow="EVIDENCE & TRENDS" title="Secondary indicators" description="Scores are subordinate to the narrative and remain fully explainable.">
      <div className="secondary-kpis">
        <article className="secondary-kpi card"><span>STRATEGIC HEALTH</span><strong>72%</strong><small>+3.2 pts vs Q2</small><MetricExplanationDrawer label="Strategic health" value="72%" definition="Weighted execution health of strategic outcomes." formula="Actual OKR progress ÷ expected progress, weighted by priority" threshold="Healthy ≥ 80%; Watch 65–79%; At risk < 65%" components={['OKR progress','Initiative confidence','Traceability coverage']} /></article>
        <article className="secondary-kpi card"><span>DELIVERY CONFIDENCE</span><strong>68%</strong><small>−10 pts vs Q2</small><MetricExplanationDrawer label="Delivery confidence" value="68%" definition="Likelihood of active initiatives meeting committed dates." formula="Σ initiative confidence × strategic weight" threshold="Target ≥ 80%" components={['Forecast confidence','Flow aging','Open blockers']} /></article>
        <article className="secondary-kpi card"><span>PORTFOLIO AT RISK</span><strong>9</strong><small>+3 vs Q2</small><MetricExplanationDrawer label="Portfolio at risk" value="9" definition="Initiatives requiring active intervention." formula="High/Critical risk OR confidence below 60%" threshold="Target ≤ 5" components={['Risk severity','Confidence','Target variance']} /></article>
        <article className="secondary-kpi card"><span>RISK EXPOSURE</span><strong>High</strong><small>4 overdue plans</small><MetricExplanationDrawer label="Risk exposure" value="High" definition="Open exposure weighted by severity and aging." formula="Σ severity weight × aging factor" threshold="Critical if any overdue Critical control" components={['Risk items','Action plans','Vulnerabilities']} /></article>
        <article className="secondary-kpi card"><span>DECISIONS OPEN</span><strong>{decisions.length}</strong><small>{decisions.filter((decision) => decision.priority === 'P0').length} require attention</small><MetricExplanationDrawer label="Open decisions" value={String(decisions.length)} definition="Rule-generated interventions not yet resolved." formula="Count of OPEN or UNDER_REVIEW decisions" threshold="P0 due ≤ 3 days requires attention" components={['Impact','Urgency','Confidence']} /></article>
      </div>
    </NarrativeSection>

    <NarrativeSection eyebrow="GUIDED INTELLIGENCE" title="Explore the evidence through a guided question">
      <ExecutiveCopilot insights={insights} />
    </NarrativeSection>
  </>;
}
