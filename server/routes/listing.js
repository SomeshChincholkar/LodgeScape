import express from "express"
import { protect } from "../middleware/auth.js"

import { getListings, getListing, addListing, 
  updateListing, deleteListing, getSuggestion } from "../controllers/listingController.js"

const router = express.Router()

// GET all listings with optional search
router.get("/", getListings)

// GET a single listing
router.get("/:id", getListing)

// POST a new listing
router.post("/", protect, addListing)

// UPDATE a listing
router.put("/:id", protect, updateListing)


// DELETE a listing
router.delete("/:id", protect, deleteListing)

// GET suggestions for search
router.get("/suggestions", getSuggestion)

export default router

