import {NextResponse} from 'next/server';import {actions} from '@/lib/metrics';import {envelope} from '@/lib/api';
export async function GET(){return NextResponse.json(envelope(actions()))}
