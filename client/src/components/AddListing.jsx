import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { X, MapPin } from "lucide-react"
import LocationSelectorMap from "./LocationSelectorMap"

const API_BASE_URL = import.meta.env.VITE_API_URL // Backend URL

export default function AddListing() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") // Ensure the token exists
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [],
    price: "",
    location: "",
    country: "",
    locationCoOrdinates: {
      lat: null,
      lng: null,
    },
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mapVisible, setMapVisible] = useState(true) // Set to true by default to encourage users to select location

  // Handle file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData({ ...formData, images: [...formData.images, ...files] })
  }

  // Remove an image
  const removeImage = (index) => {
    const newImages = [...formData.images]
    newImages.splice(index, 1)
    setFormData({ ...formData, images: newImages })
  }

  // Handle location selection from map - FIXED to only update coordinates
  const handleLocationSelect = (coordinates) => {
    console.log("Selected coordinates:", coordinates) // Debug log

    // Only update the locationCoOrdinates field, preserve all other form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      locationCoOrdinates: coordinates,
    }))
  }

  // Listen for location name events from the map component
  useEffect(() => {
    const handleLocationNameFetched = (event) => {
      const { city, country } = event.detail

      // Only update location and country if they're empty or if user confirms
      setFormData((prevData) => {
        // If location and country are already filled, ask before overwriting
        if (prevData.location && prevData.country) {
          // Only ask if the values are different
          if (prevData.location !== city || prevData.country !== country) {
            const shouldUpdate = window.confirm(
              `Would you like to update the location from "${prevData.location}, ${prevData.country}" to "${city}, ${country}"?`,
            )

            if (shouldUpdate) {
              return {
                ...prevData,
                location: city || prevData.location,
                country: country || prevData.country,
              }
            }
            return prevData
          }
          return prevData
        }

        // If fields are empty, update without asking
        return {
          ...prevData,
          location: city || prevData.location,
          country: country || prevData.country,
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
    setIsSubmitting(true)
    setError("")

    // Validate coordinates
    if (!formData.locationCoOrdinates.lat || !formData.locationCoOrdinates.lng) {
      setError("Please select a location on the map")
      setIsSubmitting(false)
      return
    }

    try {
      // Create a regular object instead of FormData for better handling of nested objects
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        country: formData.country,
        locationCoOrdinates: {
          lat: formData.locationCoOrdinates.lat,
          lng: formData.locationCoOrdinates.lng,
        },
      }

      console.log("Sending data:", listingData) // Debug log

      // For images, we still need FormData
      const formDataToSend = new FormData()

      // Add the JSON data as a string
      formDataToSend.append("listingData", JSON.stringify(listingData))

      // Append all image files
      formData.images.forEach((file) => {
        formDataToSend.append("images", file)
      })

      const response = await fetch(`${API_BASE_URL}/api/listings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create listing")
      }

      navigate("/")
    } catch (err) {
      console.error("Error creating listing:", err)
      setError(err.message || "Failed to create listing. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pb-20">
      <div className="max-w-4xl mx-auto px-8 sm:px-10 lg:px-20 pt-20">
        <h1 className="text-3xl font-semibold mb-8">Add Your Listing</h1>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="e.g., Cozy Beach House in Miami"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent h-32"
              placeholder="Describe your place..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              accept="image/*"
              disabled={isSubmitting}
            />
            <div className="mt-3 space-y-2">
              {formData.images.map((file, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
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
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="e.g., Miami Beach"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="e.g., United States"
              disabled={isSubmitting}
            />
          </div>

          {/* Map Location Selector */}
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Location on Map *</label>
              <button
                type="button"
                onClick={() => setMapVisible(!mapVisible)}
                className="text-sm text-rose-600 hover:text-rose-700"
              >
                {mapVisible ? "Hide Map" : "Show Map"}
              </button>
            </div>

            {mapVisible && (
              <LocationSelectorMap
                onLocationSelect={handleLocationSelect}
                initialCoordinates={
                  formData.locationCoOrdinates.lat && formData.locationCoOrdinates.lng
                    ? formData.locationCoOrdinates
                    : null
                }
              />
            )}

            {formData.locationCoOrdinates.lat && formData.locationCoOrdinates.lng && (
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <MapPin className="h-4 w-4" />
                <span>
                  Location selected: {formData.locationCoOrdinates.lat.toFixed(6)},{" "}
                  {formData.locationCoOrdinates.lng.toFixed(6)}
                </span>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${
                isSubmitting ? "bg-rose-400 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700"
              } text-white py-3 rounded-lg transition`}
            >
              {isSubmitting ? "Submitting..." : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

