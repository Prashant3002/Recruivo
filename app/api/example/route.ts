import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'

export async function GET() {
  try {
    const collection = await getCollection('users')
    const users = await collection.find({}).toArray()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Database Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const collection = await getCollection('users')
    const result = await collection.insertOne(body)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error('Database Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 