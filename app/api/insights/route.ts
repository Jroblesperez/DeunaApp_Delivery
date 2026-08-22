import { NextResponse } from 'next/server';
import { envelope } from '@/lib/api';
import { generateActionableInsights } from '@/lib/experience';
export async function GET() { return NextResponse.json(envelope(generateActionableInsights())); }
