import {normalizeStatus} from '../metrics';
export interface JiraIssue{key:string;fields:Record<string,unknown>;changelog?:unknown[]}
export interface JiraClient{search(jql:string,startAt:number,maxResults:number):Promise<{issues:JiraIssue[];total:number}>;getIssue(key:string):Promise<JiraIssue>}
export class JiraIssueMapper{map(issue:JiraIssue){return {sourceSystem:'JIRA',sourceIssueKey:issue.key,sourceStatus:String(issue.fields.status??''),status:normalizeStatus(String(issue.fields.status??''))}}}
export class JiraStatusNormalizer{normalize=normalizeStatus}
export class JiraPaginationService{constructor(private client:JiraClient){} async all(jql:string,pageSize=50){const out:JiraIssue[]=[];let start=0,total=1;while(start<total){const page=await this.client.search(jql,start,pageSize);out.push(...page.issues);total=page.total;start+=pageSize}return out}}
export class JiraDataSourceAdapter{readonly mode='READ_ONLY';constructor(private client:JiraClient){}async initiatives(jql:string){return new JiraPaginationService(this.client).all(jql)}}

export type JiraServiceResult<T>={data:T;coverage:number;warnings:string[];checkpoint?:string};
export interface JiraConnectionService{health(signal?:AbortSignal):Promise<{status:string;latencyMs:number}>}
export interface JiraMetadataService{projects(signal?:AbortSignal):Promise<JiraServiceResult<unknown[]>>;issueTypes(projectKey:string):Promise<JiraServiceResult<unknown[]>>}
export interface JiraProjectService{selectedProjects():Promise<JiraServiceResult<unknown[]>>}
export interface JiraIssueService{changedSince(checkpoint:string,pageSize?:number,signal?:AbortSignal):Promise<JiraServiceResult<JiraIssue[]>>}
export interface JiraChangelogService{forIssues(keys:string[],signal?:AbortSignal):Promise<JiraServiceResult<unknown[]>>}
export interface JiraBoardService{boards(projectKey:string):Promise<JiraServiceResult<unknown[]>>}
export interface JiraSprintService{sprints(boardId:string):Promise<JiraServiceResult<unknown[]>>}
export interface JiraReleaseService{versions(projectKey:string):Promise<JiraServiceResult<unknown[]>>}
export interface JiraFieldService{fields():Promise<JiraServiceResult<unknown[]>>}
export interface JiraUserService{users(cursor?:string):Promise<JiraServiceResult<unknown[]>>}
export interface JiraTeamResolver{resolve(issue:JiraIssue):string|undefined}
export interface JiraRiskResolver{resolve(issue:JiraIssue):{severity?:string;factor?:string}}
export interface JiraProductDiscoveryResolver{resolve(issue:JiraIssue):{impact?:string;confidence?:number}}
