import { NextResponse } from 'next/server';
import { envelope } from '@/lib/api';
import { generateStrategicMovements } from '@/lib/experience';
export async function GET() { return NextResponse.json(envelope(generateStrategicMovements())); }
