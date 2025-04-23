import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { adminDb } from './firebase-admin';

/**
 * Get a document by ID from a collection
 */
export async function getById(collectionName: string, id: string) {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return {
    id: docSnap.id,
    ...docSnap.data()
  };
}

/**
 * Find documents in a collection with a filter
 */
export async function find(
  collectionName: string, 
  filters: Record<string, any> = {}, 
  options: {
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
    startAfter?: QueryDocumentSnapshot<DocumentData>;
  } = {}
) {
  const collectionRef = collection(db, collectionName);
  
  // Build query constraints
  const constraints: QueryConstraint[] = [];
  
  // Add filters
  Object.entries(filters).forEach(([field, value]) => {
    if (value !== undefined && value !== null) {
      constraints.push(where(field, '==', value));
    }
  });
  
  // Add ordering
  if (options.orderByField) {
    constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
  }
  
  // Add pagination
  if (options.limit) {
    constraints.push(limit(options.limit));
  }
  
  if (options.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }
  
  // Execute query
  const q = query(collectionRef, ...constraints);
  const querySnapshot = await getDocs(q);
  
  // Transform results
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Create a new document in a collection
 */
export async function create(collectionName: string, data: Record<string, any>) {
  // Add timestamps
  const docData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, collectionName), docData);
  
  return {
    id: docRef.id,
    ...docData
  };
}

/**
 * Update a document by ID
 */
export async function updateById(collectionName: string, id: string, data: Record<string, any>) {
  const docRef = doc(db, collectionName, id);
  
  // Add updated timestamp
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(docRef, updateData);
  
  // Get the updated document
  const updatedDoc = await getDoc(docRef);
  
  return {
    id: updatedDoc.id,
    ...updatedDoc.data()
  };
}

/**
 * Delete a document by ID
 */
export async function deleteById(collectionName: string, id: string) {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
  return { id };
}

/**
 * Helper to convert Firestore timestamps to dates in document data
 */
export function convertTimestamps(data: Record<string, any>): Record<string, any> {
  const result = { ...data };
  
  Object.entries(result).forEach(([key, value]) => {
    // Check if the value is a Firestore timestamp
    if (value instanceof Timestamp) {
      result[key] = value.toDate();
    } 
    // Check if it's an object that might contain timestamps
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = convertTimestamps(value);
    }
    // Check if it's an array that might contain objects with timestamps
    else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        item && typeof item === 'object' 
          ? convertTimestamps(item) 
          : item
      );
    }
  });
  
  return result;
} 