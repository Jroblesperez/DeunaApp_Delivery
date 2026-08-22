import {NextResponse} from 'next/server';import {initiatives} from '@/lib/demo-data';import {envelope} from '@/lib/api';
export async function GET(){return NextResponse.json(envelope(initiatives))}
