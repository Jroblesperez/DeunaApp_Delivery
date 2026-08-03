import type {JiraCredentials} from './credentials';

export class JiraCloudError extends Error{constructor(public status:number,public code:string,message:string,public correlationId:string){super(message);this.name='JiraCloudError'}}
type RequestMeta<T>={data:T;correlationId:string;durationMs:number};
export type JiraPage<T>={items:T[];pagesProcessed:number;truncated:boolean;partial:boolean;warnings:string[];correlationId:string;durationMs:number};
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
const safeMessage=(status:number)=>status===401?'Las credenciales de Jira no son válidas o expiraron.':status===403?'FlowOS se autenticó, pero la cuenta no tiene acceso suficiente.':status===429?'Jira limitó temporalmente las solicitudes.':status>=500?'Jira Cloud no está disponible temporalmente.':'La solicitud read-only a Jira no pudo completarse.';

export class JiraCloudClient{
  constructor(private credentials:JiraCredentials,private fetcher:typeof fetch=fetch,private timeoutMs=15000,private retries=2){}
  private async request<T>(path:string,init:RequestInit={}):Promise<RequestMeta<T>>{
    const correlationId=crypto.randomUUID();const started=Date.now();
    for(let attempt=0;attempt<=this.retries;attempt++){
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),this.timeoutMs);
      try{
        const response=await this.fetcher(`${this.credentials.baseUrl}${path}`,{...init,method:'GET',headers:{Accept:'application/json',Authorization:`Basic ${Buffer.from(`${this.credentials.email}:${this.credentials.token}`).toString('base64')}`,'X-FlowOS-Correlation-Id':correlationId},signal:controller.signal,cache:'no-store'});
        if(response.ok)return {data:await response.json() as T,correlationId,durationMs:Date.now()-started};
        if((response.status===429||response.status>=500)&&attempt<this.retries){const retryAfter=Number(response.headers.get('retry-after'));await sleep(Number.isFinite(retryAfter)&&retryAfter>0?Math.min(retryAfter*1000,5000):200*(attempt+1));continue;}
        throw new JiraCloudError(response.status,`JIRA_${response.status}`,safeMessage(response.status),correlationId);
      }catch(error){
        if(error instanceof JiraCloudError)throw error;
        if(error instanceof Error&&error.name==='AbortError')throw new JiraCloudError(504,'JIRA_TIMEOUT','La conexión con Jira excedió el tiempo de espera.',correlationId);
        if(attempt===this.retries)throw new JiraCloudError(502,'JIRA_NETWORK','No fue posible conectar con Jira Cloud.',correlationId);
      }finally{clearTimeout(timer)}
    }
    throw new JiraCloudError(502,'JIRA_NETWORK','No fue posible conectar con Jira Cloud.',correlationId);
  }
  getCurrentUser(){return this.request<{accountId:string;displayName:string}>('/rest/api/3/myself')}
  getServerInfo(){return this.request<Record<string,unknown>>('/rest/api/3/serverInfo')}
  getProject(projectKey:string){return this.request<Record<string,unknown>>(`/rest/api/3/project/${encodeURIComponent(projectKey)}`)}
  getFields(){return this.request<Array<Record<string,unknown>>>('/rest/api/3/field')}
  getStatuses(){return this.request<Array<Record<string,unknown>>>('/rest/api/3/status')}
  getIssueTypes(){return this.request<Array<Record<string,unknown>>>('/rest/api/3/issuetype')}
  getBoards(projectKey:string){return this.request<{values:Record<string,unknown>[]}>(`/rest/agile/1.0/board?projectKeyOrId=${encodeURIComponent(projectKey)}&maxResults=50`)}
  getSprints(boardId:string){return this.request<{values:Record<string,unknown>[]}>(`/rest/agile/1.0/board/${encodeURIComponent(boardId)}/sprint?maxResults=50`)}
  getVersions(projectKey:string){return this.request<Array<Record<string,unknown>>>(`/rest/api/3/project/${encodeURIComponent(projectKey)}/versions`)}
  getComponents(projectKey:string){return this.request<Array<Record<string,unknown>>>(`/rest/api/3/project/${encodeURIComponent(projectKey)}/components`)}
  getUsers(){return this.request<Array<Record<string,unknown>>>('/rest/api/3/users/search?startAt=0&maxResults=1000')}
  async getProjects():Promise<JiraPage<Record<string,unknown>>>{
    const items:Record<string,unknown>[]=[];let startAt=0,pages=0,total=1;let correlationId='';let durationMs=0;
    while(startAt<total){const response=await this.request<{values:Record<string,unknown>[];total:number;isLast?:boolean}>(`/rest/api/3/project/search?startAt=${startAt}&maxResults=50`);correlationId=response.correlationId;durationMs+=response.durationMs;pages++;items.push(...(response.data.values??[]));total=response.data.total??items.length;if(response.data.isLast)break;startAt=items.length;}
    return {items,pagesProcessed:pages,truncated:false,partial:false,warnings:[],correlationId,durationMs};
  }
  async searchIssues(jql:string,fields:string[],limit=this.credentials.maxIssues):Promise<JiraPage<Record<string,unknown>>>{
    const items:Record<string,unknown>[]=[];const warnings:string[]=[];let nextPageToken:string|undefined;let pages=0,partial=false,correlationId='',durationMs=0;
    do{const params=new URLSearchParams({jql,maxResults:String(Math.min(100,limit-items.length)),fields:fields.join(',')});if(nextPageToken)params.set('nextPageToken',nextPageToken);
      try{const response=await this.request<{issues:Record<string,unknown>[];nextPageToken?:string;isLast?:boolean}>(`/rest/api/3/search/jql?${params}`);correlationId=response.correlationId;durationMs+=response.durationMs;pages++;items.push(...(response.data.issues??[]));nextPageToken=response.data.isLast?undefined:response.data.nextPageToken;if(!nextPageToken&&response.data.isLast===false){partial=true;warnings.push('Jira no devolvió cursor para continuar la paginación.');}}
      catch(error){if(items.length){partial=true;warnings.push(error instanceof JiraCloudError?error.message:'Una página no pudo recuperarse.');break}throw error;}
    }while(nextPageToken&&items.length<limit);
    return {items:items.slice(0,limit),pagesProcessed:pages,truncated:Boolean(nextPageToken)||items.length>limit,partial,warnings,correlationId,durationMs};
  }
}
