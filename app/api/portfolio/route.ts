import {NextResponse} from 'next/server';import {initiatives} from '@/lib/demo-data';import {envelope} from '@/lib/api';
export async function GET(){return NextResponse.json(envelope({total:initiatives.length,active:initiatives.filter(x=>!['DONE','CANCELLED'].includes(x.status)).length,items:initiatives}))}
