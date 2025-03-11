import express from "express"
import { protect } from "../middleware/auth.js"
import { createReview, getReviews, updateReview, deleteReview } from "../controllers/reviewController.js"


const router = express.Router();

// Routes for reviews
router.post("/", protect, createReview); // Create a review
router.get("/:listingId", getReviews); // Get reviews for a listing
router.put("/:id", protect, updateReview); // Update a review
router.delete("/:id", protect, deleteReview); // Delete a review

export default router
