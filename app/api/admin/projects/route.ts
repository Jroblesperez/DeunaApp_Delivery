import {NextResponse} from 'next/server';import {envelope} from '@/lib/api';import {projects} from '@/lib/enterprise/data';export async function GET(){return NextResponse.json(envelope(projects,94))}
