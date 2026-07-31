import { OrganizationalPulseCard, NarrativeSection, ActionableInsightCard } from '@/components/experience';
import { PageHeader } from '@/components/ui';
import { generateActionableInsights, generateOrganizationalPulse } from '@/lib/experience';

export default function Page() {
  const pulse = generateOrganizationalPulse();
  const insights = generateActionableInsights();
  return <>
    <PageHeader eyebrow="COMMAND CENTER" title="Organizational Pulse" description="Una vista orientada a decisiones sobre dónde la organización está saludable, bajo presión o sin evidencia." action={<span className="pill">Ordenado por criticidad</span>} />
    <div className="attention-hero"><div><span className="eyebrow purple">DIAGNÓSTICO ORGANIZACIONAL</span><h2>Habilitadores necesita apoyo; el riesgo downstream aumenta en el portafolio.</h2><p>La demanda supera el umbral sostenible y la cola de dependencias coincide con una espera mayor. Es una causa probable, no una causalidad confirmada.</p></div><div className="attention-callout"><span>ACCIÓN RECOMENDADA</span><b>Rebalancear capacidad habilitadora antes de la próxima revisión trimestral.</b></div></div>
    <NarrativeSection title="Dónde se necesita apoyo de liderazgo" description="Cada estado incluye una fortaleza, un riesgo y una recomendación concreta."><div className="pulse-grid">{pulse.map((item) => <OrganizationalPulseCard pulse={item} key={item.id} />)}</div></NarrativeSection>
    <NarrativeSection title="Señales transversales" description="Evidencia que afecta a más de un ECO."><div className="actionable-grid">{insights.slice(0, 2).map((insight) => <ActionableInsightCard insight={insight} compact key={insight.id} />)}</div></NarrativeSection>
  </>;
}
