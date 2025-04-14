import { useState, useEffect, useRef } from "react";
import { Globe, Menu, Search, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ onSearch, suggestions, isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };
  
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false) // ✅ Update state immediately
    navigate("/")
  }


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 md:gap-0">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <a href="/"><img src="/images/LodgeScape.png" alt="LodgeScape" width={32} height={32} className="cursor-pointer" /></a>
            <a href="/" className="text-lg font-semibold">LodgeScape</a>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl" ref={searchRef}>
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search destinations..."
                className="w-full px-8 py-2.5 rounded-full border border-gray-300 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute w-full bg-white mt-2 py-2 rounded-xl border border-gray-200 shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Redirects based on login state */}
            <Link
              to={isAuthenticated ? "/add-listing" : "/login"}
              className="hidden md:block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              Add new Listing
            </Link>

            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Globe className="h-5 w-5 text-gray-600" />
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center border border-gray-300 rounded-full p-1 hover:shadow-md transition cursor-pointer"
              >
                <Menu className="h-5 w-5 text-gray-600" />
                <div className="h-8 w-8 ml-2 rounded-full bg-gray-500 text-white flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden text-sm font-medium text-gray-600">
                  {isAuthenticated? (
                    <>
                      <Link
                        to="/account"
                        className="block px-4 py-3 text-sm hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-3 text-sm hover:bg-gray-100 font-medium"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-3 text-sm hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-200" />
                  <Link
                    to="/help"
                    className="block px-4 py-3 text-sm hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Help Centre
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden py-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search destinations..."
              className="w-full px-8 py-2.5 rounded-full border border-gray-300 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
