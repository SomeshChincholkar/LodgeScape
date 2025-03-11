import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { X, Plus } from "lucide-react";           // Import icons

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function EditListing() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { id } = useParams()
  const navigate = useNavigate()

  const handleImageChange = (index, value) => {
    const updatedImages = [...listing.images];
    updatedImages[index] = value;
    setListing({ ...listing, images: updatedImages });
  };
  
  const addImageField = () => {
    setListing({ ...listing, images: [...listing.images, ""] });
  };
  
  const removeImageField = (index) => {
    const updatedImages = listing.images.filter((_, i) => i !== index);
    setListing({ ...listing, images: updatedImages });
  };
  

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch listing")
        }
        const data = await response.json()
        setListing(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(listing),
      })
      if (!response.ok) {
        throw new Error("Failed to update listing")
      }
      navigate(`/listings/${id}`)
    } catch (error) {
      setError(error.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            value={listing.title}
            onChange={(e) => setListing({ ...listing, title: e.target.value })}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Description">
            Description
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            type="text"
            value={listing.description}
            onChange={(e) => setListing({ ...listing, description: e.target.value })}
            required
          />
        </div>    

        <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Images</label>
        <div className="space-y-3">
            {listing.images.map((image, index) => (
            <div key={index} className="flex flex-col gap-2">
                <div className="flex gap-2">
                <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Image URL"
                />
                {index > 0 && (
                    <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    >
                    <X className="h-5 w-5" />
                    </button>
                )}
                </div>

                {/* Image Preview */}
                {image && (
                <img
                    src={image}
                    alt={`Preview ${index}`}
                    className="w-32 h-20 object-cover rounded-md border border-gray-300"
                />
                )}
            </div>
            ))}
            
            <button
            type="button"
            onClick={addImageField}
            className="flex items-center gap-2 text-rose-600 hover:text-rose-700"
            >
            <Plus className="h-4 w-4" />
            Add another image
            </button>
        </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
            Price
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="price"
            type="text"
            value={listing.price}
            onChange={(e) => setListing({ ...listing, price: e.target.value })}
            required
          />
        </div>      

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
          location
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="location"
            type="text"
            value={listing.location}
            onChange={(e) => setListing({ ...listing, location: e.target.value })}
            required
          />
        </div>          

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
          country
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="country"
            type="text"
            value={listing.country}
            onChange={(e) => setListing({ ...listing, country: e.target.value })}
            required
          />
        </div>                     
        {/* Add more form fields for description, price, location, etc. */}
        
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Update Listing
        </button>
      </form>
    </div>
  )
}

