import 'server-only';
import {z} from 'zod';

const projectKey=/^[A-Z][A-Z0-9_]{1,19}$/;
export type JiraCredentials={baseUrl:string;email:string;token:string;projects:string[];maxIssues:number};
export class JiraConfigurationError extends Error{constructor(message:string){super(message);this.name='JiraConfigurationError'}}

export class JiraCredentialsProvider{
  get():JiraCredentials{
    const raw={dataMode:process.env.DATA_MODE,baseUrl:process.env.JIRA_BASE_URL,email:process.env.JIRA_EMAIL,token:process.env.JIRA_API_TOKEN,enabled:process.env.JIRA_SYNC_ENABLED,projects:process.env.JIRA_SYNC_PROJECTS,maxIssues:process.env.JIRA_SYNC_MAX_ISSUES};
    const missing=Object.entries(raw).filter(([,value])=>!value).map(([key])=>key);
    if(missing.length)throw new JiraConfigurationError(`Configuración Jira incompleta: ${missing.join(', ')}`);
    if(raw.dataMode!=='LIVE')throw new JiraConfigurationError('DATA_MODE debe ser LIVE para consultar Jira.');
    if(raw.enabled?.toLowerCase()!=='true')throw new JiraConfigurationError('JIRA_SYNC_ENABLED debe ser true.');
    let url:URL;try{url=new URL(raw.baseUrl!)}catch{throw new JiraConfigurationError('JIRA_BASE_URL no es una URL válida.');}
    if(url.protocol!=='https:')throw new JiraConfigurationError('JIRA_BASE_URL debe usar HTTPS.');
    const projects=raw.projects!.split(',').map(x=>x.trim().toUpperCase()).filter(Boolean);
    if(!projects.length||projects.some(key=>!projectKey.test(key)))throw new JiraConfigurationError('JIRA_SYNC_PROJECTS contiene project keys inválidas.');
    const maxIssues=z.coerce.number().int().min(1).max(5000).safeParse(raw.maxIssues);
    if(!maxIssues.success)throw new JiraConfigurationError('JIRA_SYNC_MAX_ISSUES debe estar entre 1 y 5000.');
    return {baseUrl:url.origin,email:raw.email!,token:raw.token!,projects:[...new Set(projects)],maxIssues:maxIssues.data};
  }
}
