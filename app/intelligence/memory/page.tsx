'use client';
import { useState } from 'react';
import { ExecutiveMemoryCard, NarrativeSection } from '@/components/experience';
import { PageHeader } from '@/components/ui';
import { generateExecutiveMemory } from '@/lib/experience';
import type { HistoricalSnapshot } from '@/lib/types';

export default function Page() {
  const [grain, setGrain] = useState<HistoricalSnapshot['grain']>('QUARTER');
  const memory = generateExecutiveMemory(grain);
  return <>
    <PageHeader eyebrow="INTELLIGENCE" title="Executive Memory" description="How execution changed across time — with interpretation, likely drivers and recommended action." action={<select value={grain} onChange={(event) => setGrain(event.target.value as HistoricalSnapshot['grain'])}><option value="WEEK">Current vs previous week</option><option value="MONTH">Current vs previous month</option><option value="QUARTER">Current vs previous quarter</option></select>} />
    <div className="attention-hero"><div><span className="eyebrow purple">WHAT CHANGED</span><h2>Flow slowed while strategic investment increased.</h2><p>Cycle Time and Time to Deploy deteriorated compared with the previous {grain.toLowerCase()}. The strongest likely driver is waiting between QA and Risk Approval.</p></div><div className="attention-callout"><span>INTERPRETATION</span><b>Protect strategic allocation, but reduce downstream queues before adding more WIP.</b></div></div>
    <NarrativeSection title="Historical comparisons" description="Previous, current, absolute and percentage change — never a number without interpretation."><div className="memory-grid">{memory.map((item) => <ExecutiveMemoryCard memory={item} key={item.id} />)}</div></NarrativeSection>
  </>;
}
