import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Link } from "react-router-dom"

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function MyWishlist({ user }) {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/account/wishlist`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch wishlist")
        }
        const data = await response.json()

        setWishlist(data)
      } catch (error) {
        console.error("Error fetching wishlist:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  const handleWishlistToggle = async (listingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) throw new Error("Failed to update wishlist");

      const data = await response.json();

      // Update wishlist state based on API response
      setWishlist(data.wishlist);
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  if (loading) {
    return <div>Loading wishlist...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((listing) => (
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
                  <Link to={`/listings/${listing._id}`} className="text-rose-600 hover:text-rose-700 font-medium">
                    View Details
                  </Link>
                  <button
                    className="text-gray-600 hover:text-gray-700"
                    onClick={() => handleWishlistToggle(listing._id)}
                  >
                    <Heart className= "h-6 w-6 fill-red-500 stroke-red-500" />
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
