import {NextResponse} from 'next/server';import {jiraEnvelope} from '@/lib/jira/api';import {jiraSnapshotStore} from '@/lib/jira/store';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){const metadata=await jiraSnapshotStore.metadata();return NextResponse.json(jiraEnvelope(metadata,metadata?'SUCCESS':'UNAVAILABLE',metadata?metadata.warnings:['Metadata cache aún no generado.'],metadata?100:0))}
