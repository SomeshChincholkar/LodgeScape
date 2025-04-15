import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Share, Heart, ArrowLeft, Star, Edit, Trash2, Plus } from "lucide-react"
import LocationMap from "./LocationMap"

const API_BASE_URL = import.meta.env.VITE_API_URL

export default function ViewListing() {
  const [listing, setListing] = useState(null)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Get user from localStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }
        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Check if listing is in wishlist
  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (user && id) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/wishlist`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
          if (response.ok) {
            const data = await response.json()
            setIsWishlisted(data.wishlist.includes(id))
          }
        } catch (error) {
          console.error("Error fetching wishlist status:", error)
        }
      }
    }

    fetchWishlistStatus()
  }, [user, id])

  // Fetch listing and reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch listing
        const listingResponse = await fetch(`${API_BASE_URL}/api/listings/${id}`)
        if (!listingResponse.ok) throw new Error("Failed to fetch listing")
        const listingData = await listingResponse.json()
        setListing(listingData)

        // Fetch reviews
        const reviewsResponse = await fetch(`${API_BASE_URL}/api/reviews/${id}`)
        if (!reviewsResponse.ok) throw new Error("Failed to fetch reviews")
        const reviewsData = await reviewsResponse.json()
        setReviews(reviewsData)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error.message)
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  // Handle review button click - redirect to login if not authenticated
  const handleReviewButtonClick = () => {
    if (!user) {
      // Redirect to login page with a return_to parameter
      navigate(`/login?return_to=/listings/${id}`)
    } else {
      // Show review form for authenticated users
      setShowReviewForm(!showReviewForm)
    }
  }

  // Handle input change for review form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewReview({
      ...newReview,
      [name]: name === "rating" ? Number.parseInt(value) : value,
    })
  }

  // Submit new review
  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!user) {
      navigate(`/login?return_to=/listings/${id}`)
      return
    }

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listing: id,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit review")
      }

      const savedReview = await response.json()

      // Add the new review to the reviews list
      setReviews([
        ...reviews,
        {
          ...savedReview,
          user: {
            _id: user._id,
            username: user.username,
            gmail: user.gmail,
          },
        },
      ])

      // Reset the form
      setNewReview({
        rating: 0,
        comment: "",
      })

      // Hide the form after submission
      setShowReviewForm(false)
    } catch (error) {
      console.error("Error submitting review:", error)
      alert(error.message)
    }
  }

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete review")
      }

      // Remove the deleted review from the reviews list
      setReviews(reviews.filter((review) => review._id !== reviewId))
    } catch (error) {
      console.error("Error deleting review:", error)
      alert(error.message)
    }
  }

  // Update review
  const handleUpdateReview = async (reviewId, updatedData) => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update review")
      }

      const updatedReview = await response.json()

      // Update the review in the reviews list
      setReviews(
        reviews.map((review) =>
          review._id === reviewId
            ? {
                ...review,
                ...updatedReview,
                user: review.user, // Preserve the original user information
              }
            : review,
        ),
      )
    } catch (error) {
      console.error("Error updating review:", error)
      alert(error.message)
    }
  }

  // Edit review state
  const [editingReview, setEditingReview] = useState(null)
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: "",
  })

  // Start editing a review
  const startEditingReview = (review) => {
    setEditingReview(review._id)
    setEditForm({
      rating: review.rating,
      comment: review.comment,
    })
  }

  // Handle edit form input change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditForm({
      ...editForm,
      [name]: name === "rating" ? Number.parseInt(value) : value,
    })
  }

  // Submit edit form
  const handleSubmitEdit = async (e, reviewId) => {
    e.preventDefault()
    await handleUpdateReview(reviewId, editForm)
    setEditingReview(null)
  }

  // Handle Wishlist Toggle
  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate("/login")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ listingId: id }),
      })

      if (!response.ok) throw new Error("Failed to update wishlist")

      const data = await response.json()
      setIsWishlisted(data.wishlist.includes(id))
    } catch (error) {
      console.error("Error updating wishlist:", error)
    }
  }

  // Handle Share
  const handleShare = async () => {
    // Create a clean URL with just the essential parts
    const baseUrl = window.location.origin
    const cleanPath = `/listings/${id}`
    const shareUrl = `${baseUrl}${cleanPath}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title || "Check out this listing",
          text: `Check out this listing: ${listing?.title || ""}`,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
        // Fallback to clipboard
        copyToClipboard(shareUrl)
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      copyToClipboard(shareUrl)
    }
  }

  // Helper function to copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Link copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand("copy")
          alert("Link copied to clipboard!")
        } catch (err) {
          console.error("Failed to copy: ", err)
        }
        document.body.removeChild(textArea)
      })
  }

  if (loading) {
    return <div className="pt-28 px-8">Loading...</div>
  }

  if (!listing) {
    return <div className="pt-28 px-8">Listing not found</div>
  }

  if (showAllPhotos) {
    return (
      <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-20 pt-28">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowAllPhotos(false)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to listing
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {listing.images.map((image, index) => (
            <div key={index} className="relative h-[400px] overflow-hidden rounded-xl group">
              <img
                src={image || "/placeholder.svg"}
                alt={`${listing.title} - Image ${index + 1}`}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Calculate average rating
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  return (
    <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-20 pt-20 pb-16">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition mb-2">
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      {/* Title Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <div className="flex gap-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Share className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={handleWishlist}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 stroke-red-500" : ""}`} />
            {isWishlisted ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Image Grid */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 gap-2 h-[400px]">
          {/* Main Large Image */}
          <div className="col-span-2 row-span-2 relative overflow-hidden group">
            <img
              src={listing.images[0] || "/placeholder.svg"}
              alt={listing.title}
              className="object-cover w-full h-full rounded-l-xl transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {/* Right Side Images */}
          <div className="grid grid-cols-2 col-span-2 gap-2">
            {listing.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative h-[196px] overflow-hidden group">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${listing.title} - Image ${index + 2}`}
                  className={`object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 ${
                    index === 2 ? "rounded-tr-xl" : index === 3 ? "rounded-br-xl" : ""
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Show All Photos Button */}
          {listing.images.length > 5 && (
            <button
              onClick={() => setShowAllPhotos(true)}
              className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <div className="grid grid-cols-3 gap-0.5">
                <div className="w-1 h-1 bg-gray-900"></div>
                <div className="w-1 h-1 bg-gray-900"></div>
                <div className="w-1 h-1 bg-gray-900"></div>
                <div className="w-1 h-1 bg-gray-900"></div>
                <div className="w-1 h-1 bg-gray-900"></div>
                <div className="w-1 h-1 bg-gray-900"></div>
              </div>
              Show all photos
            </button>
          )}
        </div>
      </div>

      {/* Listing Details */}
      <div className="mt-6 max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4">
          {listing.location}, {listing.country}
        </h2>
        <p className="text-gray-600 mb-4">{listing.description}</p>
        <div className="border-t pt-4">
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold">&#8377;{listing.price}</span>
            <span className="text-gray-500 ml-2">night</span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-10 border-t pt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1 text-lg">
                <Star className="h-5 w-5 fill-current text-yellow-500" />
                <span>{averageRating.toFixed(1)}</span>
                <span className="text-gray-500">({reviews.length})</span>
              </div>
            )}
          </div>

          {/* Add Review Button - Show for all users */}
          <button
            onClick={handleReviewButtonClick}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition"
          >
            {showReviewForm ? (
              "Cancel"
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Review
              </>
            )}
          </button>
        </div>

        {/* Add Review Form - Only show if user is logged in and button is clicked */}
        {user && showReviewForm && (
          <div className="bg-gray-50 p-6 rounded-xl mb-8">
            <h3 className="text-lg font-medium mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newReview.rating ? "fill-current text-yellow-500" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={newReview.comment}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Submit Review
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-gray-500 italic">No reviews yet. Be the first to review!</div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-6">
                {editingReview === review._id ? (
                  // Edit Review Form
                  <form onSubmit={(e) => handleSubmitEdit(e, review._id)}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= editForm.rating ? "fill-current text-yellow-500" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="edit-comment" className="block text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        id="edit-comment"
                        name="comment"
                        value={editForm.comment}
                        onChange={handleEditInputChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      ></textarea>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingReview(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // Review Display
                  <>
                    <div className="flex justify-between">
                      <div className="flex gap-2 items-center mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-medium text-gray-700">
                            {review.user?.username?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{review.user?.username || "Unknown User"}</div>
                          <div className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {/* Edit/Delete buttons - Only show for review author */}
                      {user && user._id === review.user?._id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingReview(review)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? "fill-current text-yellow-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="text-gray-700">{review.comment}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* leaflet Map Location */}
      <div className="relative z-10">
        {listing.locationCoOrdinates?.lat && listing.locationCoOrdinates?.lng && (
          <LocationMap latitude={listing.locationCoOrdinates.lat} longitude={listing.locationCoOrdinates.lng} />
        )}
      </div>
    </div>
  )
}
