import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Import marker images manually (Fix for missing markers in React)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

// Apply the marker fix
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const LocationSelectorMap = ({ onLocationSelect, initialCoordinates }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [coordinates, setCoordinates] = useState(initialCoordinates || { lat: 20.5937, lng: 78.9629 }) // Default to center of India if no coordinates

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 5)

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current)

      // Add initial marker if coordinates exist
      if (coordinates) {
        markerRef.current = L.marker([coordinates.lat, coordinates.lng], { draggable: true })
          .addTo(mapInstanceRef.current)
          .bindPopup("Drag to set location")
          .openPopup()

        // Update coordinates when marker is dragged
        markerRef.current.on("dragend", (e) => {
          const position = markerRef.current.getLatLng()
          const newCoordinates = { lat: position.lat, lng: position.lng }
          setCoordinates(newCoordinates)
          onLocationSelect(newCoordinates)

          // Try to get address from coordinates
          fetchLocationName(position.lat, position.lng)
        })
      }

      // Add click handler to map
      mapInstanceRef.current.on("click", (e) => {
        // If marker already exists, move it
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng)
        } else {
          // Create new marker
          markerRef.current = L.marker(e.latlng, { draggable: true })
            .addTo(mapInstanceRef.current)
            .bindPopup("Drag to set location")
            .openPopup()

          // Add drag handler
          markerRef.current.on("dragend", (e) => {
            const position = markerRef.current.getLatLng()
            const newCoordinates = { lat: position.lat, lng: position.lng }
            setCoordinates(newCoordinates)
            onLocationSelect(newCoordinates)

            // Try to get address from coordinates
            fetchLocationName(position.lat, position.lng)
          })
        }

        // Update coordinates
        const newCoordinates = { lat: e.latlng.lat, lng: e.latlng.lng }
        setCoordinates(newCoordinates)
        onLocationSelect(newCoordinates)

        // Try to get address from coordinates
        fetchLocationName(e.latlng.lat, e.latlng.lng)
      })
    }

    // Cleanup function to destroy map when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Function to fetch location name from coordinates using Nominatim API
  const fetchLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      )
      const data = await response.json()

      if (data && data.address) {
        // Extract city and country
        const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || ""
        const country = data.address.country || ""

        // Dispatch a custom event with the location data
        const event = new CustomEvent("locationNameFetched", {
          detail: { city, country },
        })
        document.dispatchEvent(event)
      }
    } catch (error) {
      console.error("Error fetching location name:", error)
    }
  }

  // Update map view if initialCoordinates changes
  useEffect(() => {
    if (mapInstanceRef.current && initialCoordinates) {
      mapInstanceRef.current.setView([initialCoordinates.lat, initialCoordinates.lng], 13)

      if (markerRef.current) {
        markerRef.current.setLatLng([initialCoordinates.lat, initialCoordinates.lng])
      } else {
        markerRef.current = L.marker([initialCoordinates.lat, initialCoordinates.lng], { draggable: true })
          .addTo(mapInstanceRef.current)
          .bindPopup("Drag to set location")
          .openPopup()

        // Add drag handler
        markerRef.current.on("dragend", (e) => {
          const position = markerRef.current.getLatLng()
          const newCoordinates = { lat: position.lat, lng: position.lng }
          setCoordinates(newCoordinates)
          onLocationSelect(newCoordinates)

          // Try to get address from coordinates
          fetchLocationName(position.lat, position.lng)
        })
      }
    }
  }, [initialCoordinates])

  return (
    <div>
      <div ref={mapRef} style={{ height: "400px", width: "100%", borderRadius: "10px" }}></div>
      <div className="mt-2 text-sm text-gray-500">
        Click on the map to set your listing location or drag the marker to adjust.
      </div>
    </div>
  )
}

export default LocationSelectorMap

