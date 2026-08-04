import 'server-only';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { SemanticWorkItemV2 } from './live';
import type {
  MetadataCache,
  QualityFinding,
  SemanticMetrics,
  SnapshotDelta,
} from '@/lib/snapshot/live-engine';
import type {
  DatasetStatus,
  FieldSampleState,
  RelationshipStatus,
} from '@/lib/q3/acquisition';

export interface JiraSnapshotBase {
  organizationId: string;
  snapshotId: string;
  version: number;
  previousSnapshotId: string | null;
  syncMode: 'FULL' | 'INCREMENTAL';
  source: 'Jira Cloud';
  dataMode: 'LIVE';
  startedAt: string;
  completedAt: string;
  status: 'COMPLETED' | 'PARTIAL';
  projectsRequested: string[];
  projectsAccessible: string[];
  issuesProcessed: number;
  issuesChanged: number;
  pagesProcessed: number;
  truncated: boolean;
  coverage: number;
  warnings: string[];
  checkpoint: string;
  correlationId: string;
  durationMs: number;
  metadataVersion: string;
  deltas: unknown[];
  dataQuality: unknown[];
}
export interface LegacyJiraSnapshotRecord extends JiraSnapshotBase {
  schemaVersion?: 1;
  items: unknown[];
  metrics: Record<string, unknown>;
  historicalMetrics: unknown[];
}
export interface SemanticJiraSnapshotRecord extends JiraSnapshotBase {
  schemaVersion: 2;
  semanticProfileVersion?: string;
  datasets?: {
    portfolio: DatasetStatus;
    operational: DatasetStatus;
    relationships: RelationshipStatus;
    fieldDiscovery: Array<{
      id: string;
      name: string | null;
      schema: unknown;
      status: 'AVAILABLE' | 'MISSING_FIELD';
    }>;
    fieldSample: Record<string, FieldSampleState>;
  };
  items: SemanticWorkItemV2[];
  metrics: SemanticMetrics;
  deltas: SnapshotDelta[];
  dataQuality: QualityFinding[];
}
export type JiraSnapshotRecord =
  LegacyJiraSnapshotRecord | SemanticJiraSnapshotRecord;
export const isSemanticSnapshot = (
  snapshot: JiraSnapshotRecord | null,
): snapshot is SemanticJiraSnapshotRecord => snapshot?.schemaVersion === 2;
const directory = path.join(process.cwd(), '.flowos-live');
const file = path.join(directory, 'jira-snapshots.json');
export class JiraSnapshotStore {
  async history(): Promise<JiraSnapshotRecord[]> {
    try {
      return JSON.parse(await readFile(file, 'utf8')) as JiraSnapshotRecord[];
    } catch {
      return [];
    }
  }
  async latest() {
    return (
      (await this.history()).find(
        (x) =>
          x.dataMode === 'LIVE' && ['COMPLETED', 'PARTIAL'].includes(x.status),
      ) ?? null
    );
  }
  async latestSemantic() {
    return (
      (await this.history()).find(
        (x): x is SemanticJiraSnapshotRecord =>
          x.dataMode === 'LIVE' &&
          x.schemaVersion === 2 &&
          ['COMPLETED', 'PARTIAL'].includes(x.status),
      ) ?? null
    );
  }
  async save(snapshot: JiraSnapshotRecord) {
    await mkdir(directory, { recursive: true });
    const history = await this.history();
    await writeFile(
      file,
      JSON.stringify([snapshot, ...history].slice(0, 20), null, 2),
      'utf8',
    );
    return snapshot;
  }
  async saveMetadata(metadata: MetadataCache) {
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, 'jira-metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf8',
    );
    return metadata;
  }
  async metadata(): Promise<MetadataCache | null> {
    try {
      return JSON.parse(
        await readFile(path.join(directory, 'jira-metadata.json'), 'utf8'),
      ) as MetadataCache;
    } catch {
      return null;
    }
  }
}
export const jiraSnapshotStore = new JiraSnapshotStore();
