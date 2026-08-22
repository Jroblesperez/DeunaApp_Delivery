export interface AtlassianTokenReference{vaultReference:string;expiresAt:string;scopes:string[]}
export interface AtlassianOAuthClient{authorizationUrl(state:string):Promise<string>;exchange(code:string):Promise<AtlassianTokenReference>;refresh(reference:string):Promise<AtlassianTokenReference>;revoke(reference:string):Promise<void>}
export interface AtlassianCloudSiteService{accessibleSites(reference:string):Promise<{id:string;url:string;name:string}[]>}
export interface AtlassianProductDiscoveryService{ideas(cloudId:string,cursor?:string):Promise<{data:unknown[];nextCursor?:string}>}
export interface AtlassianConnectionService{connect(input:{cloudId:string;siteUrl:string;credentialReference:string}):Promise<void>;disconnect(cloudId:string):Promise<void>}
export interface AtlassianPermissionService{verify(cloudId:string,scopes:string[]):Promise<{granted:string[];missing:string[]}>}
export interface AtlassianHealthService{check(cloudId:string):Promise<{status:'HEALTHY'|'DEGRADED'|'ERROR';latencyMs:number;checkedAt:string}>}
