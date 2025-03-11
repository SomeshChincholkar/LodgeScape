import { Facebook, Twitter, Instagram, Globe } from "lucide-react"
import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="sticky bottom-0 w-full bg-white border-t border-gray-200 py-4 z-40 text-sm font-medium">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Left section */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-gray-600">
            <span>© 2025 LodgeScape, Inc.</span>
            <span className="hidden xs:inline">·</span>
            <Link to="/privacy" className="hover:underline">
              Privacy
            </Link>
            <span className="hidden xs:inline">·</span>
            <Link to="/terms" className="hover:underline">
              Terms
            </Link>
            <span className="hidden xs:inline">·</span>
            <Link to="/sitemap" className="hover:underline">
              Sitemap
            </Link>
            <span className="hidden xs:inline">·</span>
            <Link to="/company-details" className="hover:underline">
              Company details
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 hover:underline">
              <Globe className="h-4 w-4" />
              <span>English (IN)</span>
            </button>
            <button className="hover:underline">₹ INR</button>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

