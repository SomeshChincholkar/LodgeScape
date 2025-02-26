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
        set: function(v) {
            // If the user provides an empty array or no images, return the default single image
            if (!v || v.length === 0) {
                return ["https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"];
            }
            return v; // Otherwise, return the provided images
        }
    },
    price: Number,
    location: String,
    country: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    
});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;