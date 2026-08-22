import {NextResponse} from 'next/server';
import {jiraEnvelope} from '@/lib/jira/api';
import {sessionFromRequest} from '@/lib/auth/server-session';
import {loadQ3Overview} from '@/lib/q3/server';
import {buildQ3ExecutiveDecisions} from '@/lib/q3/decisions';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const session=sessionFromRequest(request);
 if(!session)return NextResponse.json(jiraEnvelope(null,'ERROR',['Sesión o scope no autorizado.'],0),{status:403});
 const overview=await loadQ3Overview();
 if(!overview)return NextResponse.json(jiraEnvelope(null,'UNAVAILABLE',['Requiere snapshot semántico Q3.'],0));
 const decisions=buildQ3ExecutiveDecisions(overview,{role:session.role,accessRole:session.accessRole,scope:session.scope});
 const byKey=new Map(overview.initiatives.map(item=>[item.canonicalKey,item]));
 const safe=decisions.map(decision=>{const item=byKey.get(decision.initiativeReference);return{...decision,evidenceContext:item?{features:item.progressStatus==='UNAVAILABLE'?null:{completed:item.featuresCompleted,total:item.featuresTotal},riskGateStatus:item.riskGateStatus,riskDomains:item.riskDomains,previousTargetDate:item.previousTargetDate,targetDateChangeCount:item.targetDateChangeCount,quarterChangeCount:item.quarterChangeCount}:null}});
 return NextResponse.json(jiraEnvelope({snapshot:{version:overview.snapshot.version,lastUpdated:overview.snapshot.lastUpdated},source:'Jira LIVE',decisions:safe},'SUCCESS',[],100));
}
