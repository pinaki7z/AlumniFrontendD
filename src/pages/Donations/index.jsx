import './donations.css';
import '../../components/DonSpon';
import DonSpon from '../../components/DonSpon';
import { LuHeartHandshake } from 'react-icons/lu';
import PageSubTitle from '../../components/PageSubTitle';
import { Route, Routes, useNavigate } from "react-router-dom";
import MyDonationRequests from '../../components/MyDonationRequests';
import BrowseDonations from '../../components/BrowseDonations';
import { useState, useEffect } from 'react';
import IndividualDonSpon from '../../components/IndividualDonSpon';
import DonSponRequest from '../../components/DonSponRequest';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Bconnect from '../../components/Groups/Bconnect';
import baseUrl from '../../config';
import CreateDonation from './CreateDonation';

const Donations = () => {
  const navigate = useNavigate();
  const title = 'Donations';
  const icon = <LuHeartHandshake />;
  const buttontext1 = 'Browse Businesses';
  const buttontext2 = 'My Business Requests';
  const buttontext3 = 'Business Connect';
  const buttontext1Link = "/home/donations";
  const buttontext2Link = "/home/donations/my-donation-requests";
  const buttontext3Link = "/home/donations/businessConnect";
  const [donations, setDonations] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [loading, setLoading] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const profile = useSelector((state) => state.profile);
  const LIMIT = 400;
  let [page, setPage] = useState(1);
  let [previousPage, setPreviousPage] = useState(0);

  const admin = profile.profileLevel === 0 || profile.profileLevel === 1;
  const alumni = profile.profileLevel === 2;

  const getPosts = async () => {
    setLoading(true);
    if (page === previousPage) {
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/donations?page=${page}&size=${LIMIT}`
      );
      const postsData = response.data.records;
      setDonations((prevItems) => [...prevItems, ...postsData]);
      setTotalDonations(response.data.total);
      setPreviousPage(page);
      setLoading(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const updateDonations = () => {
    setIsLoading(true);
    setPage(page + 1);
  };

  useEffect(() => {
    getPosts();
  }, [page]);

  const getUserDonations = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/donations/user/${profile._id}`
      );
      setUserDonations(response.data.donations);
      // console.log("user donations", response.data.donations);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    getUserDonations();
  }, []);

  const DoanationHome = () => {
    return (<>

      <DonSpon title="Business Connect" icon={icon} />


      <div>
        <PageSubTitle
          buttontext1={buttontext1}
          buttontext2={buttontext2}
          buttontext3={buttontext3}
          buttontext1Link={buttontext1Link}
          buttontext2Link={buttontext2Link}
          buttontext3Link={buttontext3Link}
          name="donations"
          create={admin}
        />
        {/* Create Button */}
        {admin && (
          <div style={{ margin: '1rem 0', textAlign: 'right' }}>
            <button
              className='hover:bg-[#136175] bg-[#0A3A4C] text-white py-3 px-4 rounded-md font-semibold'
              onClick={() => navigate('/home/donations/create')}
              style={{
                // padding: '10px 20px',
                // backgroundColor: '#0A3A4C',
                // color: '#fff',
                // border: 'none',
                // borderRadius: '8px',
                // cursor: 'pointer',
                // fontSize: '16px',
                // fontWeight: '500',
              }}
            >
              Create Business Donation Request
            </button>
          </div>
        )}

      </div>

    </>)
  }

  const DoanationRequest = () => {
    return (<>

      <DonSpon title="Business Connect" icon={icon} />


      <div>
        <PageSubTitle
          buttontext1={buttontext1}
          buttontext2={buttontext2}
          buttontext3={buttontext3}
          buttontext1Link={buttontext1Link}
          buttontext2Link={buttontext2Link}
          buttontext3Link={buttontext3Link}
          name="donations"
          create={admin}
        />
        {/* Create Button */}
        {admin && (
          <div style={{ margin: '1rem 0', textAlign: 'right' }}>
            <button
              className='hover:bg-[#136175] bg-[#0A3A4C] text-white py-3 px-4 rounded-md font-semibold'
              onClick={() => navigate('/home/donations/create')}
              style={{
                // padding: '10px 20px',
                // backgroundColor: '#0A3A4C',
                // color: '#fff',
                // border: 'none',
                // borderRadius: '8px',
                // cursor: 'pointer',
                // fontSize: '16px',
                // fontWeight: '500',
              }}
            >
              Create Business Donation Request
            </button>
          </div>
        )}

      </div>

    </>)
  }

  const DoanationConnect = () => {
    return (<>

      <DonSpon title="Business Connect" icon={icon} />


      <div>
        <PageSubTitle
          buttontext1={buttontext1}
          buttontext2={buttontext2}
          buttontext3={buttontext3}
          buttontext1Link={buttontext1Link}
          buttontext2Link={buttontext2Link}
          buttontext3Link={buttontext3Link}
          name="donations"
          create={admin}
        />
        {/* Create Button */}
        {admin && (
          <div style={{ margin: '1rem 0', textAlign: 'right' }}>
            <button
              className='hover:bg-[#136175] bg-[#0A3A4C] text-white py-3 px-4 rounded-md font-semibold'
              onClick={() => navigate('/home/donations/create')}
              style={{
                // padding: '10px 20px',
                // backgroundColor: '#0A3A4C',
                // color: '#fff',
                // border: 'none',
                // borderRadius: '8px',
                // cursor: 'pointer',
                // fontSize: '16px',
                // fontWeight: '500',
              }}
            >
              Create Business Donation Request
            </button>
          </div>
        )}

      </div>

    </>)
  }

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* tabs here */}
        <Routes>
          <Route
            path="/"
            element={
              <DoanationHome />
            }
          />
          <Route
            path="/my-donation-requests"
            element={
              <DoanationRequest />
            }
          />
          <Route
            path="/businessConnect"
            element={
              <DoanationConnect />
            }
          />
          <Route path="/:_id" element={<IndividualDonSpon />} />
          <Route path="/create" element={<CreateDonation name="donation" />} />
          <Route path="/edit/:_id" element={<CreateDonation name="donation" edit={true} />} />
        </Routes>

        <Routes>
          {admin ? (
            <>
              <Route
                path="/my-donation-requests"
                element={<BrowseDonations donSpon={donations} name="donations" />}
              />
              <Route path="/businessConnect" element={<Bconnect />} />
            </>
          ) : alumni ? (
            <Route
              path="/my-donation-requests"
              element={<BrowseDonations donSpon={userDonations} name="donations" />}
            />
          ) : null}
          {/* browse businesses */}
          <Route
            path="/"
            element={
              <BrowseDonations
                donSpon={donations}
                name="donations"
                updateDonations={updateDonations}
                totalDonations={totalDonations}
                limit={LIMIT}
                page={page}
                loading={loading}
                isLoading={isLoading}
              />
            }
          />
          <Route path="/businessConnect" element={<Bconnect />} />
        </Routes>
      </div>
    </div>
  );
};

export default Donations;
