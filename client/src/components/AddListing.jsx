import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, X } from "lucide-react"

export default function AddListing() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") // Ensure the token exists
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [""],
    price: "",
    location: "",
    country: "",
  })
  const [error, setError] = useState("")

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] })
  }

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send JWT in header
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          images: formData.images.filter((img) => img.trim() !== ""),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create listing")
      }
      
      navigate("/")
    } catch (err) {
      setError("Failed to create listing. Please try again.")
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent h-32"
              placeholder="Describe your place..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
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
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 transition"
            >
              Create Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

