import {NextResponse} from 'next/server';
import {JiraCloudError} from './client';
import {JiraConfigurationError} from './credentials';
export function jiraEnvelope<T>(data:T,status:'SUCCESS'|'PARTIAL'|'UNAVAILABLE'|'ERROR'='SUCCESS',warnings:string[]=[],coverage=100){return {data,status,source:'Jira Cloud',lastUpdated:new Date().toISOString(),warnings,coverage}}
export function jiraErrorResponse(error:unknown){if(error instanceof JiraConfigurationError)return NextResponse.json(jiraEnvelope(null,'UNAVAILABLE',[error.message],0),{status:503});if(error instanceof JiraCloudError)return NextResponse.json(jiraEnvelope(null,'ERROR',[error.message],0),{status:error.status});return NextResponse.json(jiraEnvelope(null,'ERROR',['Error interno al consultar Jira.'],0),{status:500})}
