import { NextResponse } from 'next/server';
import { z } from 'zod';
import { envelope } from '@/lib/api';
import { generateExecutiveMemory } from '@/lib/experience';
const querySchema = z.enum(['WEEK', 'MONTH', 'QUARTER']).catch('QUARTER');
export async function GET(request: Request) { const grain = querySchema.parse(new URL(request.url).searchParams.get('grain') ?? 'QUARTER'); return NextResponse.json(envelope(generateExecutiveMemory(grain))); }
