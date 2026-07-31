import { OrganizationalPulseCard, NarrativeSection, ActionableInsightCard } from '@/components/experience';
import { PageHeader } from '@/components/ui';
import { generateActionableInsights, generateOrganizationalPulse } from '@/lib/experience';

export default function Page() {
  const pulse = generateOrganizationalPulse();
  const insights = generateActionableInsights();
  return <>
    <PageHeader eyebrow="COMMAND CENTER" title="Organizational Pulse" description="A decision-oriented view of where the organization is healthy, under pressure or missing evidence." action={<span className="pill">Sorted by criticality</span>} />
    <div className="attention-hero"><div><span className="eyebrow purple">ORGANIZATIONAL DIAGNOSIS</span><h2>Habilitadores needs support; downstream risk is increasing across the portfolio.</h2><p>Capacity demand exceeds the sustainable threshold and its dependency queue is consistent with longer waiting time. This is a likely driver, not a confirmed causal relationship.</p></div><div className="attention-callout"><span>RECOMMENDED ACTION</span><b>Rebalance enabling capacity before the next quarterly commitment review.</b></div></div>
    <NarrativeSection title="Where leadership support is needed" description="Health is accompanied by a strength, a risk and a concrete recommendation."><div className="pulse-grid">{pulse.map((item) => <OrganizationalPulseCard pulse={item} key={item.id} />)}</div></NarrativeSection>
    <NarrativeSection title="Cross-organizational signals" description="Evidence that affects more than one ECO."><div className="actionable-grid">{insights.slice(0, 2).map((insight) => <ActionableInsightCard insight={insight} compact key={insight.id} />)}</div></NarrativeSection>
  </>;
}
