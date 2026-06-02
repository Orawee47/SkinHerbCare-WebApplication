import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Accept either MONGODB_URI (preferred) or legacy MONGO_URI
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoURI) {
      console.warn('⚠️ MONGODB_URI is not set — running in "no-db" degraded mode (endpoints using DB will return informative errors).');
      return;
    }

    console.log('📡 Connecting to MongoDB...');

    await mongoose.connect(mongoURI, {
      // Wait a short time for server selection so startup doesn't hang forever
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host} (${mongoose.connection.name})`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    if (error.code === 'ENOTFOUND' || /ENOTFOUND/i.test(error.message)) {
      console.error('👉 Tip: Check MongoDB Atlas Network Access (IP whitelist). Try allowing 0.0.0.0/0 temporarily while debugging.');
    }
    // Do NOT exit the process — keep server running in degraded mode so health checks and non-DB endpoints remain available
  }
};

export default connectDB;
