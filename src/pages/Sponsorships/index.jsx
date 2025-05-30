import './sponsorships.css'
import '../../components/DonSpon'
import DonSpon from '../../components/DonSpon';
import PageSubTitle from '../../components/PageSubTitle';
import { Route, Routes, useNavigate } from "react-router-dom";
// import MySponsorshipRequests from '../../components/Sponsorships/MySponsorshipRequests';
import BrowseDonations from '../../components/BrowseDonations';
import { GoSponsorTiers } from 'react-icons/go';
import { useState, useEffect } from 'react';
import IndividualDonSpon from '../../components/IndividualDonSpon';
import DonSponRequest from '../../components/DonSponRequest';
import axios from 'axios';
import { useSelector } from 'react-redux';
import baseUrl from '../../config';
import CreatesSponsorship from './CreateSponsorship';


const Sponsorships = () => {
  const navigate = useNavigate();
  const title = 'Sponsorships';
  const icon = <GoSponsorTiers />;
  const buttontext1 = 'Browse Sponsorships';
  let buttontext2 = '';
  const buttontext1Link = "/home/sponsorships";
  const buttontext2Link = "/home/sponsorships/my-sponsorship-requests";
  const [donations, setDonations] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const profile = useSelector((state) => state.profile);

  const [loading, setLoading] = useState(false);
  const LIMIT = 40;
  let [page, setPage] = useState(1);
  let [previousPage, setPreviousPage] = useState(0);
  let admin;
  if (profile.profileLevel === 3 || profile.profileLevel === 1 || profile.profileLevel === 0) {
    admin = true;
  }
  if (profile.profileLevel === 3 || profile.profileLevel === 1 || profile.profileLevel === 0) {
    buttontext2 = 'My Sponsorship Requests';
  }


  const getPosts = async () => {
    setLoading(true)
    console.log('page', page);
    console.log('previous page', previousPage)
    if (page === previousPage) {
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/sponsorships?page=${page}&size=${LIMIT}`
      );
      const postsData = response.data.records;
      setDonations((prevItems) => [...prevItems, ...postsData]);
      setTotalDonations(response.data.total);
      setPreviousPage(page);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  const updateDonations = () => {
    console.log('Update Donations');
    setPage(page + 1);
  }


  useEffect(() => {
    getPosts();
  }, [page]);

  const getUserSponsorships = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/sponsorships/user/${profile._id}`
      );
      setUserDonations(response.data.sponsorships);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    getUserSponsorships();
  }, []);
  console.log('admin', admin)


  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '2% 5% ' }}>
      <DonSpon title={title} icon={icon} />
      {admin && (
        <div style={{ margin: '1rem 0', textAlign: 'right' }}>
          <button
            onClick={() => navigate('/home/sponsorships/create')}
            className='font-semibold px-3 py-3 bg-[#0f4c5e] text-white rounded-md hover:bg-[#136175]'
          >
            Create Sponsorship Request
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<PageSubTitle buttontext1={buttontext1} buttontext2={buttontext2} buttontext1Link={buttontext1Link} buttontext2Link={buttontext2Link} name='sponsorships' create={admin} />} />
        <Route path="/my-sponsorship-requests" element={<PageSubTitle buttontext1={buttontext1} buttontext2={buttontext2} buttontext1Link={buttontext1Link} buttontext2Link={buttontext2Link} name='sponsorships' create={admin} />} />
        <Route path="/:_id" element={<IndividualDonSpon />} />
        <Route path="/create" element={<CreatesSponsorship name='sponsorship' />} />
        <Route path="/edit/:_id" element={<CreatesSponsorship name='sponsorship' edit={true} />} />
      </Routes>
      <Routes>
        {profile.profileLevel === 0 ? (
          <Route path="/my-sponsorship-requests" element={<BrowseDonations donSpon={donations} name='sponsorships' />} />
        ) : profile.profileLevel === 1 || profile.profileLevel === 3 ? (
          <Route path="/my-sponsorship-requests" element={<BrowseDonations donSpon={userDonations} name='sponsorships' />} />
        ) : null}

        <Route path="/" element={<BrowseDonations donSpon={donations} name='sponsorships' updateDonations={updateDonations} totalDonations={totalDonations} limit={LIMIT} page={page} loading={loading} />} />
      </Routes>
    </div>
  )
}

export default Sponsorships;