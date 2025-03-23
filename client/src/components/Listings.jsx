import { useState, useEffect } from "react";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Listings({ searchQuery, isAuthenticated }) {
  const [listings, setListings] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [hoveredImage, setHoveredImage] = useState(null);
  const [visibleListings, setVisibleListings] = useState([]);
  const [listingRatings, setListingRatings] = useState({});
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true); // Set loading to true when fetch starts
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings${searchQuery ? `?search=${searchQuery}` : ""}`);
        const data = await response.json();
        setListings(data);

        // Initialize image indexes
        const indexes = {};
        data.forEach((listing) => {
          indexes[listing._id] = 0;
        });
        setCurrentImageIndexes(indexes);
        
        // Fetch reviews for each listing
        data.forEach(listing => {
          fetchReviewsForListing(listing._id);
        });
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false); // Set loading to false regardless of success or error
      }
    };

    fetchListings();
  }, [searchQuery]);

  // Fetch reviews for a specific listing and calculate average rating
  const fetchReviewsForListing = async (listingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${listingId}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      
      const reviews = await response.json();
      
      // Calculate average rating
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;
      
      // Update the listingRatings state with the new average
      setListingRatings(prev => ({
        ...prev,
        [listingId]: avgRating.toFixed(1)
      }));
    } catch (error) {
      console.error(`Error fetching reviews for listing ${listingId}:`, error);
    }
  };

  useEffect(() => {
    setVisibleListings(listings);
  }, [listings]);

  // Fetch Wishlist
  useEffect(() => {
    if (isAuthenticated) {
      const fetchWishlist = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/wishlist`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const data = await response.json();

          setWishlist(new Set(data.wishlist)); // Store wishlist as a Set for quick lookup
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      };

      fetchWishlist();
    }
  }, [isAuthenticated]);

  // Handle Wishlist Toggle
  const handleWishlist = async (e, listingId) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  
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
  
      // Ensure wishlist is updated correctly
      setWishlist(new Set(data.wishlist)); // Ensure UI matches DB
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };
  
  const showNextImage = (e, listingId, imagesLength) => {
    e.preventDefault();
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [listingId]: Math.min(prev[listingId] + 1, imagesLength - 1),
    }));
  };

  const showPrevImage = (e, listingId) => {
    e.preventDefault();
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [listingId]: Math.max(prev[listingId] - 1, 0),
    }));
  };

  // Loading skeleton component for a single listing card
  const ListingSkeleton = () => (
    <div className="group transition-all duration-300 ease-in-out">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-200 animate-pulse"></div>
      <div className="mt-3">
        <div className="flex justify-between items-start">
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-10 animate-pulse"></div>
        </div>
        <div className="mt-1">
          <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // Generate array of skeleton loaders
  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <ListingSkeleton key={`skeleton-${index}`} />
    ));
  };

  return (
    <div className="max-w-[2520px] mx-auto px-8 sm:px-10 lg:px-20 pt-28 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {isLoading ? (
          // Show skeleton loaders while loading
          renderSkeletons()
        ) : (
          // Show actual listings when loaded
          visibleListings.map((listing) => {
            const currentImageIndex = currentImageIndexes[listing._id] || 0;
            const isWishlisted = wishlist.has(listing._id);
            const isFirstImage = currentImageIndex === 0;
            const isLastImage = currentImageIndex === listing.images?.length - 1;
            const averageRating = listingRatings[listing._id] || "0.0";

            return (
              <Link
                key={listing._id}
                to={`/listings/${listing._id}`}
                className="group cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                {/* Image Container */}
                <div
                  className="relative aspect-[16/9] overflow-hidden rounded-xl"
                  onMouseEnter={() => setHoveredImage(listing._id)}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  <div className="absolute right-3 top-3 z-10">
                    <button
                      className="hover:scale-110 transition"
                      onClick={(e) => handleWishlist(e, listing._id)}
                    >
                      <Heart
                        className={`h-6 w-6 drop-shadow-md ${
                          isWishlisted ? "fill-red-500 stroke-red-500" : "fill-white stroke-white"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Navigation Arrows */}
                  {listing.images && listing.images.length > 1 && (
                    <>
                      {!isFirstImage && (
                        <button
                          onClick={(e) => showPrevImage(e, listing._id)}
                          className="absolute left-2 top-[45%] z-10 rounded-full bg-white/70 p-1 hover:bg-white transition transform hover:scale-110"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      )}
                      {!isLastImage && hoveredImage === listing._id && (
                        <button
                          onClick={(e) => showNextImage(e, listing._id, listing.images.length)}
                          className="absolute right-2 top-[45%] z-10 rounded-full bg-white/70 p-1 hover:bg-white transition transform hover:scale-110"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}

                  {/* Images */}
                  <div className="relative w-full h-full overflow-hidden">
                    <div
                      className="flex transition-transform duration-300 ease-in-out h-full"
                      style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                    >
                      {listing.images &&
                        listing.images.map((image, index) => (
                          <div key={index} className="w-full h-full flex-shrink-0">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`${listing.title} - Image ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Listing Details */}
                <div className="mt-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-medium truncate">
                      {listing.location}, {listing.country}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 ${Number(averageRating) > 0 ? "fill-current text-yellow-500" : "fill-gray-300"}`} />
                      <span className="font-medium">{averageRating}</span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <span className="font-medium">₹{listing.price}</span>
                    <span className="text-gray-500"> night</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}