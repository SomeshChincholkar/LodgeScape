import express from "express"
import { protect } from "../middleware/auth.js"
import {
  register,
  login,
  getCurrentUser,
  updateUser,
  getUserListings,
  getWishlist,
  getUserWishList,
  addUserWishList,
} from "../controllers/userController.js"
import { googleAuth } from "../controllers/googleAuthController.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/google-auth", googleAuth) // Add Google auth endpoint
router.get("/me", protect, getCurrentUser)
router.put("/update", protect, updateUser)
router.get("/account/wishlist", protect, getWishlist)
router.get("/listings", protect, getUserListings)
router.get("/wishlist", protect, getUserWishList)
router.post("/wishlist", protect, addUserWishList)

export default router
