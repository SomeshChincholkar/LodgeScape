import { useState, useEffect } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function MyListings({ user }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/listings`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch listings")
        }
        const data = await response.json()
        setListings(data)
      } catch (error) {
        console.error("Error fetching listings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  const handleDelete = async (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to delete listing")
        }
        setListings(listings.filter((listing) => listing._id !== listingId))
      } catch (error) {
        console.error("Error deleting listing:", error)
      }
    }
  }

  if (loading) {
    return <div>Loading listings...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Listings</h2>
      {listings.length === 0 ? (
        <p>You haven't created any listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing._id} className="border rounded-lg overflow-hidden shadow-sm">
              <img
                src={listing.images[0] || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                <p className="text-gray-600 mb-2">
                  {listing.location}, {listing.country}
                </p>
                <p className="font-bold">₹{listing.price} / night</p>
                <div className="mt-4 flex justify-between items-center">
                  <Link to={`/edit-listing/${listing._id}`} className="text-blue-600 hover:text-blue-700">
                    <Pencil className="h-5 w-5" />
                  </Link>
                  <button onClick={() => handleDelete(listing._id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

