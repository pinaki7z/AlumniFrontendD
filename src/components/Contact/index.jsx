import { useState } from "react";
// import contact from "../../images/contact-us-customer-support-hotline-people-connect-email-address-live-chat-telephone-customer-service-contact-customer-phone-support-online.jpg";

export default function Contact() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  return (
    <>
      <section className="bg-light" id="contactUs" style={{ marginBottom: "3rem" }}>
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-md-6">
              <div className="position-relative" style={{ height: "400px" }}>
            {    
            
            // <img
            //       src={contact}
            //       alt="Contact Us"
            //       className="img-fluid rounded"
            //       style={{ objectFit: "cover", height: "100%", width: "100%" }}
            //     />
                
                }
              </div>
            </div>
            <div className="col-md-6 text-center text-md-start">
              <h2 className="display-4 mb-4">Contact Us For A Demo</h2>
              <p className="text-muted mb-4">
                Discover how Alumnify can transform your institution's alumni network
              </p>
              <button
                className="btn"
                style={{ backgroundColor: "#4CAF50", color: "white" }}
                onClick={togglePopup}
              >
                Schedule Your Free Demo Now
              </button>
              <p className="text-muted mt-3">You may also Email us to schedule the demo</p>
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

      {/* Popup */}
      {isPopupVisible && (
        <div
          className="popup-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="popup-content"
            style={{
              background: "white",
              borderRadius: "10px",
              padding: "20px",
              width: "90%",
              maxWidth: "600px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
          >
            <button
              onClick={togglePopup}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <iframe
              aria-label="Alumnify Contact Form"
              frameBorder="0"
              style={{
                height: "500px",
                width: "100%",
                border: "none",
              }}
              src="https://forms.zohopublic.in/desiaddacraftworksllp/form/AlumnifyLPForm/formperma/JGDf1WBWXBejpFdyXrTA5BBkeTwIf_XGUvc1dYVkymM"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}
