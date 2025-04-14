import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Listings from "./components/Listings"
import ViewListing from "./components/ViewListing"
import AddListing from "./components/AddListing"
import EditListing from "./components/EditListing"
import Login from "./components/Login"
import Register from "./components/Register"
import AccountPage from "./components/account/AccountPage"

const API_BASE_URL = import.meta.env.VITE_API_URL
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function App() {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"))

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 0) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/listings/suggestions?search=${searchQuery}`)
          const data = await response.json()
          setSuggestions(data)
        } catch (error) {
          console.error("Error fetching suggestions:", error)
        }
      } else {
        setSuggestions([])
      }
    }

    fetchSuggestions()
  }, [searchQuery])

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }
    return children
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <Header
            onSearch={handleSearch}
            suggestions={suggestions}
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Listings searchQuery={searchQuery} isAuthenticated={isAuthenticated} />} />
              <Route path="/listings/:id" element={<ViewListing />} />
              <Route
                path="/add-listing"
                element={
                  <ProtectedRoute>
                    <AddListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-listing/:id"
                element={
                  <ProtectedRoute>
                    <EditListing />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
              <Route
                path="/account/*"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
