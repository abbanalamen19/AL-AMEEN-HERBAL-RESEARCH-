import type { CreatePlantInput, Plant } from '@apri/schemas';
import { getAdminDb } from '../firebase/admin';
import { SEED_PLANTS } from '../data/seed';

const COLLECTION = 'plants';

function buildKeywords(p: Pick<Plant, 'name' | 'scientificName' | 'synonyms'>): string[] {
  return [p.name.ha, p.name.en, p.scientificName, ...(p.synonyms ?? [])]
    .filter(Boolean)
    .map((s) => s.toLowerCase());
}

/** Plant domain service. Uses Firestore when configured; otherwise seed data. */
export const plantService = {
  async list(opts: { query?: string; family?: string; limit?: number } = {}): Promise<Plant[]> {
    const db = getAdminDb();
    const limit = opts.limit ?? 20;

    if (!db) {
      return filterSeed(SEED_PLANTS, opts).slice(0, limit);
    }

    let ref = db.collection(COLLECTION).where('status', '==', 'published').limit(limit);
    if (opts.family) ref = ref.where('family', '==', opts.family);
    const snap = await ref.get();
    const plants = snap.docs.map((d) => d.data() as Plant);
    return opts.query ? filterSeed(plants, opts) : plants;
  },

  async get(id: string): Promise<Plant | null> {
    const db = getAdminDb();
    if (!db) return SEED_PLANTS.find((p) => p.id === id) ?? null;
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? (doc.data() as Plant) : null;
  },

  async create(input: CreatePlantInput, userId: string): Promise<Plant> {
    const db = getAdminDb();
    const now = new Date().toISOString();
    const id = slug(input.scientificName);
    const plant: Plant = {
      ...input,
      id,
      searchKeywords: buildKeywords(input),
      status: input.status ?? 'draft',
      audit: { createdAt: now, updatedAt: now, createdBy: userId, updatedBy: userId, version: 1 },
    };
    if (!db) return plant;
    await db.collection(COLLECTION).doc(id).set(plant);
    return plant;
  },
};

function filterSeed(
  plants: Plant[],
  opts: { query?: string; family?: string },
): Plant[] {
  let out = plants;
  if (opts.family) out = out.filter((p) => p.family === opts.family);
  if (opts.query) {
    const q = opts.query.toLowerCase();
    out = out.filter((p) => buildKeywords(p).some((k) => k.includes(q)));
  }
  return out;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
