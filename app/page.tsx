'use client';
import {useEffect,useState} from 'react';
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
import { OutcomeProgress, PortfolioFlowMap, StrategyCapacityView, StrategyExecutionMap } from '@/components/enterprise/strategy';
import { LiveExecutiveEmptyState, LiveExecutiveOverview, type LiveUi } from '@/components/jira-live';

function DemoHome() {
  const insights = generateActionableInsights();
  const decisions = generateDecisions();
  const narrative = generateExecutiveNarrative();
  const pulse = generateOrganizationalPulse();
  const movements = generateStrategicMovements();

  return <>
    <ExecutiveGreeting />
    <ExecutiveNarrative narrative={narrative} insights={insights} />

    <NarrativeSection eyebrow="DECISIONES ANTES QUE DASHBOARDS" title="Decisiones que no pueden esperar" description="Ordenadas por impacto, urgencia, fecha límite y confianza de la recomendación." action={<Link className="pill" href="/decisions">Abrir Centro de decisiones →</Link>}>
      <div className="actionable-grid">{insights.slice(0, 2).map((insight) => <ActionableInsightCard insight={insight} key={insight.id} />)}</div>
      <div className="brief-signals">{decisions.slice(0, 4).map((decision) => <span key={decision.id}><b>{decision.priority}</b> · {decision.owner} · due {decision.dueDate}</span>)}</div>
    </NarrativeSection>

    <NarrativeSection eyebrow="ESTRATEGIA A EJECUCIÓN" title="Cómo se conectan los resultados con la ejecución" description="Nodos, flujo y capacidad responden preguntas ejecutivas concretas.">
      <div className="strategic-grid"><StrategyExecutionMap /><PortfolioFlowMap /></div>
    </NarrativeSection>

    <NarrativeSection eyebrow="ESTRATEGIA Y CAPACIDAD" title="Dónde estamos invirtiendo la capacidad" description="Objetivo, compromiso, consumo y variación por tipo de iniciativa.">
      <div className="strategic-grid"><StrategyCapacityView /><OutcomeProgress /></div>
    </NarrativeSection>

    <NarrativeSection eyebrow="PULSO ORGANIZACIONAL" title="Dónde se necesita apoyo de liderazgo" description="Salud narrativa de ECOs y CoEs, no otro scorecard." action={<Link className="pill" href="/pulse">Explorar Pulso organizacional →</Link>}>
      <div className="pulse-grid">{pulse.slice(0, 3).map((item) => <OrganizationalPulseCard pulse={item} key={item.id} />)}</div>
    </NarrativeSection>

    <NarrativeSection eyebrow="MOVIMIENTO ESTRATÉGICO" title="Qué cambió y por qué importa" description="Cruces de umbral, cambios de inversión y movimiento en el value stream." action={<Link className="pill" href="/intelligence#movement">Ver movimiento →</Link>}>
      <div className="movement-grid">{movements.map((movement) => <StrategicMovementCard movement={movement} key={movement.id} />)}</div>
    </NarrativeSection>

    <NarrativeSection eyebrow="ATENCIÓN DE PORTAFOLIO" title="Señales detrás del trimestre" description="Cada señal incluye evidencia, impacto y siguiente paso recomendado." action={<Link className="pill" href="/initiatives">Explorar iniciativas →</Link>}>
      <div className="actionable-grid">{insights.slice(2).map((insight) => <ActionableInsightCard insight={insight} compact key={insight.id} />)}</div>
    </NarrativeSection>

    <NarrativeSection eyebrow="EVIDENCIA Y TENDENCIAS" title="Indicadores secundarios" description="Los scores están subordinados a la narrativa y son explicables.">
      <div className="secondary-kpis">
        <article className="secondary-kpi card"><span>STRATEGIC HEALTH</span><strong>72%</strong><small>+3.2 pts vs Q2</small><MetricExplanationDrawer label="Strategic health" value="72%" definition="Weighted execution health of strategic outcomes." formula="Actual OKR progress ÷ expected progress, weighted by priority" threshold="Healthy ≥ 80%; Watch 65–79%; At risk < 65%" components={['OKR progress','Initiative confidence','Traceability coverage']} /></article>
        <article className="secondary-kpi card"><span>DELIVERY CONFIDENCE</span><strong>68%</strong><small>−10 pts vs Q2</small><MetricExplanationDrawer label="Delivery confidence" value="68%" definition="Likelihood of active initiatives meeting committed dates." formula="Σ initiative confidence × strategic weight" threshold="Target ≥ 80%" components={['Forecast confidence','Flow aging','Open blockers']} /></article>
        <article className="secondary-kpi card"><span>PORTFOLIO AT RISK</span><strong>9</strong><small>+3 vs Q2</small><MetricExplanationDrawer label="Portfolio at risk" value="9" definition="Initiatives requiring active intervention." formula="High/Critical risk OR confidence below 60%" threshold="Target ≤ 5" components={['Risk severity','Confianza','Target variance']} /></article>
        <article className="secondary-kpi card"><span>RISK EXPOSURE</span><strong>High</strong><small>4 overdue plans</small><MetricExplanationDrawer label="Risk exposure" value="High" definition="Open exposure weighted by severity and aging." formula="Σ severity weight × aging factor" threshold="Critical if any overdue Critical control" components={['Risk items','Action plans','Vulnerabilities']} /></article>
        <article className="secondary-kpi card"><span>DECISIONES ABIERTAS</span><strong>{decisions.length}</strong><small>{decisions.filter((decision) => decision.priority === 'P0').length} requieren atención</small><MetricExplanationDrawer label="Decisiones abiertas" value={String(decisions.length)} definition="Intervenciones generadas por reglas aún no resueltas." formula="Cantidad de decisiones Abiertas o En revisión" threshold="P0 con vencimiento ≤ 3 días requiere atención" components={['Impacto','Urgencia','Confianza']} /></article>
      </div>
    </NarrativeSection>

    <NarrativeSection eyebrow="INTELIGENCIA GUIADA" title="Explora la evidencia con una pregunta guiada">
      <ExecutiveCopilot insights={insights} />
    </NarrativeSection>
  </>;
}

export default function Home(){const [live,setLive]=useState<LiveUi|null>(null);useEffect(()=>{fetch('/api/executive/live').then(r=>r.json()).then((value:LiveUi)=>setLive(value)).catch(()=>setLive({data:{dataMode:process.env.NEXT_PUBLIC_DATA_MODE==='LIVE'?'LIVE':'DEMO',available:false}}))},[]);if(!live)return <section className="card panel"><span className="eyebrow purple">VALIDANDO FUENTE DE DATOS</span><h2>Cargando contexto ejecutivo…</h2></section>;if(live.data?.dataMode==='LIVE')return live.data.available?<LiveExecutiveOverview live={live}/>:<LiveExecutiveEmptyState/>;return <DemoHome/>}
