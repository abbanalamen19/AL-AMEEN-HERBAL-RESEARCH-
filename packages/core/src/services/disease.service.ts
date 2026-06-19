import type { Disease } from '@apri/schemas';
import { getAdminDb } from '../firebase/admin';
import { SEED_DISEASES } from '../data/seed';

const COLLECTION = 'diseases';

export const diseaseService = {
  async list(limit = 20): Promise<Disease[]> {
    const db = getAdminDb();
    if (!db) return SEED_DISEASES.slice(0, limit);
    const snap = await db
      .collection(COLLECTION)
      .where('status', '==', 'published')
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data() as Disease);
  },

  async get(id: string): Promise<Disease | null> {
    const db = getAdminDb();
    if (!db) return SEED_DISEASES.find((d) => d.id === id) ?? null;
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? (doc.data() as Disease) : null;
  },
};
