import { useState } from "react"
import { Edit2, Save } from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function PersonalInfo({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    gmail: user.gmail || "",
    phone_no: user.phone_no || "",
    address: user.address || "",
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update user information")
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating user information:", error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Personal Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center text-rose-600 hover:text-rose-700"
        >
          {isEditing ? (
            <>
              <Save className="h-5 w-5 mr-1" /> Save
            </>
          ) : (
            <>
              <Edit2 className="h-5 w-5 mr-1" /> Edit
            </>
          )}
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={user.username}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="gmail"
              value={formData.gmail}
              onChange={handleChange}
              disabled={!isEditing}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 ${
                !isEditing && "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phone_no"
              value={formData.phone_no}
              onChange={handleChange}
              disabled={!isEditing}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 ${
                !isEditing && "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              rows="3"
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 ${
                !isEditing && "bg-gray-100"
              }`}
            ></textarea>
          </div>
        </div>
        {isEditing && (
          <div className="mt-4">
            <button
              type="submit"
              className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

