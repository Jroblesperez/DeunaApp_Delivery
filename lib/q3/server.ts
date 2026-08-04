import 'server-only';
import { isSemanticSnapshot, jiraSnapshotStore } from '@/lib/jira/store';
import { buildQ3Overview } from './model';
import { Q3_PROFILE_VERSION } from './config';
export async function loadQ3Overview() {
  const snapshot = await jiraSnapshotStore.latest();
  if (
    !isSemanticSnapshot(snapshot) ||
    snapshot.semanticProfileVersion !== Q3_PROFILE_VERSION
  )
    return null;
  return buildQ3Overview(snapshot);
}
