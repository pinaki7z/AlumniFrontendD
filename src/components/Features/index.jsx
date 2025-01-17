// import Image from 'next/image'
import education from "../../images/city-committed-education-collage-concept.jpg"

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
  ];

  return (
    <section className="bg-light" id="whatMakes" style={{paddingTop: '90px',paddingBottom: '3rem'}}>
      <div className="container">
        <h2 className="display-4 text-center mb-4">
          What Makes Alumnify The Ideal Choice For Your Institution?
        </h2>
        <div className="row g-4 align-items-center">
          <div className="col-md-6">
            <div className="position-relative" style={{ height: '400px' }}>
              <img
                src={education}
                alt="Education Technology"
                className="img-fluid rounded"
                style={{ objectFit: 'cover', height: '100%', width: '100%' }}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-4">
              {features.map((feature, index) => (
                <div key={index} className="d-flex mb-3">
                  <div className="flex-shrink-0 me-3" style={{ width: '24px', height: '24px' }}>
                    <svg className="w-100 h-100 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="fw-medium mb-1">{feature.title}</h3>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

