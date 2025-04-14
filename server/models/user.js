import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: function () {
      return !this.googleId // Only required for non-Google users
    },
    unique: true,
    sparse: true, // Allows multiple null values
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId // Only required for non-Google users
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  gmail: {
    type: String,
    default: null,
  },
  joining_date: {
    type: Date,
    default: Date.now,
  },
  user_listings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
  user_reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  user_wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
  phone_no: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: null,
  },
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false
  return await bcrypt.compare(candidatePassword, this.password)
}

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

const User = mongoose.model("User", userSchema)

export default User
