// import Image from 'next/image'
import contact from "../../images/contact-us-customer-support-hotline-people-connect-email-address-live-chat-telephone-customer-service-contact-customer-phone-support-online.jpg";

export default function Contact() {
  return (
    <section className="py-5 bg-light">
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-md-6">
            <div className="position-relative" style={{ height: '400px' }}>
              <img
                src={contact}
                alt="Contact Us"
                className="img-fluid rounded"
                style={{ objectFit: 'cover', height: '100%', width: '100%' }}
              />
            </div>
          </div>
          <div className="col-md-6 text-center text-md-start">
            <h2 className="display-4 mb-4">
              Contact Us For A Demo
            </h2>
            <p className="text-muted mb-4">
              Discover how Alumnify can transform your institution's alumni network
            </p>
            <button className="btn" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
              Schedule Your Free Demo Now
            </button>
            <p className="text-muted mt-3">
              You may also Email us to schedule the demo
            </p>
            <button className="btn text-success" style={{ backgroundColor: 'transparent' }}>
              Send Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
