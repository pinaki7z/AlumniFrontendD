import { useState } from "react";
import ss from "../../images/screenshots.png";

export default function Hero() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  return (
    <>
      <section
        className="pb-4"
        style={{
          background: "linear-gradient(to bottom right, #4CAF50, #1B5E20)",
          marginTop: "100px",
        }}
      >
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-6 text-center text-md-start text-white">
              <h1 className="display-4 fw-bold mb-4">
                Revolutionizing Alumni Engagement For Institutions
              </h1>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-4">
                <p className="h5 mb-0">Alumnify - Connect. Engage. Empower</p>
              </div>
              <p className="text-white opacity-80 mb-4">
                Unite your alumni under one powerful platform. Alumnify helps
                institutions foster lifelong connections, promote collaboration,
                and build a strong alumni network.
              </p>
              <button
                className="btn"
                style={{ backgroundColor: "#4CAF50", color: "white" }}
                onClick={togglePopup}
              >
                Schedule Your Free Demo Now
              </button>
            </div>
            <div className="col-md-6 d-flex justify-content-center align-items-center">
              <img
                src={ss}
                alt="Alumnify Mobile App"
                className="img-fluid"
                style={{ maxHeight: "600px", objectFit: "contain" }}
              />
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
