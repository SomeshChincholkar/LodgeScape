import Review from "../models/review.js";
import Listing from "../models/listing.js";
import User from "../models/user.js";

// Create a review
export const createReview = async (req, res) => {
  try {
    const { listing, rating, comment } = req.body;

    if (!listing || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newReview = new Review({
      user: req.user.id,
      listing,
      rating,
      comment,
    });

    const savedReview = await newReview.save();

    // Add review to listing
    await Listing.findByIdAndUpdate(listing, { $push: { reviews: savedReview._id } });

    // Add review to user
    await User.findByIdAndUpdate(req.user.id, { $push: { user_reviews: savedReview._id } });

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get reviews for a listing
export const getReviews = async (req, res) => {
  try {
    const { listingId } = req.params;
    const reviews = await Review.find({ listing: listingId }).populate("user", "username gmail");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Ensure only the owner can update
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Ensure only the owner can delete
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Remove review from listing
    await Listing.findByIdAndUpdate(review.listing, { $pull: { reviews: req.params.id } });

    // Remove review from user
    await User.findByIdAndUpdate(review.user, { $pull: { user_reviews: req.params.id } });

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
