// import Image from 'next/image'

export default function Contact() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[300px] md:h-[400px]">
            <img
              src="/placeholder.svg?height=400&width=600"
              alt="Contact Us"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Contact Us For A Demo
            </h2>
            <p className="text-gray-600 mb-8">
              Discover how Alumnify can transform your institution's alumni network
            </p>
            <button className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-8 py-3 rounded-md text-sm font-medium transition-colors mb-4">
              Schedule Your Free Demo Now
            </button>
            <p className="text-gray-500 text-sm">
              You may also Email us to schedule the demo
            </p>
            <button className="text-[#4CAF50] font-medium text-sm hover:text-[#45a049] transition-colors mt-2">
              Send Us
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

