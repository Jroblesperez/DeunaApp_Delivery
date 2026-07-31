import type {ApiEnvelope} from './types';
export function envelope<T>(data:T, coverage=100, warnings:string[]=[]):ApiEnvelope<T>{return {data,status:coverage===100?'SUCCESS':'PARTIAL',source:'FlowOS Demo Data',lastUpdated:new Date('2026-07-31T09:42:00Z').toISOString(),warnings,coverage}}
export function validateId(id:string){return /^FLOW-\d{3}$/.test(id)}
