// import Image from 'next/image'
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2023 InsideOut. All rights reserved
          </div>
          <div className="flex items-center gap-4">
            <Link to="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800">
              <div className="w-4 h-4 bg-green-500" />
            </Link>
            <Link to="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800">
              <div className="w-4 h-4 bg-green-500" />
            </Link>
            <Link to="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800">
              <div className="w-4 h-4 bg-green-500" />
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Powered by</span>
            <img
              src="/placeholder.svg?height=24&width=80"
              alt="InsideOut"
              width={80}
              height={24}
            />
          </div>
        </div>
      </div>
    </footer>
  )
}

