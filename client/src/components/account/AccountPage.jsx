import { useState, useEffect } from "react"
import { User, Heart, List } from "lucide-react"
import PersonalInfo from "./PersonalInfo"
import MyWishlist from "./MyWishlist"
import MyListings from "./MyListing"

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("personal")

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

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>
  }

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User, component: <PersonalInfo user={user} setUser={setUser} /> },
    { id: "wishlist", label: "My Wishlist", icon: Heart, component: <MyWishlist user={user} /> },
    { id: "listings", label: "My Listings", icon: List, component: <MyListings user={user} /> },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Account</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-4 px-6 text-center ${
                activeTab === tab.id ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-5 w-5 mx-auto mb-1" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">{tabs.find((tab) => tab.id === activeTab)?.component}</div>
      </div>
    </div>
  )
}

