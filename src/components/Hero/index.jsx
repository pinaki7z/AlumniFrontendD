// import Image from 'next/image'
import ss from "../../images/screenshots.png"

export default function Hero() {
  return (
    <section className="pb-4" style={{ background: 'linear-gradient(to bottom right, #4CAF50, #1B5E20)', marginTop: '100px' }}>
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-md-6 text-center text-md-start text-white">
            <h1 className="display-4 fw-bold mb-4">
              Revolutionizing Alumni Engagement For Institutions
            </h1>
            <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-4">
              <p className="h5 mb-0">
                Alumnify - Connect. Engage. Empower
              </p>
            </div>
            <p className="text-white opacity-80 mb-4">
              Unite your alumni under one powerful platform. Alumnify helps institutions foster lifelong connections, promote collaboration, and build a strong alumni network.
            </p>
            <button className="btn" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
              Schedule Your Free Demo Now
            </button>
          </div>
          <div className="col-md-6 d-flex justify-content-center align-items-center">
            <img
              src={ss}
              alt="Alumnify Mobile App"
              className="img-fluid"
              style={{ maxHeight: '600px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

