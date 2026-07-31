import {roleCanAccess} from '../metrics'; import type {Role} from '../types';
export const demoSession={user:{id:'usr-demo-exec',name:'Valentina C.',role:'EXECUTIVE' as Role,scope:'ORGANIZATION'},expires:'2026-12-31T23:59:59Z'};
export function authorize(role:Role,resource:string){return roleCanAccess(role,resource)}
