import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import picture from '../../images/pexels-lisa-fotios-1957478.jpg';
import './individualDonSpon.css';
import { useSelector } from "react-redux";
import baseUrl from "../../config";

const IndividualDonSpon = () => {
  const { _id } = useParams();
  const location = useLocation();
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const profile = useSelector((state) => state.profile);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const path = location.pathname.includes('/sponsorships')
          ? `${process.env.REACT_APP_API_URL}/sponsorships/${_id}`
          : `${process.env.REACT_APP_API_URL}/donations/${_id}`;
        const response = await fetch(path);
        const data = await response.json();
        setDonations([data]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [location.pathname, _id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };
    return `${day}${getOrdinal(day)} ${month} ${year}`;
  };

  return (
    <div className="p-4">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        donations.map((donation) => (
          <div key={donation._id} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* Title and Date */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#136175]">
                  {donation.businessName || donation.nameOfEvent || 'N/A'}
                </h1>
                <p className="text-lg mt-4">
                  Posted on {formatDate(donation.createdAt)}<br />
                  By{" "}
                  <span className="font-bold text-xl text-[#136175]">
                    {donation.userName || "Superadmin"}
                  </span>
                </p>
              </div>

              {/* Image */}
              <div>
                <img
                  src={donation.picturePath || donation.backgroundImage || picture}
                  alt={
                    location.pathname.includes('/sponsorships')
                      ? 'sponsorship image'
                      : 'donation image'
                  }
                  className="rounded-xl h-[400px] w-full object-cover"
                />
              </div>

              {/* Description */}
              <div>
                <p className="text-lg font-semibold">
                  {donation.eventDescription || donation.businessDescription ||
                    "Lorem Ipsum is simply dummy text of the printing and typesetting industry..."}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN - Sticky Card */}
            <div className="md:sticky md:top-0 self-start">
              <div className="bg-white border w-full rounded-2xl p-6 border-gray-200 max-w-md mx-auto md:text-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Donation Details
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p className="font-medium">
                    <span className="text-blue-800">Total Amount (₹):</span>{" "}
                    {donation.amount || donation.sponsorshipAmount}
                  </p>
                  <p className="font-medium">
                    <span className="text-blue-800">Name:</span>{" "}
                    {donation.name || donation.nameOfOrganiser}
                  </p>
                  <p className="font-medium">
                    <span className="text-blue-800">Contact:</span>{" "}
                    {donation.phone || donation.number}
                  </p>
                  <p className="font-medium">
                    <span className="text-blue-800">Email:</span>{" "}
                    {donation.email || donation.emailOfOrganiser}
                  </p>

                  {/* Business Plan */}
                  {donation.businessPlan && (
                    <div className="flex gap-2 mt-2">
                      <p className="font-medium text-blue-800">Business Plan:</p>
                      <a
                        href={`${donation.businessPlan}`}
                        // href={`${process.env.REACT_APP_API_URL}/uploads/${donation.businessPlan}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Plan
                      </a>
                    </div>
                  )}

                  {/* Additional Fields */}
                  {donation.currentRevenue && (
                    <p className="font-medium">
                      <span className="text-blue-800">Current Revenue (₹):</span>{" "}
                      {donation.currentRevenue}
                    </p>
                  )}
                  {donation.targetMarket && (
                    <p className="font-medium">
                      <span className="text-blue-800">Target Market:</span>{" "}
                      {donation.targetMarket}
                    </p>
                  )}
                  {donation.industry && (
                    <p className="font-medium">
                      <span className="text-blue-800">Industry:</span>{" "}
                      {donation.industry}
                    </p>
                  )}
                  {donation.teamExperience && (
                    <p className="font-medium">
                      <span className="text-blue-800">Team Experience:</span>{" "}
                      {donation.teamExperience}
                    </p>
                  )}
                  {donation.competitiveAdvantage && (
                    <p className="font-medium">
                      <span className="text-blue-800">Competitive Advantage:</span>{" "}
                      {donation.competitiveAdvantage}
                    </p>
                  )}
                  {donation.eventDescription && (
                    <p className="font-medium">
                      <span className="text-blue-800">Event Description:</span>{" "}
                      {donation.eventDescription}
                    </p>
                  )}
                  {donation.location && (
                    <p className="font-medium">
                      <span className="text-blue-800">Event Location:</span>{" "}
                      {donation.location}
                    </p>
                  )}
                  {donation.expectedAttendees && (
                    <p className="font-medium">
                      <span className="text-blue-800">Expected Attendees:</span>{" "}
                      {donation.expectedAttendees}
                    </p>
                  )}
                  {donation.sponsorshipBenefits && (
                    <p className="font-medium">
                      <span className="text-blue-800">Sponsorship Benefits:</span>{" "}
                      {donation.sponsorshipBenefits}
                    </p>
                  )}
                </div>

                {profile._id !== donation.userId && (
                  <button
                    className="w-full mt-4 py-2 text-white bg-[#0A3A4C] hover:bg-[#136175] rounded-lg transition"
                    onClick={() =>
                      window.open(
                        "https://razorpay.com/payment-link/plink_PA5q7Jm6wJENlt",
                        "_blank"
                      )
                    }
                  >
                    Donate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default IndividualDonSpon;
