import React, { useState, useEffect, useRef } from 'react';
import { HiUsers } from "react-icons/hi2";
import PageTitle from '../PageTitle';
import Profilecard from '../Profilecard';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import baseUrl from '../../config';

export const Followers = () => {
  const title = 'Followers';
  const icon = <HiUsers style={{ color: '#174873' }} />;
  const [members, setMembers] = useState([]);
  const [cookie, setCookie] = useCookies(['access_token']);
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(true);
  const LIMIT = 6;
  const [totalFollowers, setTotalFollowers] = useState(0);
  const activePage = useRef(1);
  const { id } = useParams();

  const fetchMembers = async (page) => {
    try {
      console.log('page', page);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/alumni/${id}/followers?page=${page}&size=${LIMIT}`);
      if (response.ok) {
        const data = await response.json();
        setTotalFollowers(data.totalFollowers);
        setMembers((prevMembers) => [...prevMembers, ...data.followerDetails]);
      } else {
        console.error("Failed to fetch members");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching members
    }
  };

  useEffect(() => {
    fetchMembers(activePage.current);
  }, []);

  console.log('membersss', members);

  const updateFollowers = () => {
    console.log('Update Followers');
    activePage.current++;
    fetchMembers(activePage.current);
  };

  return (
    <div style={{ width: '100%', padding: '0% 5%' }}>
      <div style={{
        paddingBottom: '2em',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '25px',
      }}>
        <div className='bg-[#cef3df] p-4 rounded-lg mb-3 '>
          <h2 className='text-[#136175] mb-2 text-3xl md:text-4xl font-bold'>Followers</h2>
          <p className='text-base md:text-lg text-[#136175]' >
            {`See who’s following you and connect with your audience.`}
          </p>
        </div>
        {loading ? ( // Conditionally render loading message
          <div style={{ textAlign: 'center' }}> Loading...</div>
        ) : members !== undefined && members.length > 0 ? (
          <>
            <div style={{ marginTop: '15px', display: 'flex', gap: '30px', flexWrap: 'wrap', margin: '5%' }}>
              {members.map((member) => (
                <Profilecard key={member._id} member={member} name='follow' />
              ))}
            </div>
            {activePage.current < totalFollowers / LIMIT && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button className="load-more-button" onClick={updateFollowers}>
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>No Followers</div>
        )}

      </div>
    </div>
  );
};
