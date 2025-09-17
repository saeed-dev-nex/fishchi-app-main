import mongoose from 'mongoose';
const db_URI = process.env.MONGODB_URI;
console.log(db_URI);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
