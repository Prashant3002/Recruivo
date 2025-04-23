import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  console.log('Testing database connection...');
  
  try {
    // Try both connection methods
    console.log('Trying dbConnect from lib/mongoose...');
    try {
      await dbConnect();
      console.log('Database connected successfully using dbConnect');
    } catch (err) {
      console.error('dbConnect failed:', err);
      
      // Try the alternative method
      console.log('Trying connectToDatabase from lib/mongodb...');
      await connectToDatabase();
      console.log('Database connected successfully using connectToDatabase');
    }
    
    // Check connection state
    const connectionState = mongoose.connection.readyState;
    const connectionStateString = 
      connectionState === 0 ? 'disconnected' :
      connectionState === 1 ? 'connected' :
      connectionState === 2 ? 'connecting' :
      connectionState === 3 ? 'disconnecting' : 'unknown';
    
    // Get DB info
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    
    // Check available collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    return NextResponse.json({
      success: true,
      connectionState: connectionStateString,
      readyState: connectionState,
      dbName,
      collections: collectionNames,
      connectedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 });
  }
} 