import {NextResponse} from 'next/server';import {portfolioMix,riskExposure} from '@/lib/metrics';import {envelope} from '@/lib/api';
export async function GET(){return NextResponse.json(envelope({portfolioMix:portfolioMix(),riskExposure:riskExposure()}))}
