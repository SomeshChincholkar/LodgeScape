import { OAuth2Client } from "google-auth-library"
import User from "../models/user.js"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Google login/signup handler
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: "Token is required" })
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const googleId = payload.sub
    const email = payload.email
    const name = payload.name
    const profilePicture = payload.picture

    // Check if user exists
    let user = await User.findOne({ googleId })

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        googleId,
        email,
        gmail: email,
        name,
        profilePicture,
      })
    } else {
      // Update user info if needed
      user.name = name
      user.profilePicture = profilePicture
      await user.save()
    }

    // Generate JWT token
    const jwtToken = user.generateAuthToken()

    res.status(200).json({
      token: jwtToken,
    })
  } catch (error) {
    console.error("Google auth error:", error)
    res.status(500).json({ message: "Error in Google authentication", error: error.message })
  }
}
