import Listing from "../models/listing.js"
import User from "../models/user.js"

// GET all listings with optional search
export const getListings = async (req, res) => {
  try {
    const { search } = req.query
    let query = {}

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { country: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }
    }

    const listings = await Listing.find(query)
    res.json(listings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


// GET a single listing
export const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (listing == null) {
      return res.status(404).json({ message: "Listing not found" })
    }
    res.json(listing)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


// POST a new listing 
export const addListing = async (req, res) => {
  try {
    // Parse the JSON data from the request
    const listingData = JSON.parse(req.body.listingData)

    // Extract fields from the parsed data
    const { title, description, price, location, country, locationCoOrdinates } = listingData

    // Upload images to Cloudinary and store URLs
    const imageUrls = req.files.map((file) => file.path)

    const listing = new Listing({
      title,
      description,
      images: imageUrls,
      price,
      location,
      country,
      locationCoOrdinates, // This will now be a proper object with lat and lng
      owner: req.user._id,
    })

    // console.log("Creating listing with data:", listing) // Debug log

    // Save the listing
    const newListing = await listing.save()

    // Add listing reference to the user's document
    await User.findByIdAndUpdate(req.user._id, {
      $push: { user_listings: newListing._id },
    })

    res.status(201).json(newListing)
  } catch (error) {
    console.error("Error in addListing:", error)
    res.status(400).json({ message: error.message })
  }
}


export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" })
    }

    // Check ownership
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this listing" })
    }

    // Parse the JSON data from the request if it exists
    let listingData = {}
    if (req.body.listingData) {
      listingData = JSON.parse(req.body.listingData)
    } else {
      // If no JSON data, use the regular form fields
      const { title, description, price, location, country } = req.body
      listingData = { title, description, price, location, country }
    }

    // Create an update object that only includes fields being modified
    const updateData = {}

    // Only add fields to updateData if they are provided in the request
    if (listingData.title) updateData.title = listingData.title
    if (listingData.description !== undefined) updateData.description = listingData.description
    if (listingData.price !== undefined) updateData.price = Number(listingData.price)
    if (listingData.location) updateData.location = listingData.location
    if (listingData.country) updateData.country = listingData.country

    // Handle location coordinates if provided
    if (listingData.locationCoOrdinates && listingData.locationCoOrdinates.lat && listingData.locationCoOrdinates.lng) {
      updateData.locationCoOrdinates = {
        lat: listingData.locationCoOrdinates.lat,
        lng: listingData.locationCoOrdinates.lng,
      }
    }

    // Handle image updates
    // Check if we have existing images in the request
    const existingImages = req.body.existingImages || []

    // Get new image URLs if files were uploaded
    const newImageUrls = req.files ? req.files.map((file) => file.path) : []

    // Combine existing and new images
    if (existingImages.length > 0 || newImageUrls.length > 0) {
      // If existingImages is a string (single image), convert to array
      const existingImagesArray = Array.isArray(existingImages) ? existingImages : [existingImages]
      updateData.images = [...existingImagesArray, ...newImageUrls]
    }

    // Use findByIdAndUpdate with $set to only update specific fields
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    )

    res.json(updatedListing)
  } catch (error) {
    console.error("Update listing error:", error)
    res.status(400).json({ message: error.message })
  }
}


// DELETE a listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" })
    }

    // Check if the user is the owner of the listing
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this listing" })
    }
    
    // Remove listing reference from user's user_listings array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { user_listings: listing._id }
    });

    // Now, delete the listing from the Listing collection
    await listing.deleteOne();
    res.json({ message: "Listing deleted successfully" })
  } catch (error) {
    console.log("HI")
    res.status(500).json({ message: error.message })
  }
}


// GET suggestions for search
export const getSuggestion = async (req, res) => {
  try {
    const { search } = req.query
    if (!search) {
      return res.json([])
    }

    const suggestions = await Listing.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          titles: { $addToSet: "$title" },
          locations: { $addToSet: "$location" },
          countries: { $addToSet: "$country" },
        },
      },
      {
        $project: {
          _id: 0,
          suggestions: {
            $setUnion: ["$titles", "$locations", "$countries"],
          },
        },
      },
    ])

    res.json(suggestions.length > 0 ? suggestions[0].suggestions : [])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

