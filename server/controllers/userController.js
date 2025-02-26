import User from "../models/user.js"
import Listing from "../models/listing.js"

// Register user
export const register = async (req, res) => {
  try {
    const { username, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" })
    }

    // Create user
    const user = await User.create({
      username,
      password,
    })

    // Generate token
    const token = user.generateAuthToken()

    res.status(201).json({
      message: "Registration successful",
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Error in registration", error: error.message })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Check if user exists
    const user = await User.findOne({ username })

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = user.generateAuthToken()
    res.json({ token })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Error in login", error: error.message })
  }
}

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("user_listings")
      .populate("user_wishlist")
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message })
  }
}

// Update user
export const updateUser = async (req, res) => {
  try {
    const { gmail, phone_no, address } = req.body
    const user = await User.findById(req.user._id)

    if (gmail) user.gmail = gmail
    if (phone_no) user.phone_no = phone_no
    if (address) user.address = address

    await user.save()

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message })
  }
}

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("user_wishlist")
    res.json(user.user_wishlist)
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error: error.message })
  }
}

// Get user's listings
export const getUserListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id })
    res.json(listings)
  } catch (error) {
    res.status(500).json({ message: "Error fetching user listings", error: error.message })
  }
}

export const getUserWishList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("user_wishlist");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ wishlist: user.user_wishlist.map((listing) => listing._id.toString()) });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const addUserWishList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { listingId } = req.body;

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.user_wishlist.includes(listingId)) {
      user.user_wishlist.pull(listingId); // Remove if already exists
    } else {
      user.user_wishlist.push(listingId); // Add if not exists
    }

    await user.save();

    res.json({ wishlist: user.user_wishlist.map((id) => id.toString()) }); // Return updated wishlist
  } catch (error) {
    console.error("Error updating wishlist:", error);
    res.status(500).json({ error: "Server error" });
  }
};
