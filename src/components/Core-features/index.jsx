// import Image from 'next/image'

export default function CoreFeatures() {
  const features = [
    {
      title: "Dynamic Dashboard",
      image: "/placeholder.svg?height=300&width=400",
      items: [
        "Stay informed and engaged with our intuitive dashboard",
        "Browse feeds and trending posts",
        "Virtual walls for polls and engage with other effectively"
      ]
    },
    {
      title: "Alumni Directory",
      image: "/placeholder.svg?height=300&width=400",
      items: [
        "Advanced search options to filter by batch, year, profession, or role",
        "Build a robust network of alumni and current students"
      ]
    },
    {
      title: "Interactive Engagement Tools",
      image: "/placeholder.svg?height=300&width=400",
      items: [
        "Keep your alumni engaged and involved",
        "Organize virtual alumni groups and host discussions",
        "Share news, updates, and achievements from the institution"
      ]
    },
    {
      title: "Events Management",
      image: "/placeholder.svg?height=300&width=400",
      items: [
        "Simplify event planning and participation",
        "Plan and manage reunions, webinars, and more",
        "Enable alumni to RSVP and track attendance seamlessly"
      ]
    },
    {
      title: "Business & Career Opportunities",
      image: "/placeholder.svg?height=300&width=400",
      items: [
        "Bridge the gap between alumni and students",
        "Share job opportunities and entrepreneurial ventures",
        "Offer mentorship opportunities and guidance through alumni"
      ]
    },
    {
      title: "Sponsorship & Support",
      image: "/placeholder.svg?height=300&width=400",
      items: [
        "Leverage alumni contributions effectively",
        "Alumni can sponsor events",
        "Strengthen institutional growth through their support"
      ]
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Core Features That Set Alumnify Apart
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <div className="flex gap-6">
                <div className="relative w-40 h-40 flex-shrink-0">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-4">{feature.title}</h3>
                  <ul className="space-y-2">
                    {feature.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

