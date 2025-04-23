import { MongoClient } from 'mongodb'
import clientPromise from './mongodb'

export async function getCollection(collectionName: string) {
  const client = await clientPromise
  const db = client.db()
  return db.collection(collectionName)
}

export async function connectToDatabase() {
  try {
    const client = await clientPromise
    const db = client.db()
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    throw new Error('Unable to connect to the database')
  }
} 