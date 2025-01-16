// import Image from 'next/image'

export default function Hero() {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-[#4CAF50] to-[#1B5E20]">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left text-white max-w-xl mx-auto md:mx-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
              Revolutionizing Alumni Engagement For Institutions
            </h1>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8 inline-block">
              <p className="text-lg font-medium">
                Alumnify - Connect. Engage. Empower
              </p>
            </div>
            <p className="text-white/80 mb-8 text-sm md:text-base">
              Unite your alumni under one powerful platform. Alumnify helps institutions foster lifelong connections, promote collaboration, and build a strong alumni network.
            </p>
            <button className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-8 py-3 rounded-md text-sm font-medium transition-colors">
              Schedule Your Free Demo Now
            </button>
          </div>
          <div className="relative h-[400px] md:h-[600px] flex justify-center items-center">
            <img
              src={`${process.env.NEXT_PUBLIC_ASSETS_URL}/yX0UY.png`}
              alt="Alumnify Mobile App"
              //width={400}
              //height={600}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

