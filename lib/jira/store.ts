import 'server-only';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import type {FlowOsWorkItem} from './live';
import type {MetadataCache} from '@/lib/snapshot/live-engine';

export interface JiraSnapshotRecord{organizationId:string;snapshotId:string;version:number;previousSnapshotId:string|null;syncMode:'FULL'|'INCREMENTAL';source:'Jira Cloud';dataMode:'LIVE';startedAt:string;completedAt:string;status:'COMPLETED'|'PARTIAL';projectsRequested:string[];projectsAccessible:string[];issuesProcessed:number;issuesChanged:number;pagesProcessed:number;truncated:boolean;coverage:number;warnings:string[];checkpoint:string;correlationId:string;durationMs:number;items:FlowOsWorkItem[];metrics:Record<string,unknown>;metadataVersion:string;deltas:unknown[];historicalMetrics:unknown[];dataQuality:unknown[]}
const directory=path.join(process.cwd(),'.flowos-live');const file=path.join(directory,'jira-snapshots.json');
export class JiraSnapshotStore{
  async history():Promise<JiraSnapshotRecord[]>{try{return JSON.parse(await readFile(file,'utf8')) as JiraSnapshotRecord[]}catch{return[]}}
  async latest(){return (await this.history()).find(x=>x.dataMode==='LIVE'&&['COMPLETED','PARTIAL'].includes(x.status))??null}
  async save(snapshot:JiraSnapshotRecord){await mkdir(directory,{recursive:true});const history=await this.history();await writeFile(file,JSON.stringify([snapshot,...history].slice(0,20),null,2),'utf8');return snapshot}
  async saveMetadata(metadata:MetadataCache){await mkdir(directory,{recursive:true});await writeFile(path.join(directory,'jira-metadata.json'),JSON.stringify(metadata,null,2),'utf8');return metadata}
  async metadata():Promise<MetadataCache|null>{try{return JSON.parse(await readFile(path.join(directory,'jira-metadata.json'),'utf8')) as MetadataCache}catch{return null}}
}
export const jiraSnapshotStore=new JiraSnapshotStore();
