import Link from 'next/link';
import { ActionableInsightCard, ExecutiveCopilot, ExecutiveMemoryCard, ExecutiveNarrative, NarrativeSection, StrategicMovementCard } from '@/components/experience';
import { PageHeader } from '@/components/ui';
import { generateActionableInsights, generateExecutiveMemory, generateExecutiveNarrative, generateStrategicMovements } from '@/lib/experience';

export default function Page() {
  const insights = generateActionableInsights();
  const memory = generateExecutiveMemory();
  const movements = generateStrategicMovements();
  return <>
    <PageHeader eyebrow="DETERMINISTIC INTELLIGENCE" title="Qué cambió, por qué importa y qué hacer" description="FlowOS convierte evidencia operativa en explicaciones e intervenciones recomendadas." action={<span className="pill">Sin IA generativa · 100% explicable</span>} />
    <ExecutiveNarrative narrative={generateExecutiveNarrative()} insights={insights} />
    <NarrativeSection eyebrow="EXECUTIVE MEMORY" title="Cómo cambió la ejecución" description="Trimestre actual comparado con el anterior." action={<Link className="pill" href="/intelligence/memory">Open Executive Memory →</Link>}><div className="memory-grid">{memory.slice(0, 2).map((item) => <ExecutiveMemoryCard memory={item} key={item.id} />)}</div></NarrativeSection>
    <NarrativeSection eyebrow="STRATEGIC MOVEMENT" title="Movimiento, no solo estado actual" description="Cambios de inversión, cruces de umbral y progresión de etapas."><div id="movement" className="movement-grid">{movements.map((movement) => <StrategicMovementCard movement={movement} key={movement.id} />)}</div></NarrativeSection>
    <NarrativeSection eyebrow="RECOMMENDED ACTIONS" title="Intervenciones respaldadas por evidencia"><div className="actionable-grid">{insights.map((insight) => <ActionableInsightCard insight={insight} key={insight.id} />)}</div></NarrativeSection>
    <NarrativeSection eyebrow="GUIDED INTELLIGENCE" title="FlowOS Advisor"><ExecutiveCopilot insights={insights} /></NarrativeSection>
  </>;
}
