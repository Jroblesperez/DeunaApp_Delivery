import {normalizeStatus} from '../metrics';
export interface JiraIssue{key:string;fields:Record<string,unknown>;changelog?:unknown[]}
export interface JiraClient{search(jql:string,startAt:number,maxResults:number):Promise<{issues:JiraIssue[];total:number}>;getIssue(key:string):Promise<JiraIssue>}
export class JiraIssueMapper{map(issue:JiraIssue){return {sourceSystem:'JIRA',sourceIssueKey:issue.key,sourceStatus:String(issue.fields.status??''),status:normalizeStatus(String(issue.fields.status??''))}}}
export class JiraStatusNormalizer{normalize=normalizeStatus}
export class JiraPaginationService{constructor(private client:JiraClient){} async all(jql:string,pageSize=50){const out:JiraIssue[]=[];let start=0,total=1;while(start<total){const page=await this.client.search(jql,start,pageSize);out.push(...page.issues);total=page.total;start+=pageSize}return out}}
export class JiraDataSourceAdapter{readonly mode='READ_ONLY';constructor(private client:JiraClient){}async initiatives(jql:string){return new JiraPaginationService(this.client).all(jql)}}
