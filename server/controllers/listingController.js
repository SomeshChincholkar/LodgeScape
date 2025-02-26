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

  const listing = new Listing({
    title: req.body.title,
    description: req.body.description,
    images: req.body.images,
    price: req.body.price,
    location: req.body.location,
    country: req.body.country,
    owner: req.user._id,
  })

  try {
     // 1. add to listings
    const newListing = await listing.save()         

    // 2. Add the listing to the user's `user_listings` array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { user_listings: newListing._id } },
      { new: true }
    );    
    res.status(201).json(newListing)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}


// UPDATE a listing
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" })
    }

    // Check if the user is the owner of the listing
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this listing" })
    }

    const { title, description, images, price, location, country } = req.body

    if (title) listing.title = title
    if (description) listing.description = description
    if (images) listing.images = images
    if (price) listing.price = price
    if (location) listing.location = location
    if (country) listing.country = country

    const updatedListing = await listing.save()
    res.json(updatedListing)
  } catch (error) {
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

