import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { X } from "lucide-react"

export default function Register({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Store the token
      localStorage.setItem("token", data.token)
      setIsAuthenticated(true) // Update auth state      
      navigate("/")
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Sign up</h1>
          <div className="w-5" /> {/* Spacer for centering */}
        </div>

        {/* Form */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Welcome to Airbnb</h2>

          {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Username"
              />
            </div>

            <div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 transition font-medium"
            >
              Sign up
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-rose-600 hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

