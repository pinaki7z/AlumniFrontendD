// import Image from 'next/image'

export default function Benefits() {
  const benefits = [
    {
      icon: "/placeholder.svg?height=48&width=48",
      title: "Enhance Engagement",
      description: "Foster stronger alumni relationships with interactive features"
    },
    {
      icon: "/placeholder.svg?height=48&width=48",
      title: "Boost Contributions",
      description: "Tap into sponsorships and donations with ease"
    },
    {
      icon: "/placeholder.svg?height=48&width=48",
      title: "Empower Students",
      description: "Connect them to alumni for guidance, mentoring, and career opportunities"
    },
    {
      icon: "/placeholder.svg?height=48&width=48",
      title: "Elevate Institutional Reputation",
      description: "Build a vibrant, connected, and engaged alumni community"
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Why Choose Alumnify For Your Institution?
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Build Your Legacy to bridge the gap between Alumni and your Institution. Alumnify enables institutions to build a thriving alumni ecosystem, fostering collaboration, mentorship, and support among alumni, students, and faculty. Elevate your brand, boost alumni contributions, and create a lasting impact.
          </p>
          <p className="text-gray-600 mt-4 text-sm md:text-base">
            Your alumni are your greatest advocates and a vital part of your legacy. With <span className="font-medium">Alumnify</span>, you can:
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="mb-4 flex justify-center">
                <img
                  src={benefit.icon}
                  alt={benefit.title}
                  //width={48}
                  //height={48}
                  className="text-green-500"
                />
              </div>
              <h3 className="text-green-500 font-medium mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-8 py-3 rounded-md text-sm font-medium transition-colors">
            Schedule Your Free Demo Now
          </button>
        </div>
      </div>
    </section>
  )
}

