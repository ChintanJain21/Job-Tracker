import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

// Don't throw error during build time, only at runtime
if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.warn('Warning: MONGODB_URI is not defined in .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // Check for URI at runtime
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }
  
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default connectToDatabase;
