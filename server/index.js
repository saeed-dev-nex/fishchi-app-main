import app from './src/app.js';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';


// Load environment variables from .env file
dotenv.config();

// Call database
connectDB();
// define port var for run server
const PORT = process.env.PORT || 5000;

// run server on PORT
app.listen(PORT, () =>
  console.log(`سرور (ESM) با موفقیت روی پورت ${PORT} در حال اجراست.`)
);
