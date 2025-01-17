
import contact from "../../images/contact-us-customer-support-hotline-people-connect-email-address-live-chat-telephone-customer-service-contact-customer-phone-support-online.jpg";

export default function Contact() {
  return (
    <section className="bg-light" id="contactUs" style={{marginBottom: '3rem'}}>
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
            <a
              href="mailto:mail@insideoutconsult.com"
              className="btn"
              style={{ backgroundColor: "#4CAF50", color: "white", textDecoration: "none" }}
            >
              Mail Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
