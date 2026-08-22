export type Health = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNAVAILABLE';
export type InitiativeStatus = 'DISCOVERY'|'PRIORITIZED'|'PLANNED'|'IN_DELIVERY'|'READY_FOR_QA'|'IN_QA'|'RISK_APPROVAL'|'READY_FOR_RELEASE'|'DEPLOYMENT'|'INTERNAL_TESTING'|'MASSIFICATION'|'PRODUCTION'|'DONE'|'BLOCKED'|'CANCELLED';
export type InitiativeType = 'STRATEGIC'|'OPERATIONAL'|'IMPROVEMENT'|'TECH_DEBT'|'REGULATORY_RISK';
export type Role = 'EXECUTIVE'|'ECO_LEADER'|'DELIVERY_LEADER'|'PRODUCT_LEADER'|'RISK_LEADER'|'TEAM_USER'|'ADMIN';
export interface Initiative { id:string; name:string; type:InitiativeType; eco:string; okr?:string; impact:string; status:InitiativeStatus; sourceStatus:string; progress:number; target:string; daysInStatus:number; team?:string; supplier:string; capacity:number; dependencies:number; risk:'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'|'UNKNOWN'; actionPlan:boolean; release?:string; confidence:number; nextGate:string; decision:string; owner:string; priority:'P0'|'P1'|'P2'; sourceUrl:string; stages:{name:string;days:number;state:'done'|'current'|'next'}[] }
export interface Eco {name:string; code:string; health:Health; commitments:number; progress:number; available:number; committed:number; consumed:number; wip:number; dependencies:number; risks:number; cycleTime:number; throughput:number; forecast:string}
export interface ApiEnvelope<T>{data:T;status:'SUCCESS'|'PARTIAL'|'UNAVAILABLE'|'ERROR';source:string;lastUpdated:string;warnings:string[];coverage:number}

export type InsightCategory = 'STRATEGY'|'PORTFOLIO'|'DELIVERY'|'CAPACITY'|'RISK'|'DEPENDENCY'|'RELEASE'|'QUALITY'|'FLOW';
export type SignalSeverity = 'INFO'|'WATCH'|'AT_RISK'|'CRITICAL'|'INSUFFICIENT_DATA';
export type DecisionType = 'APPROVE'|'ESCALATE'|'REPRIORITIZE'|'REALLOCATE_CAPACITY'|'ACCEPT_RISK'|'DELAY_RELEASE'|'REQUEST_ACTION_PLAN'|'RESOLVE_DEPENDENCY'|'REVIEW_SCOPE'|'CONFIRM_COMMITMENT';
export type DecisionStatus = 'OPEN'|'UNDER_REVIEW'|'DECIDED'|'DEFERRED'|'DISMISSED';

export interface Evidence {
  metric: string;
  value: string;
  entity: string;
  period: string;
  source: string;
  lastUpdated: string;
  coverage: number;
}

export interface ActionableInsight {
  id: string;
  category: InsightCategory;
  severity: SignalSeverity;
  headline: string;
  narrative: string;
  metric: string;
  currentValue: number;
  previousValue?: number;
  targetValue?: number;
  unit: string;
  entityType: string;
  entityId: string;
  impact: string;
  evidence: Evidence[];
  recommendation: string;
  recommendedDecision: DecisionType;
  owner: string;
  dueDate: string;
  confidence: number;
  source: string;
  lastUpdated: string;
  href: string;
}

export interface ExecutiveDecision {
  id: string;
  title: string;
  type: DecisionType;
  category: InsightCategory;
  priority: 'P0'|'P1'|'P2';
  status: DecisionStatus;
  situation: string;
  impact: string;
  evidence: Evidence[];
  recommendation: string;
  owner: string;
  dueDate: string;
  entity: string;
  confidence: number;
  rule: string;
  href: string;
  impactScore: number;
  urgencyScore: number;
}

export interface HistoricalSnapshot {
  period: string;
  grain: 'WEEK'|'MONTH'|'QUARTER';
  metrics: Record<string, number | null>;
}

export interface MemoryComparison {
  id: string;
  metric: string;
  previous: number | null;
  current: number | null;
  target?: number;
  unit: string;
  absoluteChange: number | null;
  percentageChange: number | null;
  interpretation: string;
  driver: string;
  impact: string;
  action: string;
  direction: 'IMPROVING'|'DETERIORATING'|'STABLE'|'INSUFFICIENT_DATA';
}
