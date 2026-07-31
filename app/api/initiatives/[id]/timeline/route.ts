import { NextResponse } from 'next/server';
import { envelope, validateId } from '@/lib/api';
import { initiatives } from '@/lib/demo-data';
import { generateTimelineDiagnosis } from '@/lib/experience';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; if (!validateId(id)) return NextResponse.json(envelope(null, 0, ['Invalid initiative ID']), { status: 400 }); const initiative = initiatives.find((item) => item.id === id); if (!initiative) return NextResponse.json(envelope(null, 0, ['Initiative not found']), { status: 404 }); return NextResponse.json(envelope(generateTimelineDiagnosis(initiative))); }
