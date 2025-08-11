import React, { useState, useEffect, useRef } from 'react';
import { HiMiniUserPlus } from "react-icons/hi2";
import PageTitle from '../PageTitle';
import Profilecard from '../Profilecard';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import baseUrl from "../../config";

export const Following = () => {
  const title = 'Following';
  const icon = <HiMiniUserPlus style={{ color: '#174873' }} />;
  const [members, setMembers] = useState([]);
  const [cookie, setCookie] = useCookies(['access_token']);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const LIMIT = 6;
  const [totalFollowing, setTotalFollowing] = useState(0);
  const activePage = useRef(1);
  const profile = useSelector((state) => state.profile);
  // const member = useSelector((state) => state.member);

  const fetchMembers = async (page) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/alumni/${id}/following?page=${page}&size=${LIMIT}`);
      if (response.ok) {
        const data = await response.json();
        setTotalFollowing(data.totalFollowing);
        setMembers(prevMembers => [...prevMembers, ...data.followingDetails]);
      } else {
        console.error("Failed to fetch members");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(activePage.current);
  }, []);

  const updateFollowing = () => {
    activePage.current++;
    fetchMembers(activePage.current);
  }

  return (
    <div style={{ width: '100%', padding: '0% 5%' }}>
      <div  style={{
        paddingBottom: '2em',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '25px',
      }}>
        <div className='bg-[#cef3df] p-4 rounded-lg mb-3 '>
          <h2 className='text-[#136175] mb-2 text-3xl md:text-4xl font-bold'>Following</h2>
          <p className='text-base md:text-lg text-[#136175]' >
            {`View the profiles you’re following and stay connected.`}
          </p>
        </div>
          {/* <PageTitle title={title} icon={icon} /> */}
          {loading && (
            <div style={{ textAlign: 'center' }}> Loading...</div>
          )}
          {members.length > 0 && !loading && (
            <div style={{ marginTop: '15px', display: 'flex', gap: '30px', flexWrap: 'wrap', margin: '5%' }}>
              {members.map((member) => (
                <Profilecard key={member._id} member={member} name='follow' />
              ))}
            </div>
          )}
          {members.length === 0 && !loading && (
            <div style={{ textAlign: 'center' }}>No Following</div>
          )}
          {activePage.current < totalFollowing / LIMIT && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button className="load-more-button" onClick={updateFollowing}>
                Load More
              </button>
            </div>
          )}
      </div>
    </div>
  )
}
