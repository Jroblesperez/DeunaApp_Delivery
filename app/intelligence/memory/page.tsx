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
    <PageHeader eyebrow="INTELLIGENCE" title="Executive Memory" description="Cómo cambió la ejecución en el tiempo, con interpretación, causas probables y acción recomendada." action={<select value={grain} onChange={(event) => setGrain(event.target.value as HistoricalSnapshot['grain'])}><option value="WEEK">Semana actual vs anterior</option><option value="MONTH">Mes actual vs anterior</option><option value="QUARTER">Trimestre actual vs anterior</option></select>} />
    <div className="attention-hero"><div><span className="eyebrow purple">QUÉ CAMBIÓ</span><h2>El flujo se desaceleró mientras aumentó la inversión estratégica.</h2><p>Cycle Time y Time to Deploy empeoraron respecto al {grain.toLowerCase()}. La principal causa probable es la espera entre QA y Risk Approval.</p></div><div className="attention-callout"><span>INTERPRETACIÓN</span><b>Proteger la asignación estratégica y reducir colas downstream antes de agregar WIP.</b></div></div>
    <NarrativeSection title="Comparaciones históricas" description="Valor anterior, actual, cambio absoluto y porcentual; nunca un número sin interpretación."><div className="memory-grid">{memory.map((item) => <ExecutiveMemoryCard memory={item} key={item.id} />)}</div></NarrativeSection>
  </>;
}
