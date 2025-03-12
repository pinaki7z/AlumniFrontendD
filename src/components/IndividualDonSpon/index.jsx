import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import backgroundPicture1 from '../../images/pexels-mohamed-abdelghaffar-771742.jpg';
import picture from '../../images/pexels-lisa-fotios-1957478.jpg';
import './individualDonSpon.css';
import { RiInformationFill } from 'react-icons/ri';
import { FaFacebookSquare, FaTwitter, FaInstagram, FaLinkedin, FaPinterestSquare } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from "react-redux";
import baseUrl from "../../config"


const IndividualDonSpon = () => {
    const params = useParams();
    const { _id, name } = useParams();
    const location = useLocation();
    const [donations, setDonations] = useState([]);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const shareButtonRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const profile = useSelector((state) => state.profile);
    console.log('Individual Don Spon', donations)

    useEffect(() => {
        setIsLoading(true); // Set loading to true while fetching data
        if (location.pathname.includes('/sponsorships')) {
            fetch(`${baseUrl}/sponsorships/${_id}`)
                .then((response) => response.json())
                .then((data) => {
                    setDonations([data]);
                    setIsLoading(false); // Set loading to false when data is available
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    setIsLoading(false); // Set loading to false in case of an error
                });
        }
        if (location.pathname.includes('/donations')) {
            fetch(`${baseUrl}/donations/${_id}`)
                .then((response) => response.json())
                .then((data) => {
                    setDonations([data]);
                    setIsLoading(false); // Set loading to false when data is available
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    setIsLoading(false); // Set loading to false in case of an error
                });
        }
    }, [location.pathname, _id]);
    console.log('I-donations', donations)

    const handleShareClick = () => {
        setShowShareOptions(!showShareOptions);
    };

    const handleShareOptionClick = (link) => {
        window.open(link, '_blank'); // Open the link in a new tab
        setShowShareOptions(false); // Close the share options
    };

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (shareButtonRef.current && !shareButtonRef.current.contains(e.target)) {
                setShowShareOptions(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

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
        <div className="individual-sponsorship-container">
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                donations.map((donation) => (
                    <div key={donation._id} className="sponsorship-content">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#136175]">{donation.businessName || donation.nameOfEvent || null}</h1>
                        <p className="text-lg  mt-4 ">
                            Posted on {formatDate(donation.createdAt)}<br /> By <span className='font-bold text-xl  text-[#136175]'>{donation.userName || "Superadmin"}</span>
                        </p>
                        <div className=' py-4'>
                            <img
                                src={donation.picturePath || picture}
                                alt={location.pathname.includes('/home/sponsorships') ? 'sponsorship image' : 'donation image'}
                                className=" rounded-xl h-[400px] w-full object-cover"
                            />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>

                                <p className="text-lg md:text-lg font-semibold">
                                    {donation.eventDescription || "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."}
                                </p>
                            </div>


                            {/* donation detail card */}
                            <div className="bg-white borer w-full rounded-2xl p-6 border border-gray-200 max-w-md mx-auto md:text-lg">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Donation Details</h2>

                                <div className="space-y-2 text-gray-700">
                                    <p className="font-medium">
                                        <span className="text-blue-800">Total Amount (₹):</span> {donation.amount || donation.sponsorshipAmount}
                                    </p>
                                    <p className="font-medium">
                                        <span className="text-blue-800">Name:</span> {donation.name || donation.nameOfOrganiser}
                                    </p>
                                    <p className="font-medium">
                                        <span className="text-blue-800">Contact:</span> {donation.phone || donation.number}
                                    </p>
                                    <p className="font-medium">
                                        <span className="text-blue-800">Email:</span> {donation.email || donation.emailOfOrganiser}
                                    </p>

                                    {donation.businessPlan && (
                                        <div className="flex gap-2 mt-2">
                                            <p className="font-medium text-blue-800">Business Plan:</p>
                                            <a
                                                href={`${baseUrl}/uploads/${donation.businessPlan}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                View Plan
                                            </a>
                                        </div>
                                    )}

                                    {donation.currentRevenue && (
                                        <p className="font-medium">
                                            <span className="text-blue-800">Current Revenue (₹):</span> {donation.currentRevenue}
                                        </p>
                                    )}

                                    {donation.targetMarket && (
                                        <p className="font-medium">
                                            <span className="text-blue-800">Target Market:</span> {donation.targetMarket}
                                        </p>
                                    )}

                                    {donation.industry && (
                                        <p className="font-medium">
                                            <span className="text-blue-800">Industry:</span> {donation.industry}
                                        </p>
                                    )}

                                    {donation.teamExperience && (
                                        <p className="font-medium">
                                            <span className="text-blue-800">Team Experience:</span> {donation.teamExperience}
                                        </p>
                                    )}

                                    {donation.competitiveAdvantage && (
                                        <p className="font-medium">
                                            <span className="text-blue-800">Competitive Advantage:</span> {donation.competitiveAdvantage}
                                        </p>
                                    )}

                                    {donation.eventDescription && (
                                        <p className="font-medium">
                                            <span className="text-blue-800">Event Description:</span> {donation.eventDescription}
                                        </p>
                                    )}

                                    {donation.location && (
                                        <p className="font-medium">
                                            <span className="text-blue-800">Event Location:</span> {donation.location}
                                        </p>
                                    )}

                                    {donation.expectedAttendees && (
                                        <p className="font-medium">
                                            <span className="text-blue-800">Expected Attendees:</span> {donation.expectedAttendees}
                                        </p>
                                    )}

                                    {donation.sponsorshipBenefits && (
                                        <p className="font-medium">
                                            <span className="text-blue-800">Sponsorship Benefits:</span> {donation.sponsorshipBenefits}
                                        </p>
                                    )}
                                </div>

                                {profile._id !== donation.userId && (
                                    <button
                                        className="w-full mt-4 py-2 text-white bg-[#0A3A4C] hover:bg-[#136175] rounded-lg transition"
                                        onClick={() => window.open("https://razorpay.com/payment-link/plink_PA5q7Jm6wJENlt", "_blank")}
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


}

export default IndividualDonSpon;
