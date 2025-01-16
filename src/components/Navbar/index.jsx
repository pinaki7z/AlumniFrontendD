// import Link from 'next/link'
// import Image from 'next/image'
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img
            src="/placeholder.svg?height=32&width=120"
            alt="InsideOut Logo"
            width={120}
            height={32}
            priority
          />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="#why-choose" className="text-gray-800 hover:text-green-500 text-sm">
            Why Choose
          </Link>
          <Link to="#what-makes" className="text-gray-800 hover:text-green-500 text-sm">
            What Makes
          </Link>
          <Link to="#core-features" className="text-gray-800 hover:text-green-500 text-sm">
            Core Features
          </Link>
          <Link to="#contact-us" className="text-gray-800 hover:text-green-500 text-sm">
            Contact Us
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="#" className="text-green-500">
            <div className="w-6 h-6 bg-green-500" />
          </Link>
          <Link to="#" className="text-green-500">
            <div className="w-6 h-6 bg-green-500" />
          </Link>
          <Link to="#" className="text-green-500">
            <div className="w-6 h-6 bg-green-500" />
          </Link>
        </div>
      </div>
    </nav>
  )
}

