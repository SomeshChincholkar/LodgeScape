import express from "express"
import { protect } from "../middleware/auth.js"

import { getListings, getListing, addListing, 
  updateListing, deleteListing, getSuggestion } from "../controllers/listingController.js"

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Multer to store images in Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "LodgeScape", // Cloudinary folder name
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });  


const router = express.Router()

// GET all listings with optional search
router.get("/", getListings)

// GET a single listing
router.get("/:id", getListing)

// POST a new listing
router.post("/", protect, upload.array("images", 5), addListing)

// UPDATE a listing
router.put("/:id", protect, upload.array("images", 5), updateListing)

// DELETE a listing
router.delete("/:id", protect, deleteListing)

// GET suggestions for search
router.get("/suggestions", getSuggestion)

export default router

