// import Image from 'next/image'

export default function Features() {
  const features = [
    {
      title: "Customizable Design",
      description: "Take the platform to represent your institution's unique culture and brand"
    },
    {
      title: "Scalable Solution",
      description: "Whether you're a small liberal arts college or have a large university network, Alumnify scales with your needs"
    },
    {
      title: "Flexibility Across Devices",
      description: "Access Alumnify effortlessly via both a web app and a mobile app, ensuring convenience and accessibility anytime, anywhere"
    },
    {
      title: "Secure and Reliable",
      description: "Protect sensitive data with robust security measures and privacy controls"
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          What Makes Alumnify The Ideal Choice For Your Institution?
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[300px] md:h-[400px]">
            <img
              src="/placeholder.svg?height=400&width=600"
              alt="Education Technology"
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 mt-1">
                  <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

