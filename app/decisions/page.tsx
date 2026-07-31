import { DecisionCenter, ExecutiveCopilot } from '@/components/experience';
import { PageHeader } from '@/components/ui';
import { generateActionableInsights, generateDecisions } from '@/lib/experience';

export default function Page() {
  const decisions = generateDecisions();
  return <>
    <PageHeader eyebrow="COMMAND CENTER" title="Decision Center" description="Qué ocurrió, por qué importa, qué se debería decidir y la evidencia de cada recomendación." action={<span className="pill">{decisions.filter((decision) => decision.priority === 'P0').length} críticas · Simulación demo</span>} />
    <div className="attention-hero"><div><span className="eyebrow purple">QUÉ REQUIERE ATENCIÓN</span><h2>Dos restricciones necesitan una decisión ejecutiva antes del cierre de planificación.</h2><p>La espera en Risk Approval y la presión de capacidad en Habilitadores amenazan el delivery downstream. Las decisiones se ordenan por impacto, urgencia, fecha y confianza.</p></div><div className="attention-callout"><span>RECOMENDACIÓN PRIORITARIA</span><b>Retirar 24 SP de Habilitadores o reasignar capacidad antes de aceptar más alcance.</b></div></div>
    <section className="narrative-section"><DecisionCenter decisions={decisions} /></section>
    <section className="narrative-section"><ExecutiveCopilot insights={generateActionableInsights()} /></section>
  </>;
}
