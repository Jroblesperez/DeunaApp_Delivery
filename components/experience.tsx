'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Gauge,
  Info,
  Lightbulb,
  Minus,
  MoveDownRight,
  MoveUpRight,
  Scale,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import type { ActionableInsight, Evidence, ExecutiveDecision, MemoryComparison } from '@/lib/types';
import type { generateOrganizationalPulse, generateStrategicMovements, generateTimelineDiagnosis } from '@/lib/experience';
import type { Initiative } from '@/lib/types';

type Pulse = ReturnType<typeof generateOrganizationalPulse>[number];
type Movement = ReturnType<typeof generateStrategicMovements>[number];
type Diagnosis = ReturnType<typeof generateTimelineDiagnosis>;

export function ExecutiveGreeting({ name = 'Joan' }: { name?: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <header className="executive-greeting">
      <span className="experience-label"><Sparkles size={13} /> FLOWOS EXPERIENCE 2.0</span>
      <h1>{greeting}, {name}.</h1>
      <p>Here is what requires your attention today.</p>
      <div className="greeting-meta"><span className="live-dot" /> Updated 31 Jul 2026 · 09:42 UTC · 100% demo coverage</div>
    </header>
  );
}

export function NarrativeSection({ eyebrow, title, description, action, children }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="narrative-section">
      <div className="narrative-heading">
        <div>{eyebrow && <span className="eyebrow purple">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EvidenceDrawer({ evidence, label = 'View evidence' }: { evidence: Evidence[]; label?: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="evidence-trigger" onClick={() => setOpen(true)}><Info size={14} /> {label}</button>
    {open && <div className="drawer-backdrop" onClick={() => setOpen(false)}>
      <aside className="evidence-drawer" role="dialog" aria-modal="true" aria-label="Evidence" onClick={(event) => event.stopPropagation()}>
        <button className="drawer-close" aria-label="Close evidence" onClick={() => setOpen(false)}><X /></button>
        <span className="eyebrow purple">AUDITABLE EVIDENCE</span><h2>Why FlowOS is recommending this</h2>
        <p className="muted">Every statement is linked to a metric, entity, period and source.</p>
        <div className="evidence-list">{evidence.map((item, index) => <article key={`${item.metric}-${index}`}>
          <span>{item.metric}</span><strong>{item.value}</strong>
          <dl><div><dt>Entity</dt><dd>{item.entity}</dd></div><div><dt>Period</dt><dd>{item.period}</dd></div><div><dt>Source</dt><dd>{item.source}</dd></div><div><dt>Coverage</dt><dd>{item.coverage}%</dd></div></dl>
          <small>Updated {new Date(item.lastUpdated).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</small>
        </article>)}</div>
      </aside>
    </div>}
  </>;
}

export function ActionableInsightCard({ insight, compact = false }: { insight: ActionableInsight; compact?: boolean }) {
  return <article className={`actionable-insight ${compact ? 'compact' : ''} severity-${insight.severity.toLowerCase()}`}>
    <div className="insight-rail" />
    <div className="actionable-body">
      <div className="between"><span className="signal-label"><CircleAlert size={13} /> {insight.category} · {insight.severity.replaceAll('_', ' ')}</span><span className="confidence">{insight.confidence}% confidence</span></div>
      <h3>{insight.headline}</h3><p>{insight.narrative}</p>
      {!compact && <div className="decision-logic"><div><span>WHY IT MATTERS</span><b>{insight.impact}</b></div><div><span>RECOMMENDED ACTION</span><b>{insight.recommendation}</b></div></div>}
      <div className="card-actions"><EvidenceDrawer evidence={insight.evidence} /><Link href={insight.href}>Open detail <ArrowRight size={14} /></Link></div>
    </div>
  </article>;
}

export function ExecutiveNarrative({ narrative, insights }: { narrative: Record<string, string | Evidence[]>; insights: ActionableInsight[] }) {
  const blocks = [
    ['Situation', narrative.situation], ['What changed', narrative.changes], ['Risk', narrative.risk],
    ['Opportunity', narrative.opportunity], ['Decisions', narrative.decisions], ['Priority recommendation', narrative.recommendation],
  ];
  return <article className="executive-narrative card">
    <div className="narrative-intro"><span className="copilot-icon"><Sparkles /></span><div><span className="eyebrow purple">EXECUTIVE BRIEF · DETERMINISTIC</span><h2>The quarter can recover, but two constraints need intervention now.</h2></div></div>
    <div className="brief-grid">{blocks.map(([label, text], index) => <div className={index === 5 ? 'priority-block' : ''} key={String(label)}><span>{label as string}</span><p>{text as string}</p></div>)}</div>
    <div className="card-actions"><EvidenceDrawer evidence={narrative.evidence as Evidence[]} /><Link href="/intelligence">Read full brief <ArrowRight size={14} /></Link></div>
    <div className="brief-signals">{insights.slice(0, 3).map((insight) => <span key={insight.id}>{insight.metric}: <b>{insight.currentValue}{insight.unit}</b></span>)}</div>
  </article>;
}

export function DecisionTypeBadge({ type }: { type: ExecutiveDecision['type'] }) {
  return <span className="decision-type"><Scale size={12} />{type.replaceAll('_', ' ')}</span>;
}

export function DecisionCard({ decision }: { decision: ExecutiveDecision }) {
  const [status, setStatus] = useState(decision.status);
  return <article className="decision-card card">
    <div className="decision-top"><div className={`priority priority-${decision.priority.toLowerCase()}`}>{decision.priority}</div><DecisionTypeBadge type={decision.type} /><span className="decision-status">{status.replaceAll('_', ' ')}</span></div>
    <h3>{decision.title}</h3>
    <div className="decision-answers"><div><span>WHAT HAPPENED?</span><p>{decision.situation}</p></div><div><span>WHY DOES IT MATTER?</span><p>{decision.impact}</p></div><div className="recommended"><span>WHAT SHOULD WE DECIDE?</span><p>{decision.recommendation}</p></div></div>
    <div className="decision-footer"><div><b>{decision.owner}</b><span><CalendarClock size={12} /> Due {decision.dueDate}</span></div><div className="card-actions"><EvidenceDrawer evidence={decision.evidence} /><select aria-label="Demo decision status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option>OPEN</option><option>UNDER_REVIEW</option><option>DECIDED</option><option>DEFERRED</option><option>DISMISSED</option></select><Link href={decision.href}><ChevronRight size={18} /></Link></div></div>
    <small className="rule-origin">Rule: {decision.rule} · {decision.confidence}% confidence · simulation only</small>
  </article>;
}

const suggestedQuestions = ['What changed since last week?', 'Why is the quarter at risk?', 'Which initiatives require executive attention?', 'Where is capacity overloaded?', 'What is delaying production?', 'Which risks are blocking releases?', 'Which decisions cannot wait?'];

export function ExecutiveCopilot({ insights }: { insights: ActionableInsight[] }) {
  const [selected, setSelected] = useState(0);
  const answer = insights[selected % insights.length];
  return <section className="executive-copilot card">
    <div className="copilot-head"><span className="copilot-icon"><Bot /></span><div><span className="eyebrow purple">EXECUTIVE COPILOT</span><h3>Ask a guided question</h3></div><span className="rovo-label">Rovo-ready simulation</span></div>
    <div className="copilot-content"><div className="copilot-questions">{suggestedQuestions.map((question, index) => <button className={index === selected ? 'selected' : ''} onClick={() => setSelected(index)} key={question}>{question}<ChevronRight size={14} /></button>)}</div><div className="copilot-answer"><span className="signal-label">DETERMINISTIC ANSWER</span><h3>{answer.headline}</h3><p>{answer.narrative}</p><div className="copilot-recommendation"><Lightbulb size={18} /><div><span>Recommended action</span><b>{answer.recommendation}</b></div></div><div className="card-actions"><EvidenceDrawer evidence={answer.evidence} /><Link href={answer.href}>Open detail <ArrowRight size={14} /></Link></div></div></div>
  </section>;
}

export function OrganizationalPulseCard({ pulse }: { pulse: Pulse }) {
  return <Link href={pulse.href} className={`pulse-card pulse-${pulse.status.toLowerCase()}`}>
    <div className="between"><div><span className="eyebrow">ECO / CoE</span><h3>{pulse.name}</h3></div><span className="pulse-status">{pulse.status.replaceAll('_', ' ')}</span></div>
    <p className="pulse-strength"><CheckCircle2 size={14} /> {pulse.strength}</p><p className="pulse-risk"><CircleAlert size={14} /> {pulse.risk}</p>
    <div className="pulse-stats"><span><b>{pulse.utilization}%</b> capacity</span><span><b>{pulse.confidence}%</b> confidence</span><span><b>{pulse.dependencies}</b> dependencies</span></div>
    <div className="pulse-action"><b>Recommended action</b>{pulse.recommendation}</div>
  </Link>;
}

export function StrategicMovementCard({ movement }: { movement: Movement }) {
  const improving = movement.direction === 'IMPROVING';
  return <article className="movement-card card"><div className={`movement-icon ${improving ? 'improving' : 'deteriorating'}`}>{improving ? <MoveUpRight /> : <MoveDownRight />}</div><div><span className="eyebrow">{movement.direction}</span><h3>{movement.headline}</h3><div className="movement-values"><span>{movement.before}</span><ArrowRight size={14} /><b>{movement.now}</b></div><p><b>Likely driver:</b> {movement.cause}</p><p className="muted">{movement.impact}</p><Link href={movement.href}>{movement.evidence} <ChevronRight size={13} /></Link></div></article>;
}

export function ExecutiveMemoryCard({ memory }: { memory: MemoryComparison }) {
  const DirectionIcon = memory.direction === 'IMPROVING' ? MoveUpRight : memory.direction === 'DETERIORATING' ? MoveDownRight : Minus;
  return <article className={`memory-card card memory-${memory.direction.toLowerCase()}`}>
    <div className="between"><span className="eyebrow">{memory.metric}</span><span className="memory-direction"><DirectionIcon size={14} /> {memory.direction.replaceAll('_', ' ')}</span></div>
    {memory.current === null ? <div className="insufficient"><Info /> Insufficient data</div> : <><div className="memory-values"><div><span>Previous</span><b>{memory.previous}{memory.unit}</b></div><ArrowRight /><div><span>Current</span><b>{memory.current}{memory.unit}</b></div><div className="memory-change"><span>Change</span><b>{memory.percentageChange && memory.percentageChange > 0 ? '+' : ''}{memory.percentageChange}%</b></div></div><p>{memory.interpretation}</p><div className="memory-cause"><b>{memory.driver}</b><span>{memory.impact}</span></div><div className="pulse-action"><b>Recommended action</b>{memory.action}</div></>}
  </article>;
}

export function TimelineIntelligence({ initiative, diagnosis }: { initiative: Initiative; diagnosis: Diagnosis }) {
  const total = diagnosis.total || 1;
  return <section className="timeline-intelligence card">
    <div className="timeline-heading"><div><span className="eyebrow purple">TIMELINE INTELLIGENCE</span><h2>Where elapsed time is accumulating</h2><p>{diagnosis.outsideDevelopment}% of elapsed time was spent outside development.</p></div><div className="forecast-box"><span>FORECAST</span><b>{diagnosis.forecast}</b><small>Target · {diagnosis.target}</small></div></div>
    <div className="time-composition"><div className="active-segment" style={{ width: `${(diagnosis.active / total) * 100}%` }}><span>Active {diagnosis.active}d</span></div><div className="waiting-segment" style={{ width: `${(diagnosis.waiting / total) * 100}%` }}><span>Waiting {diagnosis.waiting}d</span></div>{diagnosis.blocked > 0 && <div className="blocked-segment" style={{ width: `${(diagnosis.blocked / total) * 100}%` }}><span>Blocked {diagnosis.blocked}d</span></div>}</div>
    <div className="intelligent-stages">{initiative.stages.map((stage) => { const percentage = diagnosis.total ? Math.round((stage.days / diagnosis.total) * 100) : 0; return <div className={`intelligent-stage stage-${stage.state}`} key={stage.name}><div className="stage-bar" style={{ height: `${Math.max(8, percentage * 2)}px` }} /><span>{stage.name}</span><b>{stage.days ? `${stage.days}d · ${percentage}%` : 'Projected'}</b></div>; })}</div>
    <FlowDiagnosis diagnosis={diagnosis} />
  </section>;
}

export function FlowDiagnosis({ diagnosis }: { diagnosis: Diagnosis }) {
  return <div className="flow-diagnosis"><span className="diagnosis-icon"><Gauge /></span><div><span className="eyebrow">FLOW DIAGNOSIS</span><h3>{diagnosis.diagnosis}</h3><p><b>Largest wait:</b> {diagnosis.slowest.name}, {diagnosis.slowest.days} days · {diagnosis.deviation > 0 ? `${diagnosis.deviation}% above` : `${Math.abs(diagnosis.deviation)}% below`} the organizational median.</p></div><div className="diagnosis-action"><span>RECOMMENDED ACTION</span><b>{diagnosis.recommendation}</b></div></div>;
}

export function MetricExplanationDrawer({ label, value, definition, formula, threshold, components }: { label: string; value: string; definition: string; formula: string; threshold: string; components: string[] }) {
  const [open, setOpen] = useState(false);
  return <><button className="metric-explain" onClick={() => setOpen(true)}><Info size={13} /> Explain score</button>{open && <div className="drawer-backdrop" onClick={() => setOpen(false)}><aside className="evidence-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="drawer-close" onClick={() => setOpen(false)}><X /></button><span className="eyebrow purple">METRIC EXPLAINABILITY</span><h2>{label} · {value}</h2><div className="explanation-grid"><div><span>Definition</span><p>{definition}</p></div><div><span>Formula</span><p>{formula}</p></div><div><span>Threshold</span><p>{threshold}</p></div><div><span>Coverage</span><p>100% demo coverage</p></div></div><h3>Components</h3><ul>{components.map((component) => <li key={component}>{component}</li>)}</ul><small className="muted">Source: FlowOS · Jira Demo Data · Updated 31 Jul 2026 09:42 UTC</small></aside></div>}</>;
}

export function DecisionCenter({ decisions }: { decisions: ExecutiveDecision[] }) {
  const filters = ['Requires attention', 'Due this week', 'Strategic', 'Delivery', 'Risk', 'Capacity', 'Release', 'Resolved'];
  const [filter, setFilter] = useState(filters[0]);
  const visible = useMemo(() => decisions.filter((decision) => {
    if (filter === 'Requires attention') return decision.status === 'OPEN';
    if (filter === 'Due this week') return decision.dueDate <= '2026-08-07';
    if (filter === 'Resolved') return decision.status === 'DECIDED';
    return decision.category === filter.toUpperCase();
  }), [decisions, filter]);
  return <><div className="decision-filters" role="tablist">{filters.map((item) => <button role="tab" aria-selected={filter === item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><div className="decision-list">{visible.length ? visible.map((decision) => <DecisionCard decision={decision} key={decision.id} />) : <div className="empty"><Target /><b>No decisions in this view</b><span>Demo decisions remain available under Requires attention.</span></div>}</div></>;
}
