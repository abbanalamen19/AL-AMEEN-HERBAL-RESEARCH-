"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketIngest = exports.onPlantWrite = void 0;
/**
 * APRI Cloud Functions (2nd gen).
 *
 * - onPlantWrite: maintain search keywords + audit log + trigger embedding indexing.
 * - marketIngest: scheduled ingestion of herb market prices (stub).
 *
 * Heavy AI/embedding work calls the shared ai-gateway in production; kept as a
 * clearly-marked TODO here so the function set deploys cleanly from day one.
 */
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
if (!(0, app_1.getApps)().length)
    (0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
exports.onPlantWrite = (0, firestore_2.onDocumentWritten)('plants/{plantId}', async (event) => {
    const after = event.data?.after.data();
    if (!after)
        return;
    await db.collection('audit_logs').add({
        actorId: after.audit?.updatedBy ?? 'system',
        action: event.data?.before.exists ? 'plant.update' : 'plant.create',
        resourceType: 'plant',
        resourceId: event.params.plantId,
        at: new Date().toISOString(),
    });
    // TODO: enqueue embedding generation via Pub/Sub -> embeddings/{id}.
    firebase_functions_1.logger.info('plant write processed', { plantId: event.params.plantId });
});
exports.marketIngest = (0, scheduler_1.onSchedule)('every 24 hours', async () => {
    // TODO: pull market price feeds and upsert into market_data.
    firebase_functions_1.logger.info('market ingest tick');
});
//# sourceMappingURL=index.js.map