/**
 * APRI Cloud Functions (2nd gen).
 *
 * - onPlantWrite: maintain search keywords + audit log + trigger embedding indexing.
 * - marketIngest: scheduled ingestion of herb market prices (stub).
 *
 * Heavy AI/embedding work calls the shared ai-gateway in production; kept as a
 * clearly-marked TODO here so the function set deploys cleanly from day one.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

if (!getApps().length) initializeApp();
const db = getFirestore();

export const onPlantWrite = onDocumentWritten('plants/{plantId}', async (event) => {
  const after = event.data?.after.data();
  if (!after) return;

  await db.collection('audit_logs').add({
    actorId: after.audit?.updatedBy ?? 'system',
    action: event.data?.before.exists ? 'plant.update' : 'plant.create',
    resourceType: 'plant',
    resourceId: event.params.plantId,
    at: new Date().toISOString(),
  });

  // TODO: enqueue embedding generation via Pub/Sub -> embeddings/{id}.
  logger.info('plant write processed', { plantId: event.params.plantId });
});

export const marketIngest = onSchedule('every 24 hours', async () => {
  // TODO: pull market price feeds and upsert into market_data.
  logger.info('market ingest tick');
});
