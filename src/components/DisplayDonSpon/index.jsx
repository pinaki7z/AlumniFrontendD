import './displayDonSpon.css';
import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { lineSpinner } from 'ldrs';
import picture from '../../images/pexels-lisa-fotios-1957478.jpg';
import baseUrl from "../../config";

lineSpinner.register();



const DisplayDonSpon = ({ donations, name, updateDonations, totalDonations, page, limit, loading, isLoading }) => {
    const location = useLocation();
    const profile = useSelector((state) => state.profile);
    const [edit, setEdit] = useState(false);
    const navigateTo = useNavigate();
    const [displayCount, setDisplayCount] = useState(2);
    // console.log('sponsorships', donations)


    useEffect(() => {
        console.log('checking for editing')
        if (location.pathname === '/home/donations/my-donation-requests' || location.pathname === '/home/sponsorships/my-sponsorship-requests') {
            console.log('checking for edit')
            setEdit(true);
        } else {
            setEdit(false)
        }
    }, [location.pathname]);

    console.log('EDIT', edit)

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

        return `${day}${getOrdinal(day)} ${month}, ${year}`;
    };

    const handleDelete = async (_id) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/${name}/${_id}`);
            toast.success(`Successfully deleted ${name} details`);
            if (name === "donations") {
                setTimeout(() => {
                    navigateTo('/home/donations');
                    window.location.reload();
                }, 1000);
            }

            if (name === "sponsorships") {
                setTimeout(() => {
                    navigateTo('/home/sponsorships');
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleLoadMore = () => {
        updateDonations();
    };
    console.log('donations', donations)
    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3  gap-2 px-2 py-3">
                {donations !== undefined && donations.length > 0 ? (
                    donations.map((donation) => (
                        <Link to={`/home/${name}/${donation._id}`} className='mb-3'>
                            <div className="px-2">
                                <div className="p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 bg-[#EAF5EF] border border-[#0A3A4C]">
                                    {/* Image */}
                                    <div className="w-full rounded-xl overflow-hidden">
                                        <img
                                            src={donation.picturePath|| donation.backgroundImage || picture}
                                            alt="Event"
                                            className="h-[180px] w-full object-cover rounded-xl"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="mt-4">
                                        <h2 className="text-lg font-bold capitalize text-[#136175]">{donation.businessName || donation.nameOfEvent || "Title"}</h2>

                                        <h3 className="text-base font-semibold capitalize text-[#136175] mt-1">
                                            {donation.name || donation.nameOfOrganiser}
                                        </h3>

                                        <p className="text-gray-500 text-xs mt-1">{formatDate(donation.createdAt)}</p>
                                        <p className="text-gray-700 text-xs mt-2">
                                            {donation.eventDescription?.length > 40
                                                ? `${donation.eventDescription.substring(0, 40)}...`
                                                : donation.eventDescription}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    {edit ? (
                                        <div className="mt-4 flex gap-2">
                                            <Link to={`/home/${name}/edit/${donation._id}`} className="w-1/2">
                                                <button className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">
                                                    Edit
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(donation._id)}
                                                className="w-1/2 py-2 rounded-lg bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            <p className="text-lg font-semibold text-[#136175]">
                                                <span>Total amount: </span>
                                                <span className="font-bold">₹ {donation.amount || donation.sponsorshipAmount}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                ) : loading ? (
                    <div style={{ display: 'flex', width: '100%', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
                        <l-line-spinner
                            size="40"
                            stroke="3"
                            speed="1"
                            color="black"
                        ></l-line-spinner></div>
                ) : (
                    <div>No {name}</div>
                )}
            </div>
            {isLoading && (
                <div style={{ textAlign: 'center' }}> <l-line-spinner
                    size="25"
                    stroke="3"
                    speed="1"
                    color="black"
                ></l-line-spinner></div>
            )}
            {page < totalDonations / limit && (
                <div style={{ textAlign: 'center' }}>
                    <button className="load-more-button" onClick={handleLoadMore}>
                        Load More
                    </button>
                </div>
            )}
        </>
    )
}

export default DisplayDonSpon;
