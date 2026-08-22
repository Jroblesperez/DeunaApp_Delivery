import {demoUsers} from './providers';
export function sessionFromRequest(request:Request){if(process.env.NODE_ENV!=='development')return null;const id=request.headers.get('cookie')?.match(/(?:^|;\s*)flowos_demo_session=([^;]+)/)?.[1];return demoUsers.find(user=>user.id===id)??null}
export function requireAdmin(request:Request){return sessionFromRequest(request)?.role==='ADMIN'}
