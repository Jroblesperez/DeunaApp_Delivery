import Link from 'next/link';
import { ActionableInsightCard, ExecutiveCopilot, ExecutiveMemoryCard, ExecutiveNarrative, NarrativeSection, StrategicMovementCard } from '@/components/experience';
import { PageHeader } from '@/components/ui';
import { generateActionableInsights, generateExecutiveMemory, generateExecutiveNarrative, generateStrategicMovements } from '@/lib/experience';

export default function Page() {
  const insights = generateActionableInsights();
  const memory = generateExecutiveMemory();
  const movements = generateStrategicMovements();
  return <>
    <PageHeader eyebrow="DETERMINISTIC INTELLIGENCE" title="What changed, why it matters, what to do next" description="FlowOS converts operational evidence into explanations and recommended interventions." action={<span className="pill">No generative AI · 100% explainable</span>} />
    <ExecutiveNarrative narrative={generateExecutiveNarrative()} insights={insights} />
    <NarrativeSection eyebrow="EXECUTIVE MEMORY" title="How execution changed" description="Current quarter compared with the previous quarter." action={<Link className="pill" href="/intelligence/memory">Open Executive Memory →</Link>}><div className="memory-grid">{memory.slice(0, 2).map((item) => <ExecutiveMemoryCard memory={item} key={item.id} />)}</div></NarrativeSection>
    <NarrativeSection eyebrow="STRATEGIC MOVEMENT" title="Movement, not only current state" description="Investment shifts, threshold crossings and stage progression."><div id="movement" className="movement-grid">{movements.map((movement) => <StrategicMovementCard movement={movement} key={movement.id} />)}</div></NarrativeSection>
    <NarrativeSection eyebrow="RECOMMENDED ACTIONS" title="Interventions backed by evidence"><div className="actionable-grid">{insights.map((insight) => <ActionableInsightCard insight={insight} key={insight.id} />)}</div></NarrativeSection>
    <NarrativeSection eyebrow="GUIDED INTELLIGENCE" title="FlowOS Advisor"><ExecutiveCopilot insights={insights} /></NarrativeSection>
  </>;
}
