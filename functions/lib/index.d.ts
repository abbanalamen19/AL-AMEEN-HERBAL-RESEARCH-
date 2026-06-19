export declare const onPlantWrite: import("firebase-functions/v2/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v1").Change<import("firebase-functions/v2/firestore").DocumentSnapshot> | undefined, {
    plantId: string;
}>>;
export declare const marketIngest: import("firebase-functions/v2/scheduler").ScheduleFunction;
