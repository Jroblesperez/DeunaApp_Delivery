import { NextResponse } from 'next/server';
import { envelope } from '@/lib/api';
import { generateOrganizationalPulse } from '@/lib/experience';
export async function GET() { return NextResponse.json(envelope(generateOrganizationalPulse())); }
