import { useState } from "react";
import { GiCash } from "react-icons/gi";
import { FaRegHandshake } from "react-icons/fa6";
import { RiGraduationCapLine } from "react-icons/ri";
import { BiSolidInstitution } from "react-icons/bi";

export default function Benefits() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  const benefits = [
    {
      icon: <FaRegHandshake color="#38A750" style={{ width: "80px", height: "80px" }} />,
      title: "Enhance Engagement",
      description: "Foster stronger alumni relationships with interactive features",
    },
    {
      icon: <GiCash color="#38A750" style={{ width: "80px", height: "80px" }} />,
      title: "Boost Contributions",
      description: "Tap into sponsorships and donations with ease",
    },
    {
      icon: <RiGraduationCapLine color="#38A750" style={{ width: "80px", height: "80px" }} />,
      title: "Empower Students",
      description: "Connect them to alumni for guidance, mentoring, and career opportunities",
    },
    {
      icon: <BiSolidInstitution color="#38A750" style={{ width: "80px", height: "80px" }} />,
      title: "Elevate Institutional Reputation",
      description: "Build a vibrant, connected, and engaged alumni community",
    },
  ];

  return (
    <>
      <section className="bg-white" id="whyChoose" style={{ paddingTop: "90px", paddingBottom: "3rem" }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="display-4 fw-bold mb-4">Why Choose Alumnify For Your Institution?</h2>
            <p className="text-muted mb-4">
              Build Your Legacy to bridge the gap between Alumni and your Institution. Alumnify enables institutions to
              build a thriving alumni ecosystem, fostering collaboration, mentorship, and support among alumni, students,
              and faculty. Elevate your brand, boost alumni contributions, and create a lasting impact.
            </p>
            <p className="text-muted">
              Your alumni are your greatest advocates and a vital part of your legacy. With{" "}
              <span className="fw-medium">Alumnify</span>, you can:
            </p>
          </div>
          <div className="row g-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="col-md-6 col-lg-3 text-center">
                <div className="mb-4 d-flex justify-content-center">{benefit.icon}</div>
                <h3 className="text-success fw-medium mb-2">{benefit.title}</h3>
                <p className="text-muted">{benefit.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <button
              className="btn"
              style={{ backgroundColor: "#4CAF50", color: "white" }}
              onClick={togglePopup}
            >
              Schedule Your Free Demo Now
            </button>
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
