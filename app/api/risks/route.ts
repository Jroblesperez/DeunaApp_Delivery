import {NextResponse} from 'next/server';import {risks} from '@/lib/demo-data';import {envelope} from '@/lib/api';
export async function GET(){return NextResponse.json(envelope(risks))}
