import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Share, Heart, ArrowLeft } from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ViewListing() {
  const [listing, setListing] = useState(null)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const { id } = useParams()

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings/${id}`)
        const data = await response.json()
        setListing(data)
      } catch (error) {
        console.error("Error fetching listing:", error)
      }
    }

    if (id) {
      fetchListing()
    }
  }, [id])

  if (!listing) {
    return <div className="pt-28 px-8">Loading...</div>
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

  return (
    <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-20 pt-20">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition mb-2">
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      {/* Title Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition">
            <Share className="h-4 w-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition">
            <Heart className="h-4 w-4" />
            Save
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
            <span className="text-2xl font-semibold">₹{listing.price}</span>
            <span className="text-gray-500 ml-2">night</span>
          </div>
        </div>
      </div>
    </div>
  )
}

