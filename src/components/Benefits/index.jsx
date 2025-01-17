// import Image from 'next/image'
import institute from "../../images/employee-year_2327060.svg"; 
import empower from "../../images/graduated_17005570.svg"; 
import boost from "../../images/cash-flow_10842879.svg"; 
import enhance from "../../images/partnership-handshake_10091571.svg"; 
import { GiCash } from "react-icons/gi";
import { FaRegHandshake } from "react-icons/fa6";
import { RiGraduationCapLine } from "react-icons/ri";
import { BiSolidInstitution } from "react-icons/bi";
import { height } from "@mui/system";

export default function Benefits() {
  const benefits = [
    {
      icon: <FaRegHandshake color="#38A750" style={{ width: "80px", height: "80px" }}/>,
      title: "Enhance Engagement",
      description: "Foster stronger alumni relationships with interactive features"
    },
    {
      icon: <GiCash color="#38A750" style={{ width: "80px", height: "80px" }}/>,
      title: "Boost Contributions",
      description: "Tap into sponsorships and donations with ease"
    },
    {
      icon: <RiGraduationCapLine color="#38A750" style={{ width: "80px", height: "80px" }}/>,
      title: "Empower Students",
      description: "Connect them to alumni for guidance, mentoring, and career opportunities"
    },
    {
      icon: <BiSolidInstitution color="#38A750" style={{ width: "80px", height: "80px" }}/>,
      title: "Elevate Institutional Reputation",
      description: "Build a vibrant, connected, and engaged alumni community"
    }
  ];

  return (
    <section className="bg-white" id="whyChoose" style={{paddingTop: '90px',paddingBottom: '3rem'}}>
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="display-4 fw-bold mb-4">
            Why Choose Alumnify For Your Institution?
          </h2>
          <p className="text-muted mb-4">
            Build Your Legacy to bridge the gap between Alumni and your Institution. Alumnify enables institutions to build a thriving alumni ecosystem, fostering collaboration, mentorship, and support among alumni, students, and faculty. Elevate your brand, boost alumni contributions, and create a lasting impact.
          </p>
          <p className="text-muted">
            Your alumni are your greatest advocates and a vital part of your legacy. With <span className="fw-medium">Alumnify</span>, you can:
          </p>
        </div>
        <div className="row g-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="col-md-6 col-lg-3 text-center">
              <div className="mb-4 d-flex justify-content-center">
                {/* <img
                  src={benefit.icon}
                  alt={benefit.title}
                  className="text-green-500"
                  style={{ width: '48px', height: '48px',color: "#38A750" }} // Set width and height inline
                /> */}
                {benefit.icon}
              </div>
              <h3 className="text-success fw-medium mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <button className="btn" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
            Schedule Your Free Demo Now
          </button>
        </div>
      </div>
    </section>
  );
}

