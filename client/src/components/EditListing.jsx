import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { X, MapPin } from "lucide-react"
import LocationSelectorMap from "./LocationSelectorMap"

const API_BASE_URL = import.meta.env.VITE_API_URL

export default function EditListing() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [submitLoading, setSubmitLoading] = useState(false)
  const [imagesModified, setImagesModified] = useState(false)
  const [mapVisible, setMapVisible] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch listing")
        }
        const data = await response.json()
        setListing(data)
        setExistingImages(data.images || [])
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [id, token])

  // Handle file selection for new images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setNewImages([...newImages, ...files])
    setImagesModified(true)
  }

  // Remove a new image
  const removeNewImage = (index) => {
    const updatedImages = [...newImages]
    updatedImages.splice(index, 1)
    setNewImages(updatedImages)
    setImagesModified(true)
  }

  // Remove an existing image
  const removeExistingImage = (index) => {
    const updatedImages = [...existingImages]
    updatedImages.splice(index, 1)
    setExistingImages(updatedImages)
    setImagesModified(true)
  }

  // Handle location selection from map
  const handleLocationSelect = (coordinates) => {
    console.log("Selected coordinates:", coordinates) // Debug log

    // Update the listing's locationCoOrdinates
    setListing((prevListing) => ({
      ...prevListing,
      locationCoOrdinates: coordinates,
    }))
  }

  // Listen for location name events from the map component
  useEffect(() => {
    const handleLocationNameFetched = (event) => {
      const { city, country } = event.detail

      // Only update location and country if they're empty or if user confirms
      setListing((prevListing) => {
        // If location and country are already filled, ask before overwriting
        if (prevListing.location && prevListing.country) {
          // Only ask if the values are different
          if (prevListing.location !== city || prevListing.country !== country) {
            const shouldUpdate = window.confirm(
              `Would you like to update the location from "${prevListing.location}, ${prevListing.country}" to "${city}, ${country}"?`,
            )

            if (shouldUpdate) {
              return {
                ...prevListing,
                location: city || prevListing.location,
                country: country || prevListing.country,
              }
            }
            return prevListing
          }
          return prevListing
        }

        // If fields are empty, update without asking
        return {
          ...prevListing,
          location: city || prevListing.location,
          country: country || prevListing.country,
        }
      })
    }

    document.addEventListener("locationNameFetched", handleLocationNameFetched)

    return () => {
      document.removeEventListener("locationNameFetched", handleLocationNameFetched)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    setError("")

    // Validate coordinates if map was used
    if (mapVisible && (!listing.locationCoOrdinates?.lat || !listing.locationCoOrdinates?.lng)) {
      setError("Please select a location on the map")
      setSubmitLoading(false)
      return
    }

    try {
      // Create a FormData object for the request
      const formDataToSend = new FormData()

      // Create a regular object for the listing data
      const listingData = {
        title: listing.title,
        description: listing.description || "",
        price: Number(listing.price),
        location: listing.location,
        country: listing.country,
        locationCoOrdinates: listing.locationCoOrdinates,
      }

      // Add the JSON data as a string
      formDataToSend.append("listingData", JSON.stringify(listingData))

      // Handle existing images - append each one individually
      if (imagesModified) {
        existingImages.forEach((imageUrl) => {
          formDataToSend.append("existingImages", imageUrl)
        })

        // Append all new image files
        newImages.forEach((file) => {
          formDataToSend.append("images", file)
        })
      }

      const response = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update listing")
      }

      navigate(`/listings/${id}`)
    } catch (error) {
      console.error("Update error:", error)
      setError(error.message || "Failed to update listing. Please try again.")
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (!listing) return <div className="text-red-500 text-center mt-10">Listing not found</div>

  return (
    <div className="pb-20">
      <div className="max-w-4xl mx-auto px-8 sm:px-10 lg:px-20 pt-20">
        <h1 className="text-3xl font-semibold mb-8">Edit Your Listing</h1>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              required
              value={listing.title}
              onChange={(e) => setListing({ ...listing, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              disabled={submitLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={listing.description || ""}
              onChange={(e) => setListing({ ...listing, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent h-32"
              disabled={submitLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Existing Images</label>
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {existingImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={`Listing ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder-image.jpg" // Fallback image
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-700 hover:text-red-500"
                      disabled={submitLoading}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic mb-4">No existing images</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add New Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              accept="image/*"
              disabled={submitLoading}
            />
            <div className="mt-3 space-y-2">
              {newImages.map((file, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    disabled={submitLoading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price per night *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                required
                min="0"
                value={listing.price}
                onChange={(e) => setListing({ ...listing, price: e.target.value })}
                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                disabled={submitLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <input
              type="text"
              required
              value={listing.location}
              onChange={(e) => setListing({ ...listing, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              disabled={submitLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
            <input
              type="text"
              required
              value={listing.country}
              onChange={(e) => setListing({ ...listing, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              disabled={submitLoading}
            />
          </div>

          {/* Map Location Selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Location on Map *</label>
              <button
                type="button"
                onClick={() => setMapVisible(!mapVisible)}
                className="text-sm text-rose-600 hover:text-rose-700"
                disabled={submitLoading}
              >
                {mapVisible ? "Hide Map" : "Show Map"}
              </button>
            </div>

            {mapVisible && (
              <LocationSelectorMap
                onLocationSelect={handleLocationSelect}
                initialCoordinates={
                  listing.locationCoOrdinates?.lat && listing.locationCoOrdinates?.lng
                    ? listing.locationCoOrdinates
                    : null
                }
              />
            )}

            {listing.locationCoOrdinates?.lat && listing.locationCoOrdinates?.lng && (
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <MapPin className="h-4 w-4" />
                <span>
                  Location selected: {listing.locationCoOrdinates.lat.toFixed(6)},{" "}
                  {listing.locationCoOrdinates.lng.toFixed(6)}
                </span>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitLoading}
              className={`w-full ${
                submitLoading ? "bg-rose-400 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700"
              } text-white py-3 rounded-lg transition`}
            >
              {submitLoading ? "Updating..." : "Update Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

