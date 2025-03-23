import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import mongoose from "mongoose";
import listingRouter from "./routes/listing.js"
import userRouter from "./routes/user.js"
import reviewRouter from "./routes/review.js"

const app = express();

dotenv.config()

const corsOptions = {
  origin: process.env.FRONTEND_URL, // Load from .env
  credentials: true, // Allow authentication headers & cookies
};

app.use(cors(corsOptions));

app.use(express.json());

const MONGO_URL = process.env.ATLASDB_URL

async function main(){
  await mongoose.connect(MONGO_URL)
}

main().then(()=>{
    console.log("connected to DB")
  }).catch(err =>{
    console.log(err)
  })


// Routes
app.use("/api/listings", listingRouter)
app.use("/api/users", userRouter)
app.use("/api/reviews", reviewRouter)

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// LodgeScape 6 - Added Map