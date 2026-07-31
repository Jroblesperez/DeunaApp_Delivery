import { DecisionCenter, ExecutiveCopilot } from '@/components/experience';
import { PageHeader } from '@/components/ui';
import { generateActionableInsights, generateDecisions } from '@/lib/experience';

export default function Page() {
  const decisions = generateDecisions();
  return <>
    <PageHeader eyebrow="COMMAND CENTER" title="Decision Center" description="What happened, why it matters, what should be decided and the evidence behind every recommendation." action={<span className="pill">{decisions.filter((decision) => decision.priority === 'P0').length} critical · Demo simulation</span>} />
    <div className="attention-hero"><div><span className="eyebrow purple">WHAT REQUIRES ATTENTION</span><h2>Two constraints need an executive decision before planning closes.</h2><p>Risk Approval waiting time and Habilitadores capacity pressure jointly threaten downstream delivery. Decisions are ordered by impact, urgency, due date and confidence.</p></div><div className="attention-callout"><span>PRIORITY RECOMMENDATION</span><b>Remove 24 SP from Habilitadores or reallocate capacity before accepting additional scope.</b></div></div>
    <section className="narrative-section"><DecisionCenter decisions={decisions} /></section>
    <section className="narrative-section"><ExecutiveCopilot insights={generateActionableInsights()} /></section>
  </>;
}
