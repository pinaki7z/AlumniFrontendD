// import Image from 'next/image'
import events from "../../images/appointment-agenda-reminder-personal-organizer-calendar-concept.jpg";
import directory from "../../images/young-group-friend-education-using-technology-laptop-computer-network-connection.jpg";
import interactive from "../../images/tablet-with-applications.jpg";
import business from "../../images/creative-concept-about-success-career-ladder-business-woman-with-laptop.jpg";
import sponsorship from "../../images/support-diverse-diversity-ethnic-ethnicity-variation-unity-concept.jpg";
import photo from "../../images/casual-man-working-desk-with-computer-digitizer-against-profile-pictures.jpg";
import communication from "../../images/hand-button-man-multimedia-mail.jpg";
import dashboard from "../../images/communication-connection-message-networking.jpg";

export default function CoreFeatures() {
  const features = [
    {
      title: "Dynamic Dashboard",
      image: dashboard,
      items: [
        "Stay informed and engaged with our intuitive dashboard",
        "Browse feeds and trending posts",
        "Virtual walls for polls and engage with other effectively"
      ]
    },
    {
      title: "Alumni Directory",
      image: directory,
      items: [
        "Advanced search options to filter by batch, year, profession, or role",
        "Build a robust network of alumni and current students"
      ]
    },
    {
      title: "Interactive Engagement Tools",
      image: interactive,
      items: [
        "Keep your alumni engaged and involved",
        "Organize virtual alumni groups and host discussions",
        "Share news, updates, and achievements from the institution"
      ]
    },
    {
      title: "Events Management",
      image: events,
      items: [
        "Simplify event planning and participation",
        "Plan and manage reunions, webinars, and more",
        "Enable alumni to RSVP and track attendance seamlessly"
      ]
    },
    {
      title: "Business & Career Opportunities",
      image: business,
      items: [
        "Bridge the gap between alumni and students",
        "Share job opportunities and entrepreneurial ventures",
        "Offer mentorship opportunities and guidance through alumni"
      ]
    },
    {
      title: "Sponsorship & Support",
      image: sponsorship,
      items: [
        "Leverage alumni contributions effectively",
        "Alumni can sponsor events",
        "Strengthen institutional growth through their support"
      ]
    }
  ];

  return (
    <section className="py-5 bg-white">
      <div className="container">
        <h2 className="display-4 text-center mb-4">
          Core Features That Set Alumnify Apart
        </h2>
        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-md-6">
              <div className="bg-light rounded p-4">
                <div className="d-flex">
                  <div className="flex-shrink-0 me-3" style={{ width: '160px', height: '160px' }}>
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="img-fluid rounded"
                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    />
                  </div>
                  <div>
                    <h3 className="fw-medium mb-3">{feature.title}</h3>
                    <ul className="list-unstyled">
                      {feature.items.map((item, idx) => (
                        <li key={idx} className="text-muted">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

