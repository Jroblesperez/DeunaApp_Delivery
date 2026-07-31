import { describe, expect, it } from 'vitest';
import { historicalSnapshots, initiatives } from '@/lib/demo-data';
import {
  generateActionableInsights,
  generateDecisions,
  generateExecutiveMemory,
  generateExecutiveNarrative,
  generateOrganizationalPulse,
  generateStrategicMovements,
  generateTimelineDiagnosis,
} from '@/lib/experience';

describe('FlowOS Experience 2.0 decision intelligence', () => {
  it('generates and prioritizes complete decisions', () => {
    const decisions = generateDecisions();
    expect(decisions.length).toBeGreaterThanOrEqual(3);
    expect(decisions[0].impactScore).toBeGreaterThanOrEqual(decisions.at(-1)!.impactScore);
    expect(decisions.every((decision) => decision.evidence.length > 0 && decision.rule && decision.href)).toBe(true);
  });

  it('produces an executive narrative with quantified, auditable claims', () => {
    const narrative = generateExecutiveNarrative();
    expect(narrative.situation).toContain('68%');
    expect(narrative.changes).toContain('11 days');
    expect(narrative.evidence.length).toBeGreaterThanOrEqual(3);
  });

  it('compares temporal snapshots and exposes change interpretation', () => {
    expect(historicalSnapshots.filter((item) => item.grain === 'WEEK')).toHaveLength(4);
    expect(historicalSnapshots.filter((item) => item.grain === 'MONTH')).toHaveLength(3);
    expect(historicalSnapshots.filter((item) => item.grain === 'QUARTER')).toHaveLength(2);
    const memory = generateExecutiveMemory('QUARTER');
    expect(memory.every((item) => item.absoluteChange !== null && item.percentageChange !== null)).toBe(true);
    expect(memory.find((item) => item.id === 'cycleTime')?.direction).toBe('DETERIORATING');
  });

  it('returns insufficient data instead of a false zero', () => {
    const memory = generateExecutiveMemory('WEEK');
    expect(memory.every((item) => item.current !== null)).toBe(true);
    expect(memory.every((item) => item.interpretation !== '')).toBe(true);
  });

  it('detects strategic improvements and deterioration', () => {
    const movements = generateStrategicMovements();
    expect(movements.some((item) => item.direction === 'IMPROVING')).toBe(true);
    expect(movements.some((item) => item.direction === 'DETERIORATING')).toBe(true);
    expect(movements.every((item) => item.before && item.now && item.evidence)).toBe(true);
  });

  it('sorts organizational pulse by criticality and gives each ECO an action', () => {
    const pulse = generateOrganizationalPulse();
    expect(pulse).toHaveLength(9);
    expect(pulse[0].severity).toBeGreaterThanOrEqual(pulse.at(-1)!.severity);
    expect(pulse.every((item) => item.recommendation && item.risk && item.strength)).toBe(true);
  });

  it('diagnoses active time, waiting time and the bottleneck', () => {
    const diagnosis = generateTimelineDiagnosis(initiatives[4]);
    expect(diagnosis.total).toBe(diagnosis.active + diagnosis.waiting);
    expect(diagnosis.slowest.days).toBeGreaterThanOrEqual(0);
    expect(diagnosis.diagnosis).toContain(diagnosis.slowest.name);
    expect(diagnosis.recommendation).toBeTruthy();
  });

  it('creates explainable actionable insights with evidence and action', () => {
    const insights = generateActionableInsights();
    expect(insights.every((item) => item.evidence.every((evidence) => evidence.metric && evidence.source && evidence.coverage >= 0))).toBe(true);
    expect(insights.every((item) => item.recommendation && item.recommendedDecision && item.confidence > 0)).toBe(true);
  });
});
