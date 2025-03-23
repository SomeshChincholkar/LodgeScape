import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    images: {
        type: [String], // Array of strings for multiple images
        default: ["https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"], // Default to a single image
        // Modify the setter to only apply when explicitly setting an empty array
        set: function(v) {
            // Only apply default if value is explicitly set to empty array
            if (Array.isArray(v) && v.length === 0) {
                return ["https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"];
            }
            // If we're getting undefined, don't change the value
            if (v === undefined) {
                return this.images;
            }
            return v; // Otherwise, return the provided images
        }
    },
    price: Number,
    location: String,      // city name
    country: String,
    locationCoOrdinates: {
        lat: Number,
        lng: Number,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    reviews: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Review", // Reference to reviews
        },
    ], 
});

const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);

export default Listing;