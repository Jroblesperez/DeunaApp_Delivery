import {NextResponse} from 'next/server';import {ecos} from '@/lib/demo-data';import {envelope} from '@/lib/api';
export async function GET(){return NextResponse.json(envelope({ecos,organization:{available:ecos.reduce((n,e)=>n+e.available,0),committed:ecos.reduce((n,e)=>n+e.committed,0),consumed:ecos.reduce((n,e)=>n+e.consumed,0)}}))}
